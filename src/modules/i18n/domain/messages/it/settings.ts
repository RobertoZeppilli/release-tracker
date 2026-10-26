import type { MessageDictionary } from "../index";

export const settings = {
  "settings.title": "Impostazioni",
  "settings.intro":
    "Come l'app si legge per te. Niente di qui è condiviso con nessuno, e niente nelle pagine pubbliche delle release e delle tecnologie dipende da questo.",
  "settings.language.note":
    "La lingua è parte dell'indirizzo, così una pagina si può condividere nella lingua in cui è stata letta. Le note di rilascio e le sintesi restano nella loro lingua originale.",
  // La sezione delle Notifiche (issue #171, ADR 0009). `featured`, `notable`, `digest` e `Pro` sono
  // la grammatica del prodotto e restano in inglese; i nomi del glossario si traducono dentro le
  // frasi (ADR 0008).
  "settings.notifications.title": "notifiche",
  "settings.notifications.intro":
    "Quali Release ti raggiungono, e dove. La campanella è gratis per sempre; Slack e l'email sono Pro.",
  "settings.notifications.featured.label": "Release featured",
  "settings.notifications.featured.off":
    "Spento, una Release featured di una Tecnologia che segui non scrive nessuna Notifica: niente sulla campanella, e niente su un canale aggiunto dopo.",
  "settings.notifications.notable.label": "Release notable",
  "settings.notifications.notable.off":
    "Spento, una Release notable non scrive nessuna Notifica. Le featured hanno un interruttore loro, così le Release per cui vale la pena interromperti restano accese mentre queste tacciono.",
  "settings.notifications.switch": "{name} sulla campanella",
  "settings.notifications.error":
    "Non salvato. L'interruttore è tornato come lo tiene il database, quindi quello che vedi è quello che hai: premilo di nuovo.",
  "settings.notifications.digest":
    "Il Digest settimanale porta il suo interruttore, il giorno in cui arriva il Digest stesso.",
  "settings.notifications.external.title": "slack e email",
  "settings.notifications.external.body":
    "Slack c'è, con i suoi interruttori qui sotto; l'email è ancora in costruzione e porterà i suoi quando arriva. Portano il segno Pro dal primo giorno, prova inclusa: quando la prova finisce senza Pro si spengono, e niente resta acceso per abitudine. La campanella resta, gratis.",
  "settings.notifications.pro": "Pro",
  "settings.notifications.trial.waiting":
    "La tua prova di {count} giorni di Slack e dell'email parte la prima volta che ne accendi uno, non dal giorno in cui ti sei registrato.",
  "settings.notifications.trial.left": {
    one: "Resta un giorno di prova di Slack e dell'email.",
    many: "Restano {count} giorni di prova di Slack e dell'email.",
    other: "Restano {count} giorni di prova di Slack e dell'email.",
  },
  "settings.notifications.trial.ended":
    "La tua prova di Slack e dell'email è finita. La campanella è gratis per sempre; i due canali esterni chiedono Pro.",
  "settings.notifications.switch.slack": "{name} su Slack",
  "settings.notifications.slack.title": "slack",
  "settings.notifications.slack.note":
    "Slack vuole un incoming webhook: creane uno nel tuo workspace, scegli il canale e incolla qui l'URL. È un segreto, quindi una volta salvato rileggi solo dove punta, mai l'URL intero.",
  "settings.notifications.slack.label": "URL dell'incoming webhook",
  "settings.notifications.slack.save": "salva",
  "settings.notifications.slack.remove": "rimuovi",
  "settings.notifications.slack.current": "Manda a {hint}. Lascia il campo vuoto e salva per rimuoverlo.",
  "settings.notifications.slack.none": "Ancora nessun webhook, quindi i due interruttori qui sotto non mandano niente.",
  "settings.notifications.slack.invalid":
    "Non salvato. L'URL di un webhook comincia con https://hooks.slack.com/services/ e viene dal tuo workspace.",
  "settings.notifications.slack.featured.off":
    "Spento, le Release featured arrivano ancora sulla campanella e smettono di arrivare su Slack.",
  "settings.notifications.slack.notable.off":
    "Spento, le Release notable smettono di arrivare su Slack. Le featured hanno un interruttore proprio, quindi possono continuare ad arrivare.",
  "settings.notifications.slack.grouping":
    "Un messaggio per giro, con una riga per Release: dieci Release in un giro arrivano come un messaggio solo, non dieci.",
  "settings.notifications.slack.test": "manda un messaggio di prova",
  "settings.notifications.slack.testOk": "Il messaggio di prova è partito. Il canale funziona.",
  "settings.notifications.slack.testFailed": "Slack non l'ha accettato: {error}",
  "settings.notifications.slack.testEmpty": "Non c'è ancora niente da provare: salva prima un webhook.",
  "settings.notifications.locale.title": "lingua di email e slack",
  "settings.notifications.locale.note":
    "L'email e Slack non hanno un indirizzo da cui leggere una lingua, quindi sono scritte in questa. Non cambia la lingua del sito, che resta quella nell'indirizzo, e le Note di rilascio e le Sintesi restano nella loro lingua originale.",
  "settings.notifications.locale.choose": "Scrivi email e Slack in {name}",
  "settings.notifications.locale.error":
    "Non salvato. La lingua è ancora quella segnata qui, che è quella che tiene il database: premila di nuovo.",
} as const satisfies Partial<MessageDictionary>;
