# Seuzaret Agency — Design Lancement Complet

**Date :** 2026-04-17  
**Objectif :** Business opérationnel et pipeline automatisé en 2 semaines  
**Approche :** MVP d'abord (première vente avant J5), automatisation complète en semaine 2

---

## 1. Architecture globale

Pipeline commercial entièrement automatisé, construit en 4 phases séquentielles :

```
[Phase 0 - J1]        Setup business (domaine, email, CGV, Stripe, Supabase)
[Phase 1 - J2-J4]     Moteur de génération manuel (scripts Node.js)
[Phase 1b - J4-J5]    Première campagne manuelle → première vente → validation pitch
[Phase 2 - J6-J8]     Automatisation outreach (Lemlist via API)
[Phase 3 - J9-J11]    Conversion Stripe + livraison client
[Phase 4 - J12-J14]   Dashboard web Supabase + Vercel
[Post-lancement]      Intégration SEO/GEO après réception documentation
```

**Règle de livraison :** chaque site généré est hébergé sur une URL Vercel provisoire (`slug-client.vercel.app`). Quand le client paie et dispose d'un domaine, Alexis connecte via DNS dans le Vercel dashboard. Sans domaine, le site reste sur l'URL Vercel.

---

## 2. Offres commerciales

| Offre | Prix unique | Mensuel |
|---|---|---|
| Site vitrine | 499€ | 19,99€/mois |
| Site vitrine + SEO | 599€ | 24,99€/mois |
| Site vitrine + SEO + GEO | 649€ | 24,99€/mois |

- **SEO :** référencement Google via mots-clés (balises meta, structure, contenu optimisé)
- **GEO :** référencement dans les LLMs (ChatGPT, Perplexity) — implémentation post-documentation
- **Maintenance :** hébergement Vercel géré par Alexis, mises à jour incluses

---

## 3. Stack technique

| Étape | Outil |
|---|---|
| Scraping Google Maps | Outscraper API |
| Enrichissement GMB | Outscraper API (même clé) |
| Génération HTML | Claude API (claude-sonnet-4-6) |
| Deploy sites prospects | Vercel API |
| Orchestration | Scripts Node.js |
| Cold email | Lemlist |
| Paiement | Stripe (Payment Links + abonnements) |
| Email pro | Zoho Mail (`alexis@seuzaret-agency.com`) |
| Base de données | Supabase |
| Dashboard | HTML vanilla déployé sur Vercel |
| Mentions légales / CGV | Legalstart |

---

## 4. Phase 0 — Setup business (J1, ~4h)

### Domaine & email
- Connecter `seuzaret-agency.com` à Vercel (DNS chez le registrar)
- Créer `alexis@seuzaret-agency.com` sur Zoho Mail

### Legal
- CGV via Legalstart (template prestation web)
- Mentions légales générées et intégrées dans `index.html`

### Stripe
- 3 produits one-time : Vitrine 499€ / Vitrine+SEO 599€ / Vitrine+SEO+GEO 649€
- 2 produits récurrents : maintenance 19,99€/mois / SEO+GEO 24,99€/mois
- 1 Payment Link par produit (manuel au début, automatisé en Phase 3)

### Supabase
- Projet : `seuzaret-agency`
- Table `prospects` :

```sql
id              uuid primary key
nom             text
secteur         text        -- restaurant | artisan | beaute
ville           text
tel             text
site_actuel     text
url_generee     text
statut          text        -- genere | envoye | ouvert | clique | repondu | paye | livre
date_creation   timestamp
date_envoi      timestamp
date_paiement   timestamp
offre           text        -- vitrine | seo | geo
notes           text
```

---

## 5. Phase 1 — Moteur de génération (J2-J4)

### Structure des scripts

```
scripts/
  scrape.js       → Outscraper API → prospects.json
  enrich.js       → GMB data → prospects_enriched.json
  generate.js     → Claude API → /sites/[slug]/index.html
  deploy.js       → Vercel API → URL par prospect → Supabase
  runner.js       → enchaîne les 4 scripts
```

### Commande de lancement

```bash
node runner.js --secteur restaurant --ville Paris --count 50
```

