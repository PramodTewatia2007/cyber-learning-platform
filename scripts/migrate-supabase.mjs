import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const dbPassword = process.argv[2] || process.env.SUPABASE_DB_PASSWORD;
  const dbUrl = process.env.DATABASE_URL;

  let connectionString = dbUrl;

  if (!connectionString) {
    if (!dbPassword) {
      console.error('\n❌ Missing database password or connection string.\n');
      console.log('Usage:');
      console.log('  node scripts/migrate-supabase.mjs <your-supabase-db-password>\n');
      console.log('Or set SUPABASE_DB_PASSWORD in .env.local\n');
      process.exit(1);
    }

    // Default Supabase project host for project iyszdyxrmtlmjnulbfsz
    const projectRef = 'iyszdyxrmtlmjnulbfsz';
    connectionString = `postgres://postgres:${encodeURIComponent(dbPassword)}@db.${projectRef}.supabase.co:5432/postgres`;
  }

  console.log('🔌 Connecting to Supabase PostgreSQL database...');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log('✅ Connected successfully to Supabase PostgreSQL!');

    const sqlPath = path.join(__dirname, '..', 'supabase', 'all_in_one_setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Running database schema & seed migration...');
    await client.query(sql);

    console.log('\n🎉 ALL DONE! Successfully executed schema, security policies, grants, and seed data.');
    console.log('   - 7 Tables created with Row Level Security');
    console.log('   - 6 Canonical Tracks seeded');
    console.log('   - 12 Cybersecurity Courses active');
    console.log('   - User progress, bookmarks & notes sync enabled\n');

  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
