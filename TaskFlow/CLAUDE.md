# Instructions Claude — Projet TaskFlow

## Boot de session
Ne lis les fichiers de contexte QUE si le message contient une intention de travail (tâche, bug, feature, question technique).
Un simple greeting ne déclenche PAS le boot.

Quand le boot est déclenché, lire dans l'ordre :
1. tasks/tasks.md — tâches en cours
2. tasks/lessons.md — erreurs passées à éviter

Confirme avec : "Contexte chargé : TaskFlow — [X tâches en cours]"

## Self-improvement
À chaque correction ou erreur détectée, ajouter dans tasks/lessons.md :
[DATE] | ERREUR : ... | CAUSE : ... | RÈGLE : ...

À chaque fin de session importante, mettre à jour brain/projects/taskflow.md.

## Ressources projet
- brain/projects/taskflow.md — décisions techniques et état d'avancement
- brain/projects/mister-ia.md — contexte entreprise
- brain/clients/ — interlocuteurs
