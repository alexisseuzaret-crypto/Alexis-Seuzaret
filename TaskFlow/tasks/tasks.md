# Tâches actives

## Priorité immédiate
- [x] DONE : Créer la structure du vault Obsidian (Second Brain) + alimenter les premières notes sur Alexis, ses projets, ses préférences — vault connecté via MCP filesystem à `C:\Users\AlexisSeuzaret\OneDrive - Mister IA\Mister-IA\Claude Code\Second Brain`

## Phase 2 — Bugs modérés + UX ✅
- [x] P2-1 : `calMode()` remet `calOff` à 0 au changement de vue
- [x] P2-2 : Streak habitudes : compter J-1 si aujourd'hui pas encore coché
- [x] P2-3 : Doublons récurrence : vérifier avant d'insérer une nouvelle occurrence
- [x] P2-4 : Auto-save notes : avertir avant de changer de note si modifications non sauvegardées
- [x] P2-5 : Bouton "Éditer" sur les tâches Focus (ouvre la modale)
- [x] P2-6 : Checkbox "Compléter" sur les cartes Eisenhower
- [x] P2-7 : Date visible (updatedAt) dans la liste des notes
- [x] P2-8 : Toasts : limiter à 3 simultanés max, dédupliquer

## Phase 3 — Refactoring
- [ ] P3-1 : Extraire `daysUntil(dateStr)` — fonction utilitaire (élimine 3 duplications)
- [ ] P3-2 : Remplacer `135px` hardcodé par variable CSS `--topbar-h`
- [ ] P3-3 : Mettre en cache `calcStreaks()` — calculer une seule fois par render
- [ ] P3-4 : Ajouter vérification `if(document.querySelector('.modal-bg.open'))` en haut de `switchView`
- [ ] P3-5 : Mettre à jour `brain/projects/taskflow.md` avec décisions techniques
