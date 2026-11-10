# La Lista d'attesa, e la porta chiusa nel callback fino al 20 gennaio 2027

Il lancio ha una data, **mercoledì 20 gennaio 2027** (`docs/DECISIONI.md`, "Il lancio: 20 gennaio
2027"), e fino a quel giorno l'app non vende niente: i pagamenti sono la #174 e arrivano per ultimi,
scelta dell'utente il 2026-11-09. Un prodotto che accetta registrazioni mentre non ha ancora il suo
confine Free/Pro acceso raccoglie account che non può servire, e li raccoglie una volta sola: la
prima impressione non si ripete. Questo ADR fissa cosa si chiude, cosa resta aperto e perché, perché
la regola del progetto è che una regola nuova si scrive prima di codificarla.

## Cosa resta aperto, ed è la parte che conta

**Le pagine pubbliche restano pubbliche: `/`, `/technologies/*`, le pagine Release, i documenti.**
Sono 2.275 indirizzi indicizzati dopo la #192, e sono il solo canale che porta qualcuno qui. Dietro
un "coming soon" globale quell'indicizzazione si perde, e non torna il giorno in cui si riapre: la
posizione si riconquista da zero, mentre la **Lista d'attesa** resta senza niente che le porti gente.
Una landing isolata senza traffico raccoglie zero email, quindi il "coming soon" totale costa due
volte e rende una.

C'è anche la ragione di prodotto, e vale più di quella tecnica: la Lista d'attesa converte
**perché** il lettore ha appena visto un verdetto vero su una Tecnologia che usa. L'argomento della
landing è una dimostrazione, non una promessa, e la dimostrazione è nelle pagine pubbliche.

## Cosa si chiude, e dove

⚠️ **Si chiude la nascita di un account, e si chiude nel callback OAuth.** Con GitHub il login e la
registrazione sono la stessa porta: `/login` manda al consenso di GitHub, GitHub torna su
`/auth/callback`, e lì la sessione viene scritta. Non esiste una rotta "signup" da spegnere, quindi
spegnere `/login` chiuderebbe fuori anche chi ha già un account.

La forma è questa: nel callback, dopo lo scambio del codice, si guarda se quel Developer esiste già.
Se esiste, entra come prima. Se non esiste, **la sessione appena aperta viene chiusa** e il lettore
torna sulla landing, dove trova la data e il campo email. Nessun account nuovo nasce, e nessuno resta
con una sessione a metà.

Le alternative scartate, con il motivo:

- **Un redirect globale in `proxy.ts`**: chiuderebbe anche le pagine pubbliche, cioè il canale.
- **Spegnere il provider su Supabase**: chiude fuori anche i Developer che esistono già, e non è una
  decisione che vive nel repository: sarebbe una spunta in una dashboard, invisibile al codice e al
  prossimo che legge.
- **Una lista di indirizzi ammessi**: due nomi scritti in una variabile d'ambiente sono una regola
  che nessun test guarda, e il giorno del lancio va ricordata e tolta.

## La Lista d'attesa

**Una Iscrizione è un indirizzo, una lingua, un giorno e una provenienza**, e nient'altro: il nome
non serve a mandare un messaggio, e un dato che non serve è un dato da custodire per niente. I nomi
stanno in `GLOSSARY.md` (`Waitlist`, `WaitlistSignup`, tabella `waitlist_signups`); la lingua è
l'enum `public.locale` che le Notifiche hanno già, perché la lingua in cui si legge la landing è la
lingua in cui si vuole essere avvisati.

**Un indirizzo vale una sola Iscrizione**, e il vincolo è nel database, non nel codice: un form si
può inviare senza la pagina. Chi la chiede due volte legge che c'è già, e non vede un errore: non ha
sbagliato niente.

**Niente lettura pubblica.** La tabella non si legge da nessun client: la RLS non concede select a
nessuno, e l'inserimento passa dalla Server Action con la chiave di servizio, che non lascia il
server. Un elenco di indirizzi email leggibile dal browser sarebbe il regalo a chi raccoglie
indirizzi, e la privacy policy di questo prodotto promette il contrario.

**Nessuna email prima del lancio**, quindi nessun doppio opt-in adesso: il consenso che si chiede è
quello di essere avvisati una volta, il 20 gennaio 2027, e la conferma è il messaggio stesso. Un
doppio opt-in oggi vorrebbe dire un servizio di invio, cioè una spesa, per confermare un messaggio
che parte tra due mesi. Il canale email vero, con la disiscrizione, è la #173.

**Difese senza Redis**, perché la #176 non è fatta: honeypot nel form, tetto di lunghezza
sull'indirizzo, il vincolo di unicità, e un limite per indirizzo IP tenuto in memoria del processo.
Un limite in memoria non è un limite distribuito e non pretende di esserlo: ferma il rumore, e il
vincolo di unicità ferma il resto.

## Cosa riapre la porta

**Il 20 gennaio 2027, da sola.** La porta non è un interruttore: è `now < LAUNCH_AT`, letto nel
callback. Un interruttore va ricordato la mattina del lancio, e la sola cosa che quella mattina
nessuno dimentica è la data. Quindi la data è una costante sola, `LAUNCH_AT` in
`src/modules/waitlist/domain/launch.ts`, e quella riga decide tre cose: la frase sulla landing, la
frase su `/login` e la porta. Spostare il lancio è cambiare quella riga, e non si può cambiarne una
delle tre senza cambiarle tutte.

⚠️ **La landing è prerenderizzata una volta per deploy**, quindi il blocco della lista d'attesa
sparisce al primo deploy dopo il lancio e non a mezzanotte. Non è una svista: la mattina del 20
gennaio 2027 c'è un deploy comunque, perché è il giorno in cui entrano i pagamenti. La porta del
callback invece è dinamica, e si apre all'ora esatta.

⚠️ Finché la porta è chiusa, `pnpm dev:login` resta il modo di avere un account nuovo in locale,
perché lo sviluppo non passa dal callback di GitHub.

---

⚠️ **Superato dall'ADR [0011](./0011-open-source-una-copia-per-persona.md) il 2026-11-10, un giorno dopo essere stato scritto, e mai andato in
produzione.** La Lista d'attesa serviva a raccogliere indirizzi fino a un lancio a pagamento che non
ci sarà: Verdict diventa open source e si scarica, quindi non c'è niente da attendere e nessuna porta
da chiudere.

⚠️ **Ma questo ADR è andato in produzione.** Le PR #207 e #208 sono state mergiate il **2026-11-09
alle 21:43**, poche ore prima della svolta, quindi la tabella `waitlist_signups`, il modulo `waitlist`
e la porta chiusa nel callback **esistono davvero** e vanno smontati: lo fa la issue **#219**, la prima
della catena open source. La issue #206 è chiusa.

Due cose scritte qui restano vere e vale la pena rileggerle: **le pagine pubbliche sono il solo canale
che porta qualcuno qui**, ed è il motivo per cui la vetrina resta in piedi come sito statico (#215); e
**l'argomento che convince è una dimostrazione, non una promessa**, che adesso è il comando da copiare
e la Dashboard dimostrativa sulla landing. La data del **20 gennaio 2027** sopravvive anche lei, ma
come giorno dell'annuncio e non del lancio: il pacchetto va su npm appena funziona.
