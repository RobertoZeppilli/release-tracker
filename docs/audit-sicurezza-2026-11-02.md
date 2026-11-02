# Audit di sicurezza, 2026-11-02

Letto tutto il codice vivo a `648db0c`: i 13 route handler, `src/proxy.ts`, le due Server Action,
le 12 tabelle con i loro `grant` e le loro policy, i due client Supabase, il giro OAuth di Slack e
i quattro job. Metodo: categorie e soglia della skill `security-review`, soglia di confidenza 8 su
10, niente teoria.

⚠️ **Questo documento sta in un repository pubblico**, quindi dice cosa era aperto e come è stato
chiuso, e **non** come si sfruttava: nessuna istruzione pronta all'uso, qui né nei messaggi di
commit. Il presidio di una regola non è il silenzio, è il test che la prova
(`tests/integration/notifications.test.ts`).

## Il risultato in una riga

Nessuna via d'ingresso per un estraneo: non ho trovato modo di leggere i dati di un altro
Developer, di entrare senza credenziali, di far eseguire codice o di leggere un webhook. L'unico
buco vero era **verso l'alto, dentro il proprio account**, ed è chiuso.

## Il buco: i permessi di `notification_settings` (Medium, confidenza 9, chiuso)

`grant update` era concesso sulla **tabella intera**, e le policy chiedono soltanto di chi è la
riga. In quella tabella sta `external_trial_started_at`, che è il cancello dei canali esterni:
`trialOf` lo legge in `/settings`, e **il job di consegna lo rilegge per decidere se inviare**
(`deliver-slack.ts:152`). Il client del Developer poteva perciò scrivere la propria data di inizio
prova, e tenere aperti i trenta giorni a tempo indeterminato.

`startExternalTrial` si difendeva bene nel codice, leggendo prima di scrivere, così che un secondo
interruttore non spostasse la scadenza. Ma quel presidio sta nell'applicazione, e una scrittura
diretta non ci passa.

Oggi costava poco, perché Pro non si vende ancora. **Alla #174 sarebbe stato un abbonamento non
pagato**, e il codice che vende leggerà la stessa colonna.

**Come è chiuso.** La regola è quella che questo schema applica già due volte, su
`follows.current_version` (`20260930090927_current_version.sql:100`) e su `notifications.seen_at`
(`20261022170939_notifications.sql:79`): si chiude la colonna, non la tabella. Al client restano
`preferred_locale` e `updated_at`; `external_trial_started_at` e `slack_webhook_hint` passano al
service role, che scrive il webhook accanto a loro.

Due cose le ha dette il database e non la lettura del codice, ed è la ragione per cui la migrazione
è stata provata sul vero prima di esistere come file:

- l'upsert di PostgREST mette la chiave del conflitto nel `set`, quindi serve `update` anche su
  `user_id`: quattro test di integrazione sono caduti con 42501 sulla scrittura legittima prima che
  quel grant esistesse. La colonna resta blindata dalle due policy, che tengono
  `user_id = auth.uid()` sia in `using` sia in `with check`;
- `startExternalTrial` col service role non ha più la RLS a filtrargli la lettura, così la riga ora
  si nomina con `eq`: senza, quel `maybeSingle` leggeva la riga di tutti.

Il test di regressione è stato **visto rosso** riaprendo il grant: un test di permessi che non si è
visto fallire non prova niente.

## Le quattro cose da verificare su Vercel, non nel codice

Il codice fa la sua parte con il pattern giusto, che è **404 quando il segreto non c'è**, così una
rotta non configurata è indistinguibile da una che non esiste. Resta da confermare che in
produzione quelle variabili siano davvero assenti, perché quello non si legge da qui. Si guardano i
**nomi**, non i valori.

1. `E2E_AUTH_SECRET` **non** impostata. È la più importante delle quattro, perché quella rotta firma
   una sessione senza passare da GitHub.
2. `DEV_LOGIN_EMAIL` e `DEV_LOGIN_PASSWORD` **non** impostate: sono la via d'ingresso dello
   sviluppo locale.
