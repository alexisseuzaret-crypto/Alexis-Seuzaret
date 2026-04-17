# TaskFlow — Contexte projet

## Description
App de productivité PWA dark/light mode.
Vues : Focus, Kanban, Calendrier, Eisenhower, Notes, Habitudes, Stats, Projets, Sport, Alimentation, Réglages.
Stack : HTML/CSS/JS vanilla + Supabase + Chart.js

## Stack
- Frontend : HTML/CSS/JS vanilla (pas de build, pas de framework)
- Backend : Supabase (anon key publique — pas de secret)
- Hébergement : Vercel
- Repo : GitHub (branch main)

## État actuel (2026-04-17)
- Phase 1 terminée et déployée : 5 bugs critiques
- Phase 2 terminée et déployée : 8 correctifs UX/bugs modérés
- Phase 3 terminée : refactoring

## Fichiers clés
- index.html : structure HTML, modales, navigation
- style.css : tout le CSS
- js/db.js : config Supabase + CRUD
- js/app.js : logique principale (~1450 lignes)

## Décisions techniques prises
- Pas de framework JS — vanilla uniquement pour garder zéro build
- Clé Supabase anon en clair dans db.js (clé publique, acceptable)
- `renderAll()` ne rend que la vue active via VIEW_RENDERERS (optimisation)
- Gestion erreurs Supabase : console.error() + toast() sur chaque CRUD
- `streaksCache` : calcStreaks() calculé une seule fois par renderAll()
- `--topbar-h` variable CSS utilisée partout (pas de hardcode 135px)
- `daysUntil(dateStr)` : fonction utilitaire centralisée
- `switchView` async : supporte les confirms avant navigation (notes non sauvegardées)
- `calMode` : convertit calOff intelligemment au lieu de reset systématique
- Drag & drop unifié : dStart/dEnd/dragOver/dragLeave partagés pour toutes les vues
- Toast : max 3 simultanés + déduplication par texte
