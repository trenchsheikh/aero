import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(join(__dirname, '../supabase/migrations/001_initial_schema.sql'), 'utf8');

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

await client.connect();
console.log('Connected to Supabase. Running migration...');
await client.query(sql);
console.log('Schema pushed successfully.');
await client.end();
