# TaskFlow — Organisateur personnel de productivite

## Instructions pour Claude Code

- Apres chaque modification du code, mettre a jour ce fichier CLAUDE.md si la structure, les vues, les tables, ou les conventions ont change.
- Sauvegarder en memoire les decisions importantes, les nouvelles fonctionnalites ajoutees, et les changements d'architecture.
- Garder ce fichier comme source de verite sur l'etat actuel du projet.
- Quand une erreur se produit (bug, mauvaise approche, code qui casse, mauvaise comprehension du besoin), sauvegarder la lecon en memoire (type feedback) avec : ce qui a echoue, pourquoi, et comment eviter ca a l'avenir. Consulter ces lecons avant de repeter une approche similaire.
- Etre un partenaire critique et force de proposition, pas un simple executant :
  - Quand Alexis propose une idee ou demande une feature, challenger l'approche si elle peut etre amelioree. Proposer des alternatives.
  - Quand l'idee est vague, poser les bonnes questions pour clarifier le besoin, puis proposer 2-3 pistes concretes avec les pour/contre de chacune.
  - Signaler proactivement les problemes (UX, performance, dette technique, accessibilite) meme si ce n'est pas demande.
  - Apres une implementation, suggerer des ameliorations possibles pour la suite ("on pourrait aussi...").
  - Rester direct et honnete : si une idee n'est pas bonne, le dire clairement avec une meilleure alternative.

## Description

Application web PWA de gestion de taches et productivite personnelle.
Interface dark/light avec theme orange, optimisee mobile-first.

## Stack technique

- **Frontend** : HTML/CSS/JS vanilla (pas de framework, pas de build)
- **Backend** : Supabase (BaaS) — auth implicite via anon key
- **Librairies CDN** : Supabase JS v2, Chart.js v4
- **PWA** : manifest.json + icones SVG, installable sur mobile

## Structure du projet

Le code est decoupe en 4 fichiers principaux :
- `index.html` (~156 lignes) : structure HTML pure, modales, navigation
- `style.css` (~332 lignes) : tout le CSS (variables, composants, responsive)
- `js/db.js` (~33 lignes) : config Supabase, mapping DB/app, fonctions CRUD
- `js/app.js` (~387 lignes) : variables, constantes, navigation, vues, drag & drop, init

Ordre de chargement des scripts : supabase CDN → chart.js CDN → db.js → app.js

Autres fichiers :
- `manifest.json` : config PWA
- `icon-192.svg`, `icon-512.svg` : icones de l'app
- `CLAUDE.md` : ce fichier

## Vues de l'application

| Vue | Fonction render | Description |
|-----|----------------|-------------|
| Focus | `renderFocus()` | Taches du jour, vue par defaut |
| Kanban | `renderKanban()` | Colonnes todo/doing/done |
| Calendrier | `renderCalendar()` | Vue semaine/jour avec drag |
| Eisenhower | `renderEisenhower()` | Matrice urgent/important |
| Notes | `renderNotes()` | Notes par categorie |
| Habitudes | `renderHabits()` | Suivi d'habitudes quotidiennes |
| Stats | `renderStats()` | Graphiques Chart.js |

## Base de donnees Supabase

Tables :
- `tasks` : taches (title, description, category, priority, duration, due_date, completed, status, quadrant, cal_day, cal_hour, completed_at, recurrence_type, recurrence_day)
- `habits` : habitudes (name, completions — objet JSON de dates cochees)
- `notes` : notes (title, content, category, created_at, updated_at)

## Conventions

- Langue de l'interface : francais
- Commentaires dans le code : francais
- Commits en francais
- CSS : variables custom dans `:root`, theme dark par defaut, light via `[data-theme="light"]`
- Noms de fonctions : camelCase, prefixes `render`, `load`, `insert`, `update`, `delete`
- Mapping donnees : `rowToX()` (DB -> app) et `xToRow()` (app -> DB)

## Comment tester

Ouvrir `index.html` dans un navigateur (serveur local recommande pour le service worker).
Pas de build, pas de compilation, pas de npm.

## Points d'attention

- La cle Supabase dans le code est la cle publique (anon key), pas un secret
- Le fichier index.html est volumineux — editer avec precision (utiliser les numeros de ligne)
- Pas de systeme de build : tout changement est immediat
- `renderAll()` re-rend toutes les vues — appele apres chaque modification de donnees
