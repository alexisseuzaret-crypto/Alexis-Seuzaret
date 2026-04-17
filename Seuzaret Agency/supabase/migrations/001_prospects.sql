create table if not exists prospects (
  id              uuid primary key default gen_random_uuid(),
  nom             text not null,
  secteur         text not null,
  ville           text not null,
  tel             text,
  email           text,
  site_actuel     text,
  adresse         text,
  rating          numeric(2,1),
  reviews_count   integer,
  place_id        text unique,
  url_generee     text,
  statut          text not null default 'genere',
  offre           text,
  date_creation   timestamptz not null default now(),
  date_envoi      timestamptz,
  date_paiement   timestamptz,
  notes           text
);

-- Index pour les filtres dashboard
create index on prospects (statut);
create index on prospects (secteur);
create index on prospects (ville);

-- RLS: lecture publique avec anon key (dashboard)
alter table prospects enable row level security;

create policy "Lecture publique" on prospects
  for select using (true);

create policy "Écriture service key uniquement" on prospects
  for all using (auth.role() = 'service_role');
