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
    "I due canali sono in costruzione, e ognuno porta qui il suo interruttore quando arriva. Portano il segno Pro dal primo giorno, prova compresa: quando la prova finisce senza Pro si spengono, e niente resta acceso per abitudine. La campanella resta, gratis.",
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
  "settings.notifications.locale.title": "lingua di email e slack",
  "settings.notifications.locale.note":
    "L'email e Slack non hanno un indirizzo da cui leggere una lingua, quindi sono scritte in questa. Non cambia la lingua del sito, che resta quella nell'indirizzo, e le Note di rilascio e le Sintesi restano nella loro lingua originale.",
  "settings.notifications.locale.choose": "Scrivi email e Slack in {name}",
  "settings.notifications.locale.error":
    "Non salvato. La lingua è ancora quella segnata qui, che è quella che tiene il database: premila di nuovo.",
} as const satisfies Partial<MessageDictionary>;
