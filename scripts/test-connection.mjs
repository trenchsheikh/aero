import { createClient } from '@supabase/supabase-js';

const url  = 'https://pzitkydyzlwhcgtlcyey.supabase.co';
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!key) { console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY not set'); process.exit(1); }

const supabase = createClient(url, key);

console.log('Testing profiles table...');
const { data: p, error: pe } = await supabase.from('profiles').select('count').limit(1);
if (pe) { console.error('profiles error:', pe.message); process.exit(1); }
console.log('profiles OK');

console.log('Testing privacy_links table...');
const { data: l, error: le } = await supabase.from('privacy_links').select('count').limit(1);
if (le) { console.error('privacy_links error:', le.message); process.exit(1); }
console.log('privacy_links OK');

console.log('Testing payments table...');
const { data: pay, error: paye } = await supabase.from('payments').select('count').limit(1);
if (paye) { console.error('payments error:', paye.message); process.exit(1); }
console.log('payments OK');

console.log('\nAll tables reachable via anon key. Supabase is live.');
