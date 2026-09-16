# Catalogo come codice

Il Catalogo vive nel repository, un file per Tecnologia validato con Zod, ed è sincronizzato su
Supabase a ogni deploy; non esiste un pannello di amministrazione. Ogni modifica passa da una PR
con validazione in CI, e il deploy avvia l'Importazione iniziale delle Tecnologie nuove. Il
database è quindi una copia del Catalogo, non la sua fonte di verità.

Le Correzioni di rilevanza fanno eccezione: riguardano singole Release, si fanno direttamente sul
database e nessun Rilevamento le sovrascrive. Una Tecnologia rimossa dal Catalogo viene ritirata,
mai cancellata, per non perdere pagine pubbliche e Dashboard degli Sviluppatori.