### Détail scrape.js
- Source : Outscraper API, requête `[secteur] [ville]`
- Filtre : note Google ≥ 3.5 + présence web faible ou nulle (= champ website GMB vide, ou contient un lien Facebook/Instagram/TikTok)
- Output : `prospects.json` (50-100 entrées max par batch)

### Détail generate.js
- Prompt Claude API avec données GMB : nom, secteur, ville, adresse, tel, horaires, photos, catégorie, note, avis
- Génère HTML vanilla complet : hero, services, avis Google, contact, footer
- Template adapté par secteur (restaurant ≠ artisan ≠ beauté)
- Style cohérent avec la charte Seuzaret Agency (dark, premium, violet #6366f1)

### Détail deploy.js
- Vercel API : deploy de `/sites/[slug]/index.html`
- URL générée : `[slug].vercel.app`
- Écriture dans Supabase : URL + statut "généré"

### Validation J4-J5
- Lancer runner sur un batch de 20 prospects (restaurants Paris)
- Vérifier qualité des sites générés
- Envoyer 20 emails manuellement via Lemlist
- Objectif : première réponse / première vente avant J7

---

## 6. Phase 2 — Outreach Lemlist (J6-J8)

### Séquence emails (3 touches)
- **Email 1 (J0) :** "J'ai construit une maquette de votre site — regardez : [URL]"
- **Email 2 (J+3) :** relance courte, reformulation valeur
- **Email 3 (J+7) :** dernière relance, urgence douce

### Script lemlist.js
- Lit Supabase : prospects avec statut = "généré"
- Ajoute chaque prospect à la campagne Lemlist via API (nom, email, URL site)
- **Source email :** Outscraper option "email enrichment" activée sur le scraping GMB — retourne l'email pro si disponible. Prospects sans email → exclus du batch automatique, traités manuellement si pertinents.
- Lemlist déclenche la séquence automatiquement

### Suivi statuts
- Webhooks Lemlist → endpoint Supabase
- Mise à jour automatique : envoyé → ouvert → cliqué → répondu

---

## 7. Phase 3 — Conversion & livraison (J9-J11)

### Flux de conversion
1. Prospect répond → Alexis envoie le Payment Link Stripe correspondant
2. Paiement confirmé → Stripe webhook → Supabase statut "payé"
3. Alexis finalise le site (1 round de modifications dans les 7 jours post-livraison, limité au contenu : textes, photos, horaires — pas de refonte design)
4. Connexion domaine perso via DNS Vercel (si le client en a un)
5. Statut → "livré"

### Abonnement mensuel
- Stripe gère la récurrence automatiquement après premier paiement
- Aucune action manuelle requise

### Délai : 7 jours maximum après paiement

---

## 8. Phase 4 — Dashboard web (J12-J14)

### URL : `seuzaret-agency.vercel.app/dashboard`
### Accès : mot de passe simple (pas d'auth complète pour le MVP)

### Contenu
- KPIs en haut : prospects générés / emails envoyés / taux ouverture / ventes / MRR
- Tableau prospects : nom, secteur, ville, URL générée, statut, offre, date
- Filtres : statut / secteur / ville
- Lien direct vers chaque site généré

### Architecture
- HTML/CSS/JS vanilla
- Fetch Supabase REST API côté client
- Auto-refresh toutes les 60 secondes

---

## 9. SEO/GEO — Post-lancement

Intégré dans les offres 599€ et 649€. Implémentation bloquée sur réception de la documentation d'Alexis.

**Quand la doc est reçue :**
- `generate.js` sera enrichi d'un mode `--seo` (balises meta, schema.org, contenu optimisé mots-clés)
- Mode `--geo` (optimisations pour citation par LLMs : structure données, autorité, citations)

---

## 10. Cibles et géographie

- **Industries :** restaurants/food (priorité 1), artisans/BTP (priorité 1), beauté/bien-être (secondaire)
- **Zone :** France entière
- **Volume par batch :** 50-100 prospects qualifiés (filtrés, pas du volume brut)

---

## 11. Points ouverts

- [x] Arrêt abonnement mensuel → site désactivé à la fin du mois en cours (Vercel project mis en pause)
- [ ] Dashboard mot de passe : hardcodé en variable d'environnement Vercel
