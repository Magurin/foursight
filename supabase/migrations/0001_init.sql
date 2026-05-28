-- FourSight initial schema
-- Run in the Supabase SQL editor (or `supabase db push`).

create extension if not exists "uuid-ossp";

-- Profiles: one row per auth user. Created automatically by the trigger below.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  elo int not null default 1200,
  pro boolean not null default false,
  created_at timestamptz not null default now()
);

-- Matches: one row per completed (or in-progress) game.
-- `moves` is the ordered list of columns played (0..6).
create table if not exists public.matches (
  id uuid primary key default uuid_generate_v4(),
  player_one uuid references public.profiles(id) on delete set null,
  player_two uuid references public.profiles(id) on delete set null,
  mode text not null check (mode in ('local','ai','online')),
  ai_difficulty text check (ai_difficulty in ('easy','medium','hard')),
  winner smallint check (winner in (0,1,2)), -- 0 = draw, 1/2 = player number, null = unfinished
  moves int[] not null default '{}',
  rated boolean not null default false,
  elo_delta int,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists matches_player_one_idx on public.matches(player_one);
create index if not exists matches_player_two_idx on public.matches(player_two);
create index if not exists matches_created_at_idx on public.matches(created_at desc);

-- Realtime rooms for online play (M5).
create table if not exists public.rooms (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  host_id uuid references public.profiles(id) on delete set null,
  guest_id uuid references public.profiles(id) on delete set null,
  moves int[] not null default '{}',
  status text not null default 'waiting' check (status in ('waiting','playing','finished','abandoned')),
  winner smallint,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists rooms_code_idx on public.rooms(code);
create index if not exists rooms_status_idx on public.rooms(status);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.rooms   enable row level security;

drop policy if exists "profiles read all" on public.profiles;
create policy "profiles read all" on public.profiles for select using (true);

drop policy if exists "profiles upsert own" on public.profiles;
create policy "profiles upsert own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "matches read participants" on public.matches;
create policy "matches read participants" on public.matches
  for select using (
    auth.uid() = player_one or auth.uid() = player_two or mode = 'online'
  );

drop policy if exists "matches insert own" on public.matches;
create policy "matches insert own" on public.matches
  for insert with check (auth.uid() = player_one or auth.uid() = player_two);

drop policy if exists "rooms read all" on public.rooms;
create policy "rooms read all" on public.rooms for select using (true);

drop policy if exists "rooms insert any auth" on public.rooms;
create policy "rooms insert any auth" on public.rooms for insert with check (auth.uid() is not null);

drop policy if exists "rooms update participants" on public.rooms;
create policy "rooms update participants" on public.rooms
  for update using (auth.uid() = host_id or auth.uid() = guest_id or guest_id is null);

-- Auto-create a profile on signup.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Leaderboard view: top 100 rated players by ELO.
create or replace view public.leaderboard as
  select id, username, elo, pro
  from public.profiles
  where username is not null
  order by elo desc
  limit 100;
