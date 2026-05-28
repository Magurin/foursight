-- Require users to choose their own username.
--
-- Previously new profiles defaulted their username to the local part of the
-- email (split_part(email, '@', 1)), which leaked email handles onto the public
-- leaderboard. This migration stops deriving usernames from email, clears the
-- existing email-derived values, and validates user-chosen names.

-- 1. New users start with no username — the app forces them to pick one.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2. Clear all existing usernames (every current value was email-derived).
--    The leaderboard view already filters `where username is not null`, so
--    these rows drop off the board until the owner picks a real nickname.
update public.profiles set username = null;

-- 3. Validate chosen usernames: 3-20 chars, letters/digits/underscore.
alter table public.profiles drop constraint if exists profiles_username_format;
alter table public.profiles add constraint profiles_username_format
  check (username is null or username ~ '^[A-Za-z0-9_]{3,20}$');

-- 4. Case-insensitive uniqueness (prevents "Bob" vs "bob" collisions).
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));
