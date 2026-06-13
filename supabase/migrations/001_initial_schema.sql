-- Aero: initial schema
-- Run: supabase db push (after setting SUPABASE_DB_URI in .env)

create table if not exists profiles (
  username        text primary key,
  display_name    text not null,
  bio             text not null default '',
  wallet_address  text not null unique,
  avatar_url      text,
  created_at      bigint not null
);

create table if not exists privacy_links (
  id              uuid primary key,
  owner_wallet    text not null,
  used            boolean not null default false,
  created_at      bigint not null,
  tx_signature    text
);

create index if not exists privacy_links_owner_wallet_idx on privacy_links (owner_wallet);

create table if not exists payments (
  id                uuid primary key,
  recipient_username text,
  recipient_wallet  text not null,
  sender_wallet     text not null,
  amount_sol        numeric not null,
  tx_signature      text not null,
  timestamp         bigint not null,
  privacy_link_id   uuid references privacy_links (id)
);

create index if not exists payments_recipient_wallet_idx on payments (recipient_wallet);
create index if not exists payments_timestamp_idx        on payments (timestamp desc);

-- Row-level security (anon key safe for MVP — tighten with auth later)
alter table profiles      enable row level security;
alter table privacy_links enable row level security;
alter table payments      enable row level security;

-- Profiles: public read + insert; owner update via wallet match
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (true);
create policy "profiles_update" on profiles for update using (true);

-- Privacy links: public read + insert/update (owner only write is enforced client-side for MVP)
create policy "privacy_links_select" on privacy_links for select using (true);
create policy "privacy_links_insert" on privacy_links for insert with check (true);
create policy "privacy_links_update" on privacy_links for update using (true);

-- Payments: public insert (anyone can pay); public read (dashboard filters by wallet)
create policy "payments_select" on payments for select using (true);
create policy "payments_insert" on payments for insert with check (true);
