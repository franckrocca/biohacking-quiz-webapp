# Google Apps Script – Quiz Vitalité & Longévité

Ce dossier contient l’exemple de script Google Apps Script permettant de :

1. Réceptionner les réponses du quiz Vitalité & Longévité optimisé
2. Enregistrer toutes les données dans Google Sheets (payload complet)
3. Envoyer une notification email « nouveau lead » aux destinataires configurés

## 1. Pré-requis

- Un Google Sheet dédié (ex. `OraLife - Leads Quiz`) avec un onglet cible (par défaut `Leads`)
- Un compte Google avec accès Apps Script
- L’URL du Web App Apps Script (à insérer dans `CONFIG.endpoints.googleScriptUrl` dans le fichier HTML)

## 2. Mise en place du script

1. Ouvrez [https://script.google.com/](https://script.google.com/) et créez un **Nouveau projet**.
2. Supprimez le contenu par défaut et collez le fichier [`leadReceiver.gs`](./leadReceiver.gs).
3. Renseignez les constantes en haut du fichier :
   - `SHEET_ID` : l’identifiant du Google Sheet (extrait de l’URL).
   - `SHEET_NAME` : nom de l’onglet de destination (sera créé s’il n’existe pas).
   - `DEFAULT_NOTIFICATION_EMAILS` : liste des emails recevant les notifications par défaut.
4. Cliquez sur **Déployer > Déployer en tant qu’application web...**
   - Version : *Nouvelle*
   - Description : ex. « Webhook Quiz Vitalité »
   - Exécuter en tant que : **Vous**
   - Qui a accès à l’application : **Tout le monde** (ou « Tout le monde disposant du lien »)
   - Validez et récupérez l’URL de déploiement. Collez-la dans `CONFIG.endpoints.googleScriptUrl` du fichier `vitalite-longevite-optimise.html`.

> 💡 Pour mettre à jour le script, redéployez simplement la version (menu Déployer > Gérer les déploiements > Modifier).

## 3. Structure du payload attendu

Le payload JSON envoyé par le quiz contient les sections suivantes :

- `meta` : session, quiz_id, version, langue…
- `tracking` : UTM, device, temps de complétion, referrer…
- `lead` : prénom, nom, email, téléphone, birthdate, consentement…
- `metrics` : taille, poids, IMC, catégorie OMS…
- `scoring` : score final, scores partiels, profil, forces, risques, recommandations…
- `progression` : total steps, steps complétés, % progression, statut…
- `answers` : toutes les réponses brutes (clé/valeur, multi-select inclus)
- `notifications` : emails à notifier + objet (overrides du script si fournis)

Le script écrit une ligne comprenant l’ensemble des champs clés dans Google Sheets. Les objets complexes (forces, risques, recommandations, answers) sont sérialisés en JSON pour faciliter leur exploitation.

## 4. Notification email « nouveau lead »

- Le script envoie un email via `MailApp.sendEmail` pour chaque destinataire configuré.
- Le payload peut surcharger les destinataires (`payload.notifications.emails`) et l’objet (`payload.notifications.subject`).
- Le contenu de l’email inclut : prénom, nom, email, téléphone, date de naissance, score final, profil et lien vers le Google Sheet.

## 5. Sécurité & bonnes pratiques

- Restreignez l’URL du Web App si nécessaire (via proxy / Vérification Apps Script avancée).
- Changez régulièrement l’URL du déploiement en cas de doute.
- Ne laissez jamais le fichier HTML exposer les IDs de feuille sensibles en production (utilisez des secrets côté Apps Script si besoin).

## 6. Tests

1. Déployez le Web App et copiez l’URL dans `CONFIG.endpoints.googleScriptUrl`.
2. Ouvrez `vitalite-longevite-optimise.html` dans un navigateur.
3. Complétez le quiz jusqu’au bout et soumettez le lead.
4. Vérifiez :
   - Que la ligne apparaît dans Google Sheets
   - Que l’email de notification est reçu
   - Qu’aucune erreur n’est visible dans le journal Apps Script (`Affichage > Journaux`)

## 7. Maintenance

- Si vous ajoutez de nouvelles colonnes à Google Sheets, mettez à jour la constante `headers` et la fonction `buildRow_` pour respecter l’ordre.
- Pour déboguer : utilisez `Logger.log(payload)` dans `doPost` (visible dans les journaux) en veillant à anonymiser avant export.

Bon déploiement ✨
