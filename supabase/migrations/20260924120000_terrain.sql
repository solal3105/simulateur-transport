-- Le terrain de chaque réseau (relief et grands cours d'eau), pour que la fonction « communaute » calcule le
-- coût d'une ligne comme le site : tunnels sous les collines, ponts sur les fleuves. Déposé par l'action
-- « deposer-terrain ».
alter table public.modele add column if not exists terrain jsonb;
