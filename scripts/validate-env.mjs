import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { Client } from 'pg';

function maskStatus(value) {
  return value ? `SET(len=${value.length})` : 'EMPTY';
}

function printVar(name, value) {
  console.log(`${name}: ${maskStatus(value)}`);
}

async function checkSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('\n[Supabase env]');
  printVar('SUPABASE_URL', url || '');
  printVar('SUPABASE_ANON_KEY', anonKey || '');
  printVar('SUPABASE_SERVICE_ROLE_KEY', serviceKey || '');

  if (!url || !anonKey) {
    console.log('SUPABASE_TEST: SKIPPED (missing URL/ANON)');
    return;
  }

  try {
    const supabase = createClient(url, anonKey);
    const { error } = await supabase.storage.from('bible-audio').list('PT/ARC/rt', { limit: 1 });

    if (error) {
      console.log(`SUPABASE_TEST: ERROR (${error.message})`);
    } else {
      console.log('SUPABASE_TEST: OK');
    }
  } catch (error) {
    console.log(`SUPABASE_TEST: EXCEPTION (${error.message})`);
  }
}

async function checkDatabase() {
  const dbUrl = process.env.SUPABASE_DATABASE_URL;

  console.log('\n[Database env]');
  printVar('SUPABASE_DATABASE_URL', dbUrl || '');

  if (!dbUrl) {
    console.log('DB_TEST: SKIPPED (missing SUPABASE_DATABASE_URL)');
    return;
  }

  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    await client.query('SELECT 1');
    console.log('DB_TEST: OK');
  } catch (error) {
    console.log(`DB_TEST: ERROR (${error.message})`);
  } finally {
    await client.end().catch(() => {});
  }
}

async function main() {
  console.log('=== Environment Validation ===');
  await checkSupabase();
  await checkDatabase();
}

await main();
