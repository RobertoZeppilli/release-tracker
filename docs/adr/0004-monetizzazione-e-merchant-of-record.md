# Monetizzazione: gratis ciò che costa zero, Pro ciò che scala con l'uso

Le Sintesi e le pagine pubbliche restano sempre gratuite: costano zero per utente aggiuntivo e sono
il canale di acquisizione via SEO. Il Piano Pro sblocca solo ciò che ha un costo marginale per
utente (Tecnologie seguite oltre 10, Notifiche, scanner dei repository). Il limite Free di 10
Tecnologie è imposto nel database fin dall'MVP; l'integrazione dei pagamenti arriva insieme alle
Notifiche, la prima funzione Pro reale.

I pagamenti passano da Lemon Squeezy come Merchant of Record invece di Stripe diretto: la
commissione più alta compensa la gestione di IVA UE/OSS, fatturazione e rimborsi, che per uno
sviluppatore singolo con sede in Italia sarebbero un costo operativo significativo.

⚠️ **Precisato il 2026-10-22 dall'ADR [0009](./0009-notifiche-campanella-gratis-canali-pro.md),
quando le Notifiche sono entrate prima del lancio.** "Notifiche" qui sopra valeva per tutte e tre:
dalla decisione delle Notifiche la **campanella in-app è gratis per sempre**, perché non ha costo
marginale per utente aggiuntivo, ed è il criterio di questo ADR applicato, non cambiato; **Slack e
l'email restano Pro**, perché un invio e una chiamata a un webhook costano per utente. La riga
"l'integrazione dei pagamenti arriva insieme alle Notifiche, la prima funzione Pro reale" **resta
vera e diventa una scadenza**: al lancio i pagamenti sono già attivi, perché i canali esterni hanno
una **prova di 30 giorni per Sviluppatore** che parte dalla prima accensione di un canale e alla
scadenza li spegne, senza diritti acquisiti. Una prova che scade senza niente da comprare sarebbe una
funzione spenta, quindi Lemon Squeezy è una fetta obbligatoria del lancio e non più una cosa del dopo.
