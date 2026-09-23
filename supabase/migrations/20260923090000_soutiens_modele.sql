-- Soutenir un réseau ne demande pas de pseudo : un soutien par navigateur, comme les reprises.
drop table public.soutiens;
create table public.soutiens (
  reseau uuid not null references public.reseaux (id) on delete cascade,
  empreinte text not null,
  cree_le timestamptz not null default now(),
  primary key (reseau, empreinte)
);
alter table public.soutiens enable row level security;
create trigger soutiens_compte after insert or delete on public.soutiens for each row execute function public.compter_soutiens();
revoke insert, update, delete, truncate on public.soutiens from anon, authenticated;

-- Les habitants et les emplois par carreau, et les arrêts actuels, dont la fonction « communaute »
-- a besoin pour recalculer les lignes tracées. Personne ne les lit depuis le site.
create table public.modele (
  ville text primary key references public.villes (slug),
  carreaux jsonb not null,
  arrets jsonb not null,
  maj timestamptz not null default now()
);
alter table public.modele enable row level security;
revoke all on public.modele from anon, authenticated;
