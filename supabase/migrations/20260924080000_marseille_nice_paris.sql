-- Marseille, Nice et Paris ouvrent en tracé libre : leurs réseaux peuvent être publiés. Les données de
-- leur modèle sont déposées dans public.modele par l'action « deposer » de la fonction « communaute ».
insert into public.villes (slug, nom, ouverte)
values ('marseille', 'Marseille', true), ('nice', 'Nice', true), ('paris', 'Paris', true)
on conflict (slug) do update set ouverte = excluded.ouverte;
