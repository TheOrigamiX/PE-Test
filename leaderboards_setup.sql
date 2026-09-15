-- วางทั้งหมดนี้ใน Supabase Dashboard -> SQL Editor -> New query -> Run ครั้งเดียวจบ

create table if not exists leaderboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  score int not null,
  duration_sec int not null,
  elapsed int,
  created_at timestamptz not null default now()
);

alter table leaderboards enable row level security;

create policy "anyone can read leaderboard"
on leaderboards for select
to anon, authenticated
using (true);

create policy "logged in users can insert their own score"
on leaderboards for insert
to authenticated
with check (auth.uid() = user_id);

-- ตารางเก็บข้อมูลผู้เล่น (คริสตัล/ของสะสมกาชา) ผูกกับบัญชี ไม่แตะ localStorage แล้ว
create table if not exists player_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gacha jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table player_state enable row level security;

create policy "user can read own player state"
on player_state for select
to authenticated
using (auth.uid() = user_id);

create policy "user can insert own player state"
on player_state for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user can update own player state"
on player_state for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
