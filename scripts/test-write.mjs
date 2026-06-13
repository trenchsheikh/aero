import { createClient } from '@supabase/supabase-js';

const url = 'https://pzitkydyzlwhcgtlcyey.supabase.co';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!key) { console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY not set'); process.exit(1); }

const supabase = createClient(url, key);

const ts = Date.now();
const testUsername = `_test_${ts}`;
const testWallet   = `TestWallet${ts}`;

// 1. INSERT profile
console.log('1. Inserting test profile...');
const { error: insErr } = await supabase.from('profiles').insert({
  username:       testUsername,
  display_name:   'Test User',
  bio:            'automated test',
  wallet_address: testWallet,
  created_at:     ts,
});
if (insErr) { console.error('INSERT failed:', insErr.message, insErr.details, insErr.hint); process.exit(1); }
console.log('   INSERT OK');

// 2. SELECT it back
console.log('2. Reading back...');
const { data: sel, error: selErr } = await supabase.from('profiles').select('*').eq('username', testUsername).maybeSingle();
if (selErr || !sel) { console.error('SELECT failed:', selErr?.message ?? 'row not found'); process.exit(1); }
console.log('   SELECT OK:', sel.display_name, '/', sel.wallet_address);

// 3. UPSERT (update) via wallet_address conflict
console.log('3. Testing upsert by wallet...');
const { error: upErr } = await supabase.from('profiles').upsert(
  { username: testUsername, display_name: 'Updated Name', bio: 'updated', wallet_address: testWallet, created_at: ts },
  { onConflict: 'wallet_address' }
);
if (upErr) { console.error('UPSERT failed:', upErr.message); process.exit(1); }
console.log('   UPSERT OK');

// 4. DELETE cleanup
console.log('4. Cleaning up...');
const { error: delErr } = await supabase.from('profiles').delete().eq('username', testUsername);
if (delErr) { console.error('DELETE failed:', delErr.message); process.exit(1); }
console.log('   DELETE OK');

console.log('\nAll DB write tests passed. Supabase is fully operational.');
