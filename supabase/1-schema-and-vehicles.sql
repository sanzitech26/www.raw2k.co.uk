-- RAW2K: database schema only (no vehicles - add cars through /admin/vehicles)
begin;
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
alter table enquiries add column if not exists read bool default false;


-- Lock every table: the public anon key can read/write NOTHING. The website's server connects with the
-- Postgres connection string (DATABASE_URL), which bypasses RLS, so the app is unaffected.
alter table images enable row level security;
alter table users enable row level security;
alter table vehicles enable row level security;
alter table bids enable row level security;
alter table pages enable row level security;
alter table news enable row level security;
alter table settings enable row level security;
alter table testimonials enable row level security;
alter table enquiries enable row level security;

comment on column vehicles.lot is $q$Lot number (unique, auto-assigned by the admin form)$q$;
comment on column vehicles.slug is $q$URL slug, e.g. 2017-audi-q2-tdi-341459 (auto-built from title + lot)$q$;
comment on column vehicles.title is $q$Full advert title, e.g. 2017 AUDI Q2 TDI QUATTRO S LINE 1,968cc$q$;
comment on column vehicles.make is $q$Make, e.g. AUDI$q$;
comment on column vehicles.model is $q$Model, e.g. Q2$q$;
comment on column vehicles.location is $q$Town shown on listing cards$q$;
comment on column vehicles.area is $q$Region used by area filters, e.g. North West$q$;
comment on column vehicles.type is $q$Body type: Hatchback, Estate, Saloon, Motorcycle, SPV...$q$;
comment on column vehicles.category is $q$ABI category: N, S or Not Recorded$q$;
comment on column vehicles.colour is $q$Colour$q$;
comment on column vehicles.fuel is $q$Petrol, Diesel, Electric, Hybrid...$q$;
comment on column vehicles.transmission is $q$Manual, Automatic, Semi Auto$q$;
comment on column vehicles.odometer is $q$Indicated mileage; 0 = unknown$q$;
comment on column vehicles.starts is $q$Vehicle starts$q$;
comment on column vehicles.drives is $q$Vehicle drives$q$;
comment on column vehicles.has_keys is $q$Keys present$q$;
comment on column vehicles.has_v5 is $q$V5 log book present$q$;
comment on column vehicles.opening is $q$Opening price (whole currency units)$q$;
comment on column vehicles.price is $q$Current highest bid; starts equal to opening price$q$;
comment on column vehicles.increment is $q$Minimum bid increment$q$;
comment on column vehicles.started_at is $q$When the auction opened$q$;
comment on column vehicles.ends_at is $q$When the auction closes (timestamp with time zone)$q$;
comment on column vehicles.image is $q$Main photo URL$q$;
comment on column vehicles.images is $q$All photo URLs, main photo first$q$;
comment on column vehicles.detail is $q$JSON: area, town, stored, vat, fsh, extra, damage, viewing, delivery, premium, opening, increment$q$;
comment on column vehicles.cats is $q$Category pages: car-auctions, bikes-auctions, caravans-auctions, machinery-auctions$q$;
comment on column vehicles.featured is $q$Show in home page top picks$q$;
commit;
