-- Le cinque tabelle delle Notifiche al service role (#188, #169, #172).
--
-- `20260922074205_service_role_grants.sql` lo dice gia': il progetto remoto non espone le tabelle
-- nuove al service role come fanno i privilegi di default in locale, quindi il grant va scritto a
-- mano. Quell'elenco si e' fermato alle sette tabelle che esistevano quel giorno, e le cinque nate
-- dopo non ci sono mai entrate: in produzione il service role non poteva toccarne nessuna.
--
-- Cosa significava, misurato dal log della funzione il 2026-10-28:
-- `slack oauth: write failed 42501 permission denied for table notification_secrets`. Lo scambio
-- OAuth con Slack riusciva, Slack creava il webhook per davvero, e la scrittura veniva rifiutata.
-- Lo stesso valeva per il job che registra le Notifiche e per quello che segna le consegne.
--
-- ⚠️ **Nessuna prova in locale puo' cogliere questo**, e per questo e' arrivato fino in produzione:
-- in locale i privilegi di default coprono il service role, quindi le 70 prove di integrazione
-- passano scrivendo su tabelle che in produzione erano chiuse. L'unico presidio e' questo elenco,
-- e va allungato ogni volta che nasce una tabella.
--
-- I quattro permessi come per le altre sette, non meno: una cancellazione di account scende per
-- cascata da `auth.users`, e il service role e' chi la esegue.

grant select, insert, update, delete on public.notifications, public.notification_settings,
  public.notification_preferences, public.notification_secrets, public.notification_deliveries
  to service_role;
