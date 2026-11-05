-- Teamingful step 2: capture + AI reading. Run after 0001_init.sql.

-- captures: reading status, error, cost log, file paths
alter table public.captures
  add column status text not null default 'ready'
    check (status in ('reading', 'ready', 'failed')),
  add column error text,
  add column usage jsonb,
  add column audio_path text,
  add column photo_paths text[] not null default '{}';

-- teams: free-text "Met at" for people met outside event mode
alter table public.teams add column met_at text;

-- lists
create index teams_owner_created_idx on public.teams (owner_id, created_at desc);
create index promises_team_idx on public.promises (team_id);
