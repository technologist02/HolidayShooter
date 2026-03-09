create table if not exists game_scores (
  id bigserial primary key,
  player_name varchar(20) not null,
  mode_id varchar(32) not null,
  score integer not null check (score >= 0),
  wave integer not null check (wave >= 1),
  ended_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_game_scores_mode_score_ended
  on game_scores (mode_id, score desc, ended_at asc);

create index if not exists idx_game_scores_score_ended
  on game_scores (score desc, ended_at asc);

create index if not exists idx_game_scores_created_at
  on game_scores (created_at desc);
