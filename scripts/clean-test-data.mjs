import pg from 'pg';
const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

const all = await client.query('SELECT username, wallet_address FROM profiles');
console.log('Current profiles:', all.rows);

const del = await client.query(
  "DELETE FROM profiles WHERE wallet_address = '11111111111111111111111111111111' RETURNING username"
);
console.log('Deleted stale test rows:', del.rows);

await client.end();
