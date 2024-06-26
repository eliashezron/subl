create table if not exists
  Exercises (
    id bigint primary key generated always as identity,
    exercise_name text,
    unique (exercise_name)
  );

create table
  Resolutions (
    id bigint primary key generated always as identity,
    user_name text,
    exercise_id bigint references Exercises (id),
    resolution_date timestamp with time zone default current_timestamp,
    unique (user_name, exercise_id)
  );