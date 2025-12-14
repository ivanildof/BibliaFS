import webpush from 'web-push';
import { db } from './db';
import { pushSubscriptions, notificationPreferences, notificationHistory, users } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contato@bibliasf.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('[Push] VAPID keys configured successfully');
} else {
  console.log('[Push] VAPID keys not configured - push notifications disabled');
}

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

export async function initPushTables(): Promise<void> {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        endpoint TEXT NOT NULL,
        p256dh TEXT NOT NULL,
        auth TEXT NOT NULL,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        reading_reminders BOOLEAN DEFAULT true,
        reading_reminder_time VARCHAR(5) DEFAULT '08:00',
        prayer_reminders BOOLEAN DEFAULT true,
        prayer_reminder_time VARCHAR(5) DEFAULT '07:00',
        daily_verse_notification BOOLEAN DEFAULT true,
        daily_verse_time VARCHAR(5) DEFAULT '06:00',
        community_activity BOOLEAN DEFAULT false,
        teacher_mode_updates BOOLEAN DEFAULT true,
        weekend_only BOOLEAN DEFAULT false,
        timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notification_history (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        data JSONB,
        sent_at TIMESTAMP DEFAULT NOW(),
        clicked BOOLEAN DEFAULT false,
        clicked_at TIMESTAMP
      )
    `);
    
    console.log('[Push] Notification tables initialized');
  } catch (error) {
    console.error('[Push] Error initializing tables:', error);
  }
}

export async function savePushSubscription(
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  userAgent?: string
): Promise<void> {
  await db.delete(pushSubscriptions).where(
    and(
      eq(pushSubscriptions.userId, userId),
      eq(pushSubscriptions.endpoint, subscription.endpoint)
    )
  );
  
  await db.insert(pushSubscriptions).values({
    userId,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    userAgent,
    isActive: true,
  });
}

export async function removePushSubscription(userId: string, endpoint: string): Promise<void> {
  await db.delete(pushSubscriptions).where(
    and(
      eq(pushSubscriptions.userId, userId),
      eq(pushSubscriptions.endpoint, endpoint)
    )
  );
}

export async function getNotificationPreferences(userId: string) {
  const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, userId));
  
  if (!prefs) {
    const [newPrefs] = await db.insert(notificationPreferences)
      .values({ userId })
      .returning();
    return newPrefs;
  }
  
  return prefs;
}

export async function updateNotificationPreferences(
  userId: string,
  preferences: Partial<{
    readingReminders: boolean;
    readingReminderTime: string;
    prayerReminders: boolean;
    prayerReminderTime: string;
    dailyVerseNotification: boolean;
    dailyVerseTime: string;
    communityActivity: boolean;
    teacherModeUpdates: boolean;
    weekendOnly: boolean;
    timezone: string;
  }>
) {
  const existing = await getNotificationPreferences(userId);
  
  const [updated] = await db.update(notificationPreferences)
    .set({
      ...preferences,
      updatedAt: new Date(),
    })
    .where(eq(notificationPreferences.userId, userId))
    .returning();
  
  return updated;
}

export async function sendPushNotification(
  userId: string,
  notification: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    actions?: Array<{ action: string; title: string }>;
    requireInteraction?: boolean;
  }
): Promise<{ success: boolean; sent: number; failed: number }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.log('[Push] VAPID keys not configured, skipping notification');
    return { success: false, sent: 0, failed: 0 };
  }
  
  const subscriptions = await db.select()
    .from(pushSubscriptions)
    .where(and(
      eq(pushSubscriptions.userId, userId),
      eq(pushSubscriptions.isActive, true)
    ));
  
  if (subscriptions.length === 0) {
    console.log('[Push] No active subscriptions for user:', userId);
    return { success: false, sent: 0, failed: 0 };
  }
  
  const payload = JSON.stringify(notification);
  let sent = 0;
  let failed = 0;
  
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      );
      sent++;
    } catch (error: any) {
      console.error('[Push] Error sending notification:', error.statusCode || error.message);
      
      if (error.statusCode === 410 || error.statusCode === 404) {
        await db.update(pushSubscriptions)
          .set({ isActive: false })
          .where(eq(pushSubscriptions.id, sub.id));
      }
      failed++;
    }
  }
  
  await db.insert(notificationHistory).values({
    userId,
    type: notification.tag || 'general',
    title: notification.title,
    body: notification.body,
    data: notification.data,
  });
  
  return { success: sent > 0, sent, failed };
}

export async function sendBulkNotifications(
  userIds: string[],
  notification: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    data?: any;
  }
): Promise<{ total: number; sent: number; failed: number }> {
  let totalSent = 0;
  let totalFailed = 0;
  
  for (const userId of userIds) {
    const result = await sendPushNotification(userId, notification);
    totalSent += result.sent;
    totalFailed += result.failed;
  }
  
  return { total: userIds.length, sent: totalSent, failed: totalFailed };
}

export async function markNotificationClicked(notificationId: string): Promise<void> {
  await db.update(notificationHistory)
    .set({ clicked: true, clickedAt: new Date() })
    .where(eq(notificationHistory.id, notificationId));
}

const READING_INSIGHTS = [
  "Dedique 15 minutos hoje para meditar na Palavra de Deus.",
  "A leitura bíblica transforma corações. Que tal começar agora?",
  "Cada versículo lido é uma semente plantada em seu coração.",
  "Não deixe passar o dia sem alimentar sua alma com a Palavra.",
  "A Bíblia tem uma mensagem especial para você hoje. Descubra!",
  "Sua jornada de fé cresce a cada página lida.",
  "Reserve um momento de paz para a leitura bíblica.",
  "A Palavra de Deus é lâmpada para os seus pés.",
];

const PRAYER_INSIGHTS = [
  "Comece o dia conversando com Deus em oração.",
  "A oração é o momento de intimidade com o Pai.",
  "Deus está esperando para ouvir seu coração.",
  "Reserve um tempo para agradecer pelas bênçãos recebidas.",
  "A oração sincera move montanhas.",
];

export function getRandomInsight(type: 'reading' | 'prayer'): string {
  const insights = type === 'reading' ? READING_INSIGHTS : PRAYER_INSIGHTS;
  return insights[Math.floor(Math.random() * insights.length)];
}