3. `CRON_SECRET` impostata e lunga. Senza, i job rispondono 401 a tutti, cron compreso: non è un
   buco, è il rilevamento che si ferma.
4. `SUPABASE_SECRET_KEY` solo fra le variabili del server, mai col prefisso `NEXT_PUBLIC_`. Lo
   schema Zod lo rifiuta già due volte, quindi questa è una conferma.

La prova che vale più di ogni lettura è dall'esterno: le rotte sotto `/api/test/` e
`/auth/dev-sign-in` devono rispondere **404** in produzione.

## Cosa ho guardato, e cosa ho trovato

Vale scritto, perché la prossima volta si riparte da qui invece di rileggerlo.

- **RLS**: tutte e 12 le tabelle ce l'hanno attiva. Le policy `using (true)` stanno solo sulle
  cinque tabelle del Catalogo, che è pubblico per mestiere. Tutte le altre filtrano su
  `auth.uid()`, anche `notification_deliveries`, che lo fa risalendo alla Notifica.
- **Il webhook**: `revoke all on public.notification_secrets from anon, authenticated`, e nessuna
  policy. Chiuso due volte, grant e RLS, e il codice non lo rimette mai in un redirect, in un log o
  in un messaggio. Il `hint` mostra quattro caratteri.
- **OAuth Slack**: lo `state` è HMAC-SHA256 sul payload, scade in dieci minuti, rifiuta una data dal
  futuro, e il confronto è a tempo costante scritto a mano. L'identità viene da lì e **non** dai
  cookie della richiesta di ritorno, che è esattamente ciò che Slack chiede. Resta il replay entro i
  dieci minuti per chi riesce a vedere lo `state` di un altro: scelta consapevole e scritta, impatto
  limitato, non la chiamo vulnerabilità.
- **SSRF**: `isSlackWebhook` fissa l'host con `startsWith`. Schema e host non sono influenzabili, e
  un percorso con `../` resta sullo stesso host.
- **Redirect aperti**: `safeRedirectPath` respinge `//`, il backslash e i caratteri di controllo.
- **XSS**: un solo `dangerouslySetInnerHTML`, e dentro c'è una costante del tema con la chiave
  passata per `JSON.stringify`. Nessun `eval`, nessun `innerHTML`.
- **CSRF**: i route handler che scrivono sono POST e i cookie di Supabase sono `sameSite: lax`
  (`@supabase/ssr` 0.12.7), quindi un form da un altro sito non li porta. L'unico GET che scrive è
  il callback di Slack, dove il presidio è lo `state`. La cancellazione dell'account legge
  l'identità dai cookie e ricontrolla la parola sul server.
- **Autorizzazione delle pagine**: il proxy dichiara di non essere il livello di autorizzazione,
  come dice la documentazione di Next, e `/settings` e `/account` chiamano `requireAccount`,
  `/dashboard` e il Catalogo `requireDeveloper`. Next è 16.3.5, quindi il bypass del middleware del
  2025 non riguarda questa app.
- **Job**: `isAuthorizedJob` confronta un digest con `timingSafeEqual` e risponde falso quando il
  segreto manca, che è il verso giusto in cui sbagliare.
- **Segreti nei log**: nessuno. Dove il log serviva, come lo scambio del `code`, viene stampata la
  parola di Slack, e `writeReason` taglia via i `details` di PostgREST **perché quella riga contiene
  il webhook**.

## Quello che non ho fatto

- **Nessun header di sicurezza**: non c'è `Content-Security-Policy`, né `X-Frame-Options`, né
  `Referrer-Policy`, in `next.config` o altrove. Non è una falla, è un rinforzo che manca, e il CSP
  va pensato con lo script inline del tema, che chiede un nonce. Da decidere, non da applicare di
  corsa.
- **Niente provato in esecuzione, tranne la correzione**: l'audit è lettura; la migrazione invece è
  stata applicata al database locale e provata, perché sui permessi la lettura non basta.
- **Le dipendenze non le ho giudicate**: si guardano con `pnpm audit`, non leggendo il codice.
