-- Shop economy + cosmetics, and reset all ratings to start from 0.
--
-- Adds a coin balance (earned from wins), purchased-item ownership, and the
-- three equipped cosmetic slots (player discs, opponent discs, board theme).
-- Also changes the rating defaults from 1200 to 0 and zeroes existing rows.

alter table public.profiles
  add column if not exists coins int not null default 0,
  add column if not exists cosmetic_player text,
  add column if not exists cosmetic_opponent text,
  add column if not exists cosmetic_board text,
  add column if not exists owned_cosmetics text[] not null default '{}';

-- Ratings now start from 0 for everyone.
alter table public.profiles
  alter column elo set default 0,
  alter column elo_pve set default 0,
  alter column elo_pvp set default 0;

update public.profiles
  set elo = 0, elo_pve = 0, elo_pvp = 0;
