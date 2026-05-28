-- Two separate ratings & leaderboards: PVE (vs AI) and PVP (online vs humans).
--
-- The single `elo` column is replaced in practice by two: one for games against
-- the AI and one for online games against other people. The legacy `elo`
-- column is kept for backward compatibility but no longer drives the boards.

alter table public.profiles
  add column if not exists elo_pve int not null default 1200,
  add column if not exists elo_pvp int not null default 1200;

-- PVE leaderboard: ranked by rating earned against the AI.
create or replace view public.leaderboard_pve as
  select id, username, elo_pve as elo, pro
  from public.profiles
  where username is not null
  order by elo_pve desc
  limit 100;

-- PVP leaderboard: ranked by rating earned in online games vs other players.
create or replace view public.leaderboard_pvp as
  select id, username, elo_pvp as elo, pro
  from public.profiles
  where username is not null
  order by elo_pvp desc
  limit 100;
