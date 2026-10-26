import type { MessageDictionary } from "../index";

export const settings = {
  "settings.title": "Paramètres",
  "settings.intro":
    "Comment l’app se lit pour vous. Rien ici n’est partagé avec personne, et rien sur les pages publiques des releases et des technologies n’en dépend.",
  "settings.language.note":
    "La langue fait partie de l’adresse, donc une page peut être partagée dans la langue où elle a été lue. Les notes de version et les synthèses restent dans leur langue d’origine.",
  // La section des Notifications (issue #171, ADR 0009). `featured`, `notable`, `digest` et `Pro`
  // sont la grammaire du produit et restent en anglais ; les noms du glossaire se traduisent dans
  // les phrases (ADR 0008).
  "settings.notifications.title": "notifications",
  "settings.notifications.intro":
    "Quelles release vous parviennent, et où. La cloche est gratuite pour toujours ; Slack et l’e-mail sont Pro.",
  "settings.notifications.featured.label": "release featured",
  "settings.notifications.featured.off":
    "Éteint, une release featured d’une technologie que vous suivez n’écrit aucune notification : rien sur la cloche, et rien sur un canal ajouté plus tard.",
  "settings.notifications.notable.label": "release notable",
  "settings.notifications.notable.off":
    "Éteint, une release notable n’écrit aucune notification. Les featured ont leur propre interrupteur, pour que les release qui valent une interruption restent allumées pendant que celles-ci se taisent.",
  "settings.notifications.switch": "{name} sur la cloche",
  "settings.notifications.error":
    "Non enregistré. L’interrupteur est revenu à ce que la base de données contient, donc ce que vous voyez est ce que vous avez : appuyez de nouveau.",
  "settings.notifications.digest":
    "Le digest hebdomadaire apportera son propre interrupteur, le jour où le digest lui-même arrivera.",
  "settings.notifications.external.title": "slack et e-mail",
  "settings.notifications.external.body":
    "Slack est là, avec ses propres interrupteurs ci-dessous ; l'email est encore en construction et apportera les siens à son arrivée. Ils portent la marque Pro dès le premier jour, essai compris : quand l'essai se termine sans Pro, ils s'éteignent, et rien ne reste allumé par habitude. La cloche reste, gratuite.",
  "settings.notifications.pro": "Pro",
  "settings.notifications.trial.waiting":
    "Votre essai de {count} jours de Slack et de l’e-mail démarre la première fois que vous en allumez un, pas le jour de votre inscription.",
  "settings.notifications.trial.left": {
    one: "Il reste un jour d’essai de Slack et de l’e-mail.",
    many: "Il reste {count} jours d’essai de Slack et de l’e-mail.",
    other: "Il reste {count} jours d’essai de Slack et de l’e-mail.",
  },
  "settings.notifications.trial.ended":
    "Votre essai de Slack et de l’e-mail est terminé. La cloche est gratuite pour toujours ; les deux canaux externes demandent Pro.",
  "settings.notifications.switch.slack": "{name} sur Slack",
  "settings.notifications.slack.title": "slack",
  "settings.notifications.slack.note":
    "Slack demande un incoming webhook : créez-en un dans votre workspace, choisissez le canal et collez l'URL ici. C'est un secret, donc une fois enregistré vous ne relisez que sa destination, jamais l'URL elle-même.",
  "settings.notifications.slack.label": "URL de l'incoming webhook",
  "settings.notifications.slack.save": "enregistrer",
  "settings.notifications.slack.remove": "retirer",
  "settings.notifications.slack.current": "Envoi vers {hint}. Laissez le champ vide et enregistrez pour le retirer.",
  "settings.notifications.slack.none": "Pas encore de webhook, donc les deux interrupteurs ci-dessous n'envoient rien.",
  "settings.notifications.slack.invalid":
    "Non enregistré. L'URL d'un webhook commence par https://hooks.slack.com/services/ et vient de votre propre workspace.",
  "settings.notifications.slack.featured.off":
    "Éteint, les releases featured arrivent encore sur la cloche et cessent d'arriver sur Slack.",
  "settings.notifications.slack.notable.off":
    "Éteint, les releases notable cessent d'arriver sur Slack. Les featured ont leur propre interrupteur et peuvent continuer d'arriver.",
  "settings.notifications.slack.grouping":
    "Un message par passage, avec une ligne par release : dix releases dans un passage arrivent en un seul message, pas dix.",
  "settings.notifications.slack.test": "envoyer un message de test",
  "settings.notifications.slack.testOk": "Le message de test est parti. Le canal fonctionne.",
  "settings.notifications.slack.testFailed": "Slack ne l'a pas accepté : {error}",
  "settings.notifications.slack.testEmpty": "Rien à tester pour l'instant : enregistrez d'abord un webhook.",
  "settings.notifications.locale.title": "langue des e-mails et de slack",
  "settings.notifications.locale.note":
    "L’e-mail et Slack n’ont pas d’adresse où lire une langue, ils sont donc écrits dans celle-ci. Cela ne change pas la langue du site, qui reste celle de l’adresse, et les notes de version et les synthèses restent dans leur langue d’origine.",
  "settings.notifications.locale.choose": "Écrire les e-mails et Slack en {name}",
  "settings.notifications.locale.error":
    "Non enregistré. La langue est encore celle qui est marquée ici, celle que contient la base de données : appuyez de nouveau.",
} as const satisfies Partial<MessageDictionary>;
