# TaskFlow — Contexte projet

## Description
App de productivité PWA dark/light mode.
Vues : Focus, Kanban, Calendrier, Eisenhower, Notes, Habitudes, Stats.
Stack : HTML/CSS/JS vanilla + Supabase + Chart.js

## Stack
- Frontend : HTML/CSS/JS vanilla (pas de build, pas de framework)
- Backend : Supabase (anon key publique — pas de secret)
- Hébergement : Vercel
- Repo : [à compléter]

## État actuel (2026-04-12)
- Setup Claude Code terminé (brain/, tasks/, CLAUDE.md, Context7 MCP)
- Audit complet réalisé — 25 problèmes identifiés
- Phase 1 terminée et déployée : 5 bugs critiques (cdOver, note draft, habitudes, timezone, raccourci)
- Phase 2 terminée et déployée : 8 correctifs UX/bugs modérés
- Phase 3 terminée et déployée : refactoring (--topbar-h, streaksCache, switchView guard, daysUntil partout)

## Fichiers clés
- index.html (~156 lignes) : structure HTML, modales, navigation
- style.css (~332 lignes) : tout le CSS
- js/db.js (~33 lignes) : config Supabase + CRUD
- js/app.js (~399 lignes) : logique, vues, drag & drop

## Décisions techniques prises
- Pas de framework JS — vanilla uniquement pour garder zéro build
- Clé Supabase anon en clair dans db.js (clé publique, acceptable)
- `renderAll()` ne rend que la vue active (optimisation)
- Gestion erreurs Supabase : console.error() + toast() sur chaque CRUD

## Bugs critiques à corriger en priorité
1. `cdOver`/`cdLeave` non définis → drag calendrier cassé
2. Note vide créée en DB au clic "+ Nouvelle note"
3. Habitudes par défaut recréées si table vide
4. Bug fuseau horaire sur calculs de dates
5. Raccourci 'n' peut ouvrir modale par-dessus modale

## Prochaines étapes
→ Phase 1 : bugs critiques (app.js + db.js)
→ Phase 2 : bugs modérés + UX
→ Phase 3 : refactoring
→ Phase 4 : Service Worker + recherche + vue mois
