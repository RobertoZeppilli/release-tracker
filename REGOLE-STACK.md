# Le convenzioni della casa

Cletus legge questo file quando tocca uno di questi stack. Non è un manuale: sono le decisioni
già prese nei progetti di Roberto, da seguire invece di riaprirle a ogni task. Quando una regola
qui contraddice il `CLAUDE.md` del progetto, vince il progetto.

## Next.js su Vercel

Server Component per default, `"use client"` solo dove serve davvero interattività, e il più in
basso possibile nell'albero. Il fetch dei dati sta nel server, non in un `useEffect`.

Le mutazioni sono Server Action o route handler, e validano l'input con uno schema: il client
non è una fonte di verità, nemmeno il tuo. Mai fidarsi di un `userId` che arriva dal body.

Caching: dichiaralo, non sperarlo. Prima di usare `use cache`, `cacheLife`, `cacheTag` o PPR,
guarda la versione di Next in `package.json` e leggi la skill `vercel:next-cache-components`:
questa è l'area che è cambiata più volte negli ultimi due anni.

Immagini con `next/image` e dimensioni esplicite. Font con `next/font`. Niente `<img>` nudo su
una pagina che poi finisce in un Lighthouse.

## Expo e React Native

File-based routing con Expo Router. Niente eject se si può evitare: un config plugin costa meno
di una cartella `android/` da mantenere a mano.

Liste lunghe con `FlashList` o `FlatList` configurata, mai un `map` dentro una `ScrollView`.
Animazioni con Reanimated sul thread UI, non con `Animated` e `setState`. I dati sensibili in
`expo-secure-store`, non in `AsyncStorage`.

Prima di costruire, guarda cosa regge Expo Go e cosa chiede un development build: scoprirlo a
metà task è mezzo pomeriggio.

## Postgres, Neon

Migrazioni versionate nel repo, sempre, anche per aggiungere una colonna. Niente `ALTER TABLE`
a mano su un branch di produzione.

Query parametrizzate. Indici sulle colonne su cui filtri, e lo verifichi con `EXPLAIN` invece di
dedurlo. Per cambi di schema delicati, un branch Neon: è lo strumento che esiste per non provare
in produzione.

Le righe che riguardano una persona reale si cancellano per davvero quando la persona lo chiede.

## GitHub Actions

Action pinnate a un tag maggiore (`actions/checkout@v4`), `permissions` dichiarate al minimo in
ogni workflow, segreti solo da `secrets.*` e mai stampati. Il cron è in UTC e non conosce l'ora
legale: se un orario conta, scrivilo nel commento.

Un workflow che fa una cosa sola si capisce quando si rompe alle 3 di notte.

## TypeScript

`strict` acceso. I tipi si inferiscono: si annotano i confini (parametri pubblici, ritorni
esportati), non ogni variabile locale. Un `as` è un'affermazione sul mondo che il compilatore non
può controllare, quindi va commentata o eliminata. Gli `enum` no, union di stringhe sì.

Dati che vengono da fuori — `fetch`, `process.env`, un file, un form — entrano attraverso uno
schema e dentro sono già del tipo giusto.

## Test

Il test prova un comportamento, non un'implementazione: se rinominare una funzione privata
rompe dieci test, i test sono sbagliati. Niente mock del modulo che stai testando.

La cucitura buona è una funzione pura che prende input e istante e restituisce il risultato
previsto. Il tempo si passa come argomento, non si legge da `Date.now()` dentro la logica: è la
differenza tra un test che prova una cosa e un test che aspetta.

## Notifiche e automazioni

ntfy per i messaggi a un telefono, con `Priority: 5` quando la puntualità conta su Android, e le
notifiche programmate in anticipo con `X-Delay` quando il ritardo di un cron non è accettabile.
È l'architettura già verificata sul campo in `promemoria-medicine`: non ribaltarla senza un
motivo scritto.
