# Leçons apprises

## Format
[DATE] | ERREUR : description | CAUSE : pourquoi | RÈGLE : à retenir

## Règles générales
- Ne jamais déployer sur Vercel sans tester le build local d'abord
- Tous les commits en français avec préfixe conventionnel
- Ne jamais créer de fichiers à la racine ~/

## Historique
2026-04-14 | ERREUR : demandé à Alexis de naviguer dans des menus Vercel/browser alors que la solution était un fichier de config (vercel.json) | CAUSE : réflexe de déléguer au lieu de chercher la solution code-first | RÈGLE : toujours chercher si le problème peut être réglé par du code ou un fichier de config avant de demander une action manuelle à l'utilisateur
2026-04-14 | ERREUR : agent statusline-setup a écrasé statusline.js sans lire l'existant | CAUSE : l'agent a réécrit le fichier au lieu de merger | RÈGLE : toujours lire statusline.js avant toute modification, merger les widgets existants avec les nouveaux, jamais écraser
2026-04-14 | ERREUR : used_tokens n'existe pas dans context_window | CAUSE : mauvaise hypothèse sur la structure de données Claude Code | RÈGLE : les tokens sont dans context_window.current_usage (input_tokens + output_tokens + cache_creation_input_tokens + cache_read_input_tokens)
2026-04-12 | ERREUR : utilisé `bypassPermissions` comme clé directe dans settings.json | CAUSE : champ inexistant dans le schéma Claude Code | RÈGLE : utiliser `permissions.defaultMode: "bypassPermissions"` à la place
