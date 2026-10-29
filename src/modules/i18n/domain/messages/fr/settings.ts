import type { MessageDictionary } from "../index";

export const settings = {
  "settings.title": "Paramètres",
  "settings.intro":
    "Comment l’app se lit pour vous. Rien ici n’est partagé avec personne, et rien sur les pages publiques des releases et des technologies n’en dépend.",
  "settings.language.title": "Langue",
  "settings.language.interface": "langue de l'interface",
  "settings.language.note":
    "La langue fait partie de l’adresse, donc une page peut être partagée dans la langue où elle a été lue. Les notes de version et les synthèses restent dans leur langue d’origine.",
  // La section des Notifications (issue #171, ADR 0009). `featured`, `notable`, `digest` et `Pro`
  // sont la grammaire du produit et restent en anglais ; les noms du glossaire se traduisent dans
  // les phrases (ADR 0008).
  "settings.notifications.title": "Notifications",
  "settings.notifications.intro":
    "Quelles release vous parviennent, et où. La cloche est gratuite pour toujours ; Slack est Pro.",
  "settings.notifications.bell.title": "la cloche",
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
  "settings.notifications.pro": "Pro",
  "settings.notifications.trial.start": "démarrer l’essai Pro de 30 jours",
  "settings.notifications.trial.note": "30 jours, gratuits. Ensuite, Slack demande Pro ; la cloche reste gratuite.",
  "settings.notifications.trial.left": {
    one: "Il reste un jour d’essai Pro.",
    many: "Il reste {count} jours d’essai Pro.",
    other: "Il reste {count} jours d’essai Pro.",
  },
  "settings.notifications.trial.ended": "L’essai Pro est terminé. Slack demande Pro ; la cloche reste gratuite.",
  "settings.notifications.switch.slack": "{name} sur Slack",
  "settings.notifications.slack.title": "slack",
  "settings.notifications.slack.connect": "Add to Slack",
  "settings.notifications.slack.dialog.title": "Ajouter Verdict à Slack",
  "settings.notifications.slack.dialog.asks": "Slack demande un workspace et un canal.",
  "settings.notifications.slack.dialog.continue": "continuer vers Slack",
  "settings.notifications.slack.dialog.cancel": "annuler",
  "settings.notifications.slack.result.connected": "Slack est connecté.",
  "settings.notifications.slack.result.cancelled": "Rien n'a changé : l'autorisation n'a pas été donnée.",
  "settings.notifications.slack.result.failed":
    "Slack n'a pas terminé l'autorisation, donc rien n'a été enregistré. Recommencez.",
  "settings.notifications.slack.result.denied":
    "Ce retour n'appartient pas à une autorisation commencée ici, il a donc été refusé. Repartez de cette page.",
  "settings.notifications.slack.result.unavailable":
    "Add to Slack n'est pas disponible ici, collez donc un webhook ci-dessous.",
  "settings.notifications.slack.manual": "ou collez un webhook vous-même",
  "settings.notifications.slack.manualNote":
    "L'autre voie, et la seule en développement : créez un incoming webhook dans votre workspace, choisissez le canal et collez l'URL. C'est un secret, donc une fois enregistré vous ne relisez que sa destination, jamais l'URL elle-même.",
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
  "settings.notifications.locale.title": "langue de slack",
  "settings.notifications.locale.note":
    "Slack n’a pas d’adresse où lire une langue, il est donc écrit dans celle-ci. Cela ne change pas la langue du site, qui reste celle de l’adresse, et les notes de version et les synthèses restent dans leur langue d’origine.",
  "settings.notifications.locale.choose": "Écrire Slack en {name}",
  "settings.notifications.locale.error":
    "Non enregistré. La langue est encore celle qui est marquée ici, celle que contient la base de données : appuyez de nouveau.",
} as const satisfies Partial<MessageDictionary>;
