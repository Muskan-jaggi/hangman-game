-- Run this in your Supabase SQL Editor
create table players (
  id              bigint generated always as identity primary key,
  name            text unique not null,
  games_played    int  not null default 0,
  games_won       int  not null default 0,
  current_streak  int  not null default 0,
  max_streak      int  not null default 0,
  created_at      timestamptz default now()
);
