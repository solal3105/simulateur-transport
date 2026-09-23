-- Toulouse ouvre en tracé libre : ses réseaux peuvent être publiés. Les données de son modèle sont
-- déposées dans public.modele par l'action « deposer » de la fonction « communaute ».
update public.villes set ouverte = true where slug = 'toulouse';
