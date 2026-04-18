# Seuzaret Agency — Redesign Site Vitrine

**Date :** 2026-04-18  
**Objectif :** Refonte complète de index.html — site agence professionnel, une seule page, nav ancres, dark + violet, SEO/GEO optimisé

---

## 1. Structure générale

Single page HTML/CSS/JS vanilla. Nav sticky en haut avec liens ancres. Smooth scroll natif. Police Inter (Google Fonts). Animations CSS légères via IntersectionObserver (fade-in au scroll). Aucune librairie externe sauf Google Fonts.

**Sections dans l'ordre :**
1. Hero (`#accueil`)
2. Offres (`#offres`)
3. Prix (`#prix`)
4. Process (`#process`)
5. Réalisations (`#realisations`)
6. Contact (`#contact`)
7. Footer

---

## 2. Design system

```css
--bg: #0a0a0a
--bg2: #111111
--bg3: #1a1a1a
--border: #222222
--text: #f0f0f0
--muted: #888888
--accent: #6366f1
--accent-hover: #818cf8
--accent-glow: rgba(99, 102, 241, 0.15)
```

Police : Inter (weights 400, 600, 700, 800) via Google Fonts.

Animations : fade-in + translateY(20px) → translateY(0) au scroll via IntersectionObserver. Durée 0.5s ease-out. Pas d'animations lourdes.

---

## 3. Navigation

- Position : fixed top, pleine largeur
- Fond : transparent → `rgba(10,10,10,0.9)` avec `backdrop-filter: blur(20px)` au scroll (JS scroll listener)
- Gauche : logo "Seuzaret." (span violet sur le point)
- Droite : liens ancres — Accueil · Offres · Prix · Process · Réalisations · Contact
- CTA nav : bouton "Nous contacter" violet → `#contact`
- Mobile : liens ancres masqués, logo + bouton CTA uniquement (pas de hamburger menu pour le MVP)

---

## 4. Hero (`#accueil`)

- Hauteur : 100vh
- Glow violet radial centré derrière le titre
- Badge animé (pulse) : "Agence disponible — livraison 7 jours"
- H1 : "Votre site internet,<br><em>livré en 7 jours.</em>" (em = gradient violet)
- Sous-titre : "Seuzaret Agency crée des sites professionnels pour les TPE et PME françaises — vitrine, SEO et GEO inclus selon votre formule."
- CTA primaire : "Voir nos offres" → `#offres`
- CTA secondaire : "Nous contacter" → `#contact`

---

## 5. Offres (`#offres`)

3 cartes en grille responsive (minmax 300px). Positionnement agence "nous".

**Site Vitrine** (icône 🏠)
- Design premium sur mesure
- Responsive mobile/desktop
- Hébergement Vercel inclus
- Livraison en 7 jours

**Site Vitrine + SEO** (icône 📈)
- Tout le Vitrine +
- Balises meta optimisées
- Schema.org (LocalBusiness, Service)
- Contenu structuré Google
- Mots-clés métier ciblés

**Site Vitrine + SEO + GEO** (icône 🤖) — badge "Recommandé" violet
- Tout le SEO +
- Optimisation ChatGPT / Perplexity
- Données structurées JSON-LD
- Autorité de citation LLMs

---

## 6. Prix (`#prix`)

Tableau responsive 3 colonnes :

| | Vitrine | Vitrine + SEO | Vitrine + SEO + GEO |
|---|---|---|---|
| Création | 499€ | 599€ | 649€ |
| Maintenance | 19,99€/mois | 24,99€/mois | 24,99€/mois |

Ligne de réassurance sous le tableau : "La maintenance inclut hébergement, mises à jour et support. Résiliable à tout moment — site désactivé en fin de mois en cours."

CTA : "Demander un devis gratuit" → `#contact`

---

## 7. Process (`#process`)

Titre : "On s'adapte à vous"

4 cartes horizontales :

- **📩 Démo par email** — On génère une maquette de votre futur site et on vous l'envoie directement. Vous voyez le résultat avant de payer quoi que ce soit.
- **🎥 Présentation en visio** — Vous préférez qu'on vous présente le projet en direct ? On organise un appel à votre convenance.
- **✏️ Sur mesure** — Un besoin spécifique ? On part de zéro avec vous pour construire exactement ce qu'il vous faut.
- **⚡ Livraison 7 jours** — Quel que soit le mode choisi, votre site est en ligne en 7 jours maximum après validation.

---

## 8. Réalisations (`#realisations`)

Titre : "Exemples de sites créés"

3 cartes portfolio. Chaque carte :
- Aperçu visuel : fond dégradé sombre + emoji secteur (200px hauteur)
- Badge "Démo" en haut à droite (accent violet, petit)
- Secteur en petit (Restauration / Artisanat / Beauté & Bien-être)
- Nom fictif professionnel
- Description courte
- Bouton "Voir le site" → URL Vercel démo réelle (désactivé/grisé si URL non encore disponible)

**3 sites démos à générer et déployer sur Vercel :**
1. Restaurant — ex. "Le Bistrot du Marché" (Paris)
2. Artisan/plombier — ex. "Dupont Plomberie" (Lyon)
3. Beauté — ex. "Studio Lumière" (Bordeaux)

Ces sites sont générés via Claude API + déployés via Vercel API (même pipeline que les vrais prospects), sans les ajouter dans Supabase (ce sont des démos internes).

---

## 9. Contact (`#contact`)

Fond bg2. Titre centré : "Parlons de votre projet"
Sous-titre : "On vous répond dans la journée."

2 blocs côte à côte :
- **Email** : `alexis@seuzaret-agency.com` → `mailto:alexis@seuzaret-agency.com`
- **Téléphone** : `07 64 67 07 91` → `tel:+33764670791`

CTA principal : "Envoyer un email" → `mailto:alexis@seuzaret-agency.com?subject=Demande de devis — Seuzaret Agency`

---

## 10. Footer

- Gauche : logo "Seuzaret."
- Centre : liens ancres (Services · Prix · Process · Réalisations · Contact)
- Droite : © 2026 Seuzaret Agency
- Responsive : colonne centrée sur mobile

---

## 11. SEO / GEO technique

**SEO :**
- `<title>` : "Seuzaret Agency — Création de sites web professionnels pour TPE et PME"
- `<meta name="description">` : description courte avec mots-clés métier
- `<meta name="keywords">` : création site web, TPE PME, site vitrine, SEO, agence web France
- OpenGraph (og:title, og:description, og:image, og:url)
- Twitter Card
- Canonical URL : `https://seuzaret-agency.com`
- HTML sémantique : `<header>`, `<main>`, `<section>`, `<footer>`, headings hiérarchiques H1→H2→H3

**GEO (optimisation LLMs) :**
- JSON-LD Schema.org : `LocalBusiness` + `WebDesign` + `Service` (3 offres séparées)
- Entités claires et explicites dans le contenu textuel
- FAQ structurée en JSON-LD (questions clés : prix, délai, maintenance)
- Citations d'autorité : secteurs cibles, zones géographiques, technologies utilisées

---

## 12. Points exclus (post-lancement)

- FAQ section visible (ajoutée quand premiers clients obtenus)
- Section "Pourquoi nous" (ajoutée quand premiers résultats disponibles)
- Formulaire de contact intégré (remplace mailto si besoin ultérieur)
- Témoignages clients (ajoutés au fil des ventes)
