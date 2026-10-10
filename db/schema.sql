create table if not exists users (
  id serial primary key, username text unique not null, email text unique not null,
  password_hash text not null, first_name text, last_name text, phone text, created_at timestamptz default now());
create table if not exists vehicles (
  lot int primary key, slug text unique not null, title text, make text, model text, location text, area text,
  type text, category text, colour text, fuel text, transmission text, odometer int default 0,
  starts bool, drives bool, has_keys bool, has_v5 bool, opening int default 0, price int default 0, increment int default 10,
  started_at timestamptz default now(), ends_at timestamptz not null, image text, images text[] default '{}',
  detail jsonb default '{}', cats text[] default '{}', featured bool default false);
create index if not exists vehicles_ends on vehicles(ends_at);
create table if not exists bids (
  id serial primary key, lot int references vehicles(lot) on delete cascade, user_id int references users(id),
  amount int not null, created_at timestamptz default now());
create index if not exists bids_lot on bids(lot, amount desc);
create table if not exists pages (path text primary key, title text, description text, html text);
create table if not exists news (path text primary key, title text, description text, image text, published date, html text);
create table if not exists enquiries (id serial primary key, data jsonb not null, created_at timestamptz default now());
create table if not exists settings (key text primary key, value text not null);
create table if not exists testimonials (
  id serial primary key, name text not null, location text default '', body text not null, rating int default 5,
  published bool default true, created_at timestamptz default now());
alter table news add column if not exists body text;
create table if not exists images (id serial primary key, mime text not null, data bytea not null, created_at timestamptz default now());
