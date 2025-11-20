import { db } from "./db";
import { sql } from "drizzle-orm";

async function createTables() {
  try {
    console.log("Creating tables...");
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reading_plan_templates (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        duration INTEGER NOT NULL,
        category TEXT,
        difficulty TEXT,
        schedule JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS achievements (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        category TEXT,
        xp_reward INTEGER NOT NULL DEFAULT 0,
        requirement TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL,
        achievement_id VARCHAR NOT NULL,
        progress INTEGER DEFAULT 0,
        is_unlocked BOOLEAN DEFAULT FALSE,
        unlocked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    console.log("Tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    process.exit(0);
  }
}

createTables();
