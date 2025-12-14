import { db } from './db';
import { notificationPreferences, users } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';
import { sendPushNotification, getRandomInsight } from './push-notifications';

const CHECK_INTERVAL_MS = 60000;
const lastSentCache = new Map<string, string>();

function getCurrentTimeInTimezone(timezone: string): { hour: number; minute: number; dayOfWeek: number } {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      weekday: 'short',
    });
    
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
    const weekday = parts.find(p => p.type === 'weekday')?.value || '';
    
    const dayMap: Record<string, number> = {
      'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
    };
    
    return { hour, minute, dayOfWeek: dayMap[weekday] || 0 };
  } catch {
    const now = new Date();
    return { hour: now.getHours(), minute: now.getMinutes(), dayOfWeek: now.getDay() };
  }
}

function shouldSendNotification(
  prefTime: string,
  currentHour: number,
  currentMinute: number,
  isWeekendOnly: boolean,
  dayOfWeek: number,
  userId: string,
  notificationType: string
): boolean {
  const [prefHour, prefMinute] = prefTime.split(':').map(Number);
  
  if (isWeekendOnly && dayOfWeek !== 0 && dayOfWeek !== 6) {
    return false;
  }
  
  if (prefHour !== currentHour || Math.abs(prefMinute - currentMinute) > 1) {
    return false;
  }
  
  const cacheKey = `${userId}-${notificationType}-${new Date().toDateString()}`;
  if (lastSentCache.get(cacheKey)) {
    return false;
  }
  
  return true;
}

function markAsSent(userId: string, notificationType: string): void {
  const cacheKey = `${userId}-${notificationType}-${new Date().toDateString()}`;
  lastSentCache.set(cacheKey, new Date().toISOString());
  
  const today = new Date().toDateString();
  const keysToDelete: string[] = [];
  lastSentCache.forEach((_, key) => {
    if (!key.includes(today)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => lastSentCache.delete(key));
}

async function checkAndSendNotifications(): Promise<void> {
  try {
    const allPrefs = await db.select().from(notificationPreferences);
    
    for (const prefs of allPrefs) {
      const timezone = prefs.timezone || 'America/Sao_Paulo';
      const { hour, minute, dayOfWeek } = getCurrentTimeInTimezone(timezone);
      
      if (prefs.readingReminders && prefs.readingReminderTime) {
        if (shouldSendNotification(
          prefs.readingReminderTime,
          hour,
          minute,
          prefs.weekendOnly || false,
          dayOfWeek,
          prefs.userId,
          'reading'
        )) {
          const insight = getRandomInsight('reading');
          await sendPushNotification(prefs.userId, {
            title: 'Hora da Leitura Bíblica',
            body: insight,
            icon: '/icons/bible-icon.png',
            tag: 'reading-reminder',
            data: { type: 'reading', url: '/bible' },
            actions: [
              { action: 'open', title: 'Ler Agora' },
              { action: 'dismiss', title: 'Depois' }
            ],
          });
          markAsSent(prefs.userId, 'reading');
          console.log(`[Scheduler] Sent reading reminder to user ${prefs.userId}`);
        }
      }
      
      if (prefs.prayerReminders && prefs.prayerReminderTime) {
        if (shouldSendNotification(
          prefs.prayerReminderTime,
          hour,
          minute,
          prefs.weekendOnly || false,
          dayOfWeek,
          prefs.userId,
          'prayer'
        )) {
          const insight = getRandomInsight('prayer');
          await sendPushNotification(prefs.userId, {
            title: 'Momento de Oração',
            body: insight,
            icon: '/icons/prayer-icon.png',
            tag: 'prayer-reminder',
            data: { type: 'prayer', url: '/prayers' },
            actions: [
              { action: 'open', title: 'Orar Agora' },
              { action: 'dismiss', title: 'Depois' }
            ],
          });
          markAsSent(prefs.userId, 'prayer');
          console.log(`[Scheduler] Sent prayer reminder to user ${prefs.userId}`);
        }
      }
      
      if (prefs.dailyVerseNotification && prefs.dailyVerseTime) {
        if (shouldSendNotification(
          prefs.dailyVerseTime,
          hour,
          minute,
          prefs.weekendOnly || false,
          dayOfWeek,
          prefs.userId,
          'daily-verse'
        )) {
          await sendPushNotification(prefs.userId, {
            title: 'Versículo do Dia',
            body: 'Um novo versículo inspirador está esperando por você!',
            icon: '/icons/verse-icon.png',
            tag: 'daily-verse',
            data: { type: 'daily-verse', url: '/' },
            actions: [
              { action: 'open', title: 'Ver Versículo' }
            ],
          });
          markAsSent(prefs.userId, 'daily-verse');
          console.log(`[Scheduler] Sent daily verse to user ${prefs.userId}`);
        }
      }
    }
  } catch (error) {
    console.error('[Scheduler] Error checking notifications:', error);
  }
}

let schedulerInterval: NodeJS.Timeout | null = null;

export function startNotificationScheduler(): void {
  if (schedulerInterval) {
    console.log('[Scheduler] Already running');
    return;
  }
  
  console.log('[Scheduler] Starting notification scheduler...');
  
  checkAndSendNotifications();
  
  schedulerInterval = setInterval(checkAndSendNotifications, CHECK_INTERVAL_MS);
  
  console.log('[Scheduler] Notification scheduler started - checking every minute');
}

export function stopNotificationScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Scheduler] Notification scheduler stopped');
  }
}
