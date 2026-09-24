-- Le jeu libre : un réseau construit sans budget à tenir peut être publié, mais il est marqué comme tel et
-- listé à part des réseaux qui tiennent le budget. La fonction « communaute » remplit la colonne à partir de
-- la partie publiée, jamais de ce qu'envoie le navigateur. Les index des listes tiennent compte de la
-- colonne ; les anciens restent en place, sans gêner.
alter table public.reseaux add column if not exists libre boolean not null default false;

create index if not exists reseaux_populaires_libre on public.reseaux (ville, libre, soutiens desc, cree_le desc) where not masque and visibilite = 'publique';
create index if not exists reseaux_recents_libre on public.reseaux (ville, libre, cree_le desc) where not masque and visibilite = 'publique';
