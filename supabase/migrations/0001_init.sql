-- Teamingful: first schema. Run this in the Supabase SQL editor (or `supabase db push`).

-- ---------------------------------------------------------------- tables

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  title text,
  organization text,
  orcid text,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  location text,
  starts_on date,
  ends_on date,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);
-- Only one active event per owner.
create unique index events_one_active_per_owner
  on public.events (owner_id) where is_active;

create table public.people (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  full_name text not null,
  title text,
  organization text,
  email text,
  phone text,
  orcid text,
  linkedin_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  event_id uuid references public.events (id) on delete set null,
  met_on date default current_date,
  summary text,
  -- random, url-safe token for the share link /t/<token>
  share_token text not null unique
    default (replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  share_enabled boolean not null default true,
  followup_done boolean not null default false,
  created_at timestamptz not null default now()
);

-- The other people in the team, as the owner's contacts.
create table public.team_people (
  team_id uuid not null references public.teams (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  primary key (team_id, person_id)
);

-- Accounts that joined via the share link (plus the owner).
create table public.team_members (
  team_id uuid not null references public.teams (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create table public.captures (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  team_id uuid references public.teams (id) on delete set null,
  kind text not null check (kind in ('card', 'badge', 'slide', 'poster', 'voice', 'note')),
  storage_path text,
  text_content text,
  ai_extract jsonb,
  created_at timestamptz not null default now()
);

create table public.promises (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  text text not null,
  owed_by text not null check (owed_by in ('owner', 'other')),
  due_on date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.team_files (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams (id) on delete cascade,
  uploaded_by uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- helpers
-- security definer so policies can look at team_members without recursing.

create function public.is_team_owner(t uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.teams where id = t and owner_id = auth.uid());
$$;

create function public.is_team_member(t uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.team_members where team_id = t and user_id = auth.uid());
$$;

create function public.shares_team_with(other uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.team_members a
    join public.team_members b on a.team_id = b.team_id
    where a.user_id = auth.uid() and b.user_id = other
  );
$$;

-- ---------------------------------------------------------------- triggers

-- Create a profile row when someone signs up.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Add the owner as a team member when a team is created.
create function public.handle_new_team() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.team_members (team_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger on_team_created
  after insert on public.teams
  for each row execute function public.handle_new_team();

-- ---------------------------------------------------------------- row level security

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.people enable row level security;
alter table public.teams enable row level security;
alter table public.team_people enable row level security;
alter table public.team_members enable row level security;
alter table public.captures enable row level security;
alter table public.promises enable row level security;
alter table public.team_files enable row level security;

-- profiles: own row, plus people who share a team with you (read only)
create policy "profiles read own or teammates" on public.profiles
  for select using (id = auth.uid() or public.shares_team_with(id));
create policy "profiles insert own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles update own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- events, people, captures: owner only
create policy "events owner" on public.events
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "people owner" on public.people
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "captures owner" on public.captures
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- teams: owner full access, members read
create policy "teams owner" on public.teams
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "teams members read" on public.teams
  for select using (public.is_team_member(id));

-- team_people: follows the team owner
create policy "team_people owner" on public.team_people
  for all using (public.is_team_owner(team_id)) with check (public.is_team_owner(team_id));

-- team_members: members read their teams' rows, owner manages
create policy "team_members read" on public.team_members
  for select using (public.is_team_member(team_id));
create policy "team_members owner manages" on public.team_members
  for all using (public.is_team_owner(team_id)) with check (public.is_team_owner(team_id));

-- promises: owner and members read and add; creator or team owner edits and deletes
create policy "promises read" on public.promises
  for select using (public.is_team_member(team_id) or public.is_team_owner(team_id));
create policy "promises add" on public.promises
  for insert with check (
    created_by = auth.uid()
    and (public.is_team_member(team_id) or public.is_team_owner(team_id))
  );
create policy "promises edit" on public.promises
  for update using (created_by = auth.uid() or public.is_team_owner(team_id))
  with check (created_by = auth.uid() or public.is_team_owner(team_id));
create policy "promises delete" on public.promises
  for delete using (created_by = auth.uid() or public.is_team_owner(team_id));

-- team_files: same rules as promises
create policy "team_files read" on public.team_files
  for select using (public.is_team_member(team_id) or public.is_team_owner(team_id));
create policy "team_files add" on public.team_files
  for insert with check (
    uploaded_by = auth.uid()
    and (public.is_team_member(team_id) or public.is_team_owner(team_id))
  );
create policy "team_files edit" on public.team_files
  for update using (uploaded_by = auth.uid() or public.is_team_owner(team_id))
  with check (uploaded_by = auth.uid() or public.is_team_owner(team_id));
create policy "team_files delete" on public.team_files
  for delete using (uploaded_by = auth.uid() or public.is_team_owner(team_id));
