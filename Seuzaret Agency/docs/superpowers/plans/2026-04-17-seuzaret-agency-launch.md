# Seuzaret Agency — Plan d'implémentation lancement complet

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire le pipeline complet scraping → génération sites → Vercel deploy → Lemlist outreach → Stripe conversion → dashboard en 2 semaines.

**Architecture:** Scripts Node.js séquentiels orchestrés par `runner.js`, Supabase comme base de données centrale, deux Vercel serverless functions pour les webhooks entrants, dashboard HTML vanilla déployé sur Vercel.

**Tech Stack:** Node.js 18+, Jest, `@supabase/supabase-js`, `@anthropic-ai/sdk`, `axios`, `dotenv`, Vercel API, Outscraper API, Lemlist API, Stripe API

---

## Structure des fichiers

```
scripts/
  config.js                   → variables d'env centralisées
  supabase.js                 → client Supabase partagé
  scrape.js                   → Outscraper → prospects.json
  enrich.js                   → GMB enrichissement → prospects_enriched.json
  generate.js                 → Claude API → HTML par prospect
  deploy.js                   → Vercel API + Supabase update
  lemlist.js                  → ajout prospects dans campagne Lemlist
  runner.js                   → orchestrateur principal
  __tests__/
    scrape.test.js
    enrich.test.js
    generate.test.js
    deploy.test.js
    lemlist.test.js

api/
  stripe-webhook.js           → Vercel serverless: Stripe → Supabase
  lemlist-webhook.js          → Vercel serverless: Lemlist → Supabase

dashboard/
  index.html                  → dashboard UI
  app.js                      → fetch Supabase, rendu tableau
  style.css                   → styles

supabase/
  migrations/
    001_prospects.sql         → schéma table prospects

.env.example
package.json
vercel.json
```

---

## Task 1 : Phase 0 — Setup business (J1, manuel)

Aucun code. Checklist à exécuter manuellement avant de toucher au code.

- [ ] **Domaine** : connecter `seuzaret-agency.com` à Vercel → Vercel Dashboard → Domains → Add → copier les nameservers chez ton registrar
- [ ] **Email** : créer `alexis@seuzaret-agency.com` sur [zoho.com/mail](https://www.zoho.com/mail/) → Free plan → Add domain
- [ ] **Mentions légales** : générer sur [mentions-legales.net](https://www.mentions-legales.net/) → copier dans `index.html` (section `#legal`)
- [ ] **CGV** : générer via [Legalstart](https://www.legalstart.fr/fiches-pratiques/protection-donnees-personnelles/cgv/) → sauvegarder en PDF dans `docs/cgv.pdf`
- [ ] **Stripe** : créer 5 produits dans le dashboard Stripe :
  - Vitrine — 499€ one-time
  - Vitrine + SEO — 599€ one-time
  - Vitrine + SEO + GEO — 649€ one-time
  - Maintenance standard — 19,99€/mois récurrent
  - Maintenance SEO/GEO — 24,99€/mois récurrent
- [ ] **Stripe** : générer 1 Payment Link par produit → noter les URLs dans un doc
- [ ] **Supabase** : créer un projet nommé `seuzaret-agency` sur [supabase.com](https://supabase.com) → noter l'URL et la service key
- [ ] **Outscraper** : créer un compte sur [outscraper.com](https://outscraper.com) → noter la clé API
- [ ] **Lemlist** : créer un compte sur [lemlist.com](https://lemlist.com) → créer une campagne "Seuzaret Agency V1" → noter l'API key et le campaign ID
- [ ] **Commit** : `git commit -m "docs: CGV et mentions légales ajoutées"`

---

## Task 2 : Initialisation du projet Node.js

**Fichiers :**
- Créer : `package.json`
- Créer : `.env.example`
- Créer : `scripts/config.js`
- Créer : `scripts/supabase.js`
- Créer : `vercel.json`

- [ ] **Créer `package.json`**

```json
{
  "name": "seuzaret-agency-pipeline",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "jest --testPathPattern=scripts/__tests__",
    "scrape": "node scripts/runner.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.52.0",
    "@supabase/supabase-js": "^2.49.4",
    "axios": "^1.9.0",
    "dotenv": "^16.5.0"
  },
  "devDependencies": {
    "jest": "^29.7.0"
  }
}
```

- [ ] **Créer `.env.example`**

```
OUTSCRAPER_API_KEY=
ANTHROPIC_API_KEY=
VERCEL_TOKEN=
VERCEL_SCOPE=alexisseuzaret-cryptos-projects
LEMLIST_API_KEY=
LEMLIST_CAMPAIGN_ID=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
SUPABASE_ANON_KEY=
DASHBOARD_PASSWORD=
STRIPE_WEBHOOK_SECRET=
```

- [ ] **Copier `.env.example` en `.env` et remplir les valeurs**

```bash
cp .env.example .env
```

- [ ] **Ajouter `.env` dans `.gitignore`** (vérifier qu'il y est déjà, sinon ajouter)

- [ ] **Créer `scripts/config.js`**

```javascript
require('dotenv').config();

module.exports = {
  OUTSCRAPER_API_KEY: process.env.OUTSCRAPER_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  VERCEL_TOKEN: process.env.VERCEL_TOKEN,
  VERCEL_SCOPE: process.env.VERCEL_SCOPE,
  LEMLIST_API_KEY: process.env.LEMLIST_API_KEY,
  LEMLIST_CAMPAIGN_ID: process.env.LEMLIST_CAMPAIGN_ID,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  DASHBOARD_PASSWORD: process.env.DASHBOARD_PASSWORD,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
};
```

- [ ] **Créer `scripts/supabase.js`**

```javascript
const { createClient } = require('@supabase/supabase-js');
const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = require('./config');

module.exports = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
```

- [ ] **Créer `vercel.json`**

```json
{
  "rewrites": [
    { "source": "/api/stripe-webhook", "destination": "/api/stripe-webhook.js" },
    { "source": "/api/lemlist-webhook", "destination": "/api/lemlist-webhook.js" },
    { "source": "/dashboard", "destination": "/dashboard/index.html" }
  ]
}
```

- [ ] **Installer les dépendances**

```bash
npm install
```

Résultat attendu : `node_modules/` créé, pas d'erreur.

- [ ] **Créer le dossier `scripts/__tests__/`**

```bash
mkdir -p scripts/__tests__
```

- [ ] **Commit**

```bash
git add package.json .env.example scripts/config.js scripts/supabase.js vercel.json
git commit -m "feat: initialisation projet Node.js pipeline"
```

---

## Task 3 : Schema Supabase

**Fichiers :**
- Créer : `supabase/migrations/001_prospects.sql`

- [ ] **Créer `supabase/migrations/001_prospects.sql`**

```sql
create table if not exists prospects (
  id              uuid primary key default gen_random_uuid(),
  nom             text not null,
  secteur         text not null,
  ville           text not null,
  tel             text,
  email           text,
  site_actuel     text,
  adresse         text,
  rating          numeric(2,1),
  reviews_count   integer,
  place_id        text unique,
  url_generee     text,
  statut          text not null default 'genere',
  offre           text,
  date_creation   timestamptz not null default now(),
  date_envoi      timestamptz,
  date_paiement   timestamptz,
  notes           text
);

-- Index pour les filtres dashboard
create index on prospects (statut);
create index on prospects (secteur);
create index on prospects (ville);

-- RLS: lecture publique avec anon key (dashboard)
alter table prospects enable row level security;

create policy "Lecture publique" on prospects
  for select using (true);

create policy "Écriture service key uniquement" on prospects
  for all using (auth.role() = 'service_role');
```

- [ ] **Appliquer la migration via MCP Supabase ou l'interface SQL Editor de Supabase**

Dans l'interface Supabase → SQL Editor → coller le contenu du fichier → Run.

Résultat attendu : table `prospects` créée avec 16 colonnes.

- [ ] **Vérifier dans Supabase** : Table Editor → prospects → table visible avec les colonnes correctes.

- [ ] **Commit**

```bash
git add supabase/
git commit -m "feat: schéma Supabase table prospects"
```

---

## Task 4 : scrape.js — Scraping Google Maps

**Fichiers :**
- Créer : `scripts/scrape.js`
- Créer : `scripts/__tests__/scrape.test.js`

- [ ] **Écrire le test en premier : `scripts/__tests__/scrape.test.js`**

```javascript
jest.mock('axios');
const axios = require('axios');
const { scrapeProspects, filterProspects } = require('../scrape');

const mockOutscraperResponse = {
  data: {
    status: 'Success',
    data: [[
      { name: 'Le Bon Bistrot', place_id: 'abc123', phone: '+33123456789', site: null, full_address: '1 rue de Paris, 75001 Paris', city: 'Paris', rating: 4.2, reviews: 120, subtypes: 'Restaurant, French restaurant', emails: ['contact@bistrot.fr'] },
      { name: 'Pizza Roma', place_id: 'def456', phone: '+33987654321', site: 'https://facebook.com/pizzaroma', full_address: '5 avenue de Lyon, 75012 Paris', city: 'Paris', rating: 3.8, reviews: 80, subtypes: 'Restaurant, Pizza restaurant', emails: [] },
      { name: 'Resto Michelin', place_id: 'ghi789', phone: '+33111111111', site: 'https://restomichelin.fr', full_address: '10 rue du Faubourg, 75008 Paris', city: 'Paris', rating: 4.8, reviews: 500, subtypes: 'Restaurant', emails: [] },
      { name: 'Mauvais Resto', place_id: 'jkl012', phone: null, site: null, full_address: '2 rue Test', city: 'Paris', rating: 2.0, reviews: 10, subtypes: 'Restaurant', emails: [] },
    ]]
  }
};

test('filterProspects retourne uniquement les prospects sans site web réel et note >= 3.5', () => {
  const places = mockOutscraperResponse.data.data[0];
  const filtered = filterProspects(places);
  expect(filtered).toHaveLength(2);
  expect(filtered[0].name).toBe('Le Bon Bistrot');
  expect(filtered[1].name).toBe('Pizza Roma');
});

test('scrapeProspects appelle Outscraper avec les bons paramètres', async () => {
  axios.get.mockResolvedValue(mockOutscraperResponse);
  const results = await scrapeProspects({ secteur: 'restaurant', ville: 'Paris', count: 10 });
  expect(axios.get).toHaveBeenCalledWith(
    'https://api.outscraper.com/maps/search-v3',
    expect.objectContaining({ params: expect.objectContaining({ query: 'restaurant Paris' }) })
  );
  expect(results.length).toBeLessThanOrEqual(10);
  expect(results[0]).toHaveProperty('nom');
  expect(results[0]).toHaveProperty('email');
});
```

- [ ] **Vérifier que le test échoue**

```bash
npx jest scripts/__tests__/scrape.test.js
```

Résultat attendu : FAIL "Cannot find module '../scrape'"

- [ ] **Implémenter `scripts/scrape.js`**

```javascript
const axios = require('axios');
const { OUTSCRAPER_API_KEY } = require('./config');

function filterProspects(places) {
  return places.filter(place => {
    const hasNoRealSite = !place.site ||
      place.site.includes('facebook.com') ||
      place.site.includes('instagram.com') ||
      place.site.includes('tiktok.com') ||
      place.site.includes('twitter.com');
    const hasGoodRating = !place.rating || place.rating >= 3.5;
    return hasNoRealSite && hasGoodRating;
  });
}

async function scrapeProspects({ secteur, ville, count = 50 }) {
  const response = await axios.get('https://api.outscraper.com/maps/search-v3', {
    params: {
      query: `${secteur} ${ville}`,
      limit: count * 2,
      language: 'fr',
      region: 'FR',
      async: false,
      fields: 'name,place_id,phone,site,full_address,city,rating,reviews,subtypes,emails',
    },
    headers: { 'X-API-KEY': OUTSCRAPER_API_KEY },
  });

  const places = response.data.data[0] || [];
  const filtered = filterProspects(places).slice(0, count);

  return filtered.map(place => ({
    nom: place.name,
    secteur,
    ville: place.city || ville,
    tel: place.phone || null,
    email: place.emails?.[0] || null,
    site_actuel: place.site || null,
    adresse: place.full_address || null,
    rating: place.rating || null,
    reviews_count: place.reviews || null,
    place_id: place.place_id,
    categories: place.subtypes || null,
  }));
}

module.exports = { scrapeProspects, filterProspects };
```

- [ ] **Vérifier que les tests passent**

```bash
npx jest scripts/__tests__/scrape.test.js
```

Résultat attendu : PASS (2 tests)

- [ ] **Commit**

```bash
git add scripts/scrape.js scripts/__tests__/scrape.test.js
git commit -m "feat: scrape.js — scraping Google Maps via Outscraper"
```

---

## Task 5 : enrich.js — Enrichissement GMB

**Fichiers :**
- Créer : `scripts/enrich.js`
- Créer : `scripts/__tests__/enrich.test.js`

- [ ] **Écrire le test en premier : `scripts/__tests__/enrich.test.js`**

```javascript
jest.mock('axios');
const axios = require('axios');
const { enrichProspect } = require('../enrich');

const mockDetailsResponse = {
  data: {
    status: 'Success',
    data: [[{
      place_id: 'abc123',
      working_hours: { Monday: '9:00-22:00', Tuesday: '9:00-22:00' },
      photos: ['https://lh3.google.com/photo1.jpg', 'https://lh3.google.com/photo2.jpg'],
      description: 'Restaurant traditionnel français au cœur de Paris.',
    }]]
  }
};

test('enrichProspect ajoute horaires, photos et description depuis GMB', async () => {
  axios.get.mockResolvedValue(mockDetailsResponse);
  const prospect = { nom: 'Le Bon Bistrot', place_id: 'abc123', secteur: 'restaurant' };
  const enriched = await enrichProspect(prospect);
  expect(enriched.horaires).toEqual({ Monday: '9:00-22:00', Tuesday: '9:00-22:00' });
  expect(enriched.photos).toHaveLength(2);
  expect(enriched.description).toBe('Restaurant traditionnel français au cœur de Paris.');
});

test('enrichProspect renvoie le prospect sans crash si GMB ne retourne rien', async () => {
  axios.get.mockResolvedValue({ data: { data: [[]] } });
  const prospect = { nom: 'Test', place_id: 'xyz', secteur: 'artisan' };
  const enriched = await enrichProspect(prospect);
  expect(enriched.horaires).toBeNull();
  expect(enriched.photos).toEqual([]);
});
```

- [ ] **Vérifier que le test échoue**

```bash
npx jest scripts/__tests__/enrich.test.js
```

Résultat attendu : FAIL "Cannot find module '../enrich'"

- [ ] **Implémenter `scripts/enrich.js`**

```javascript
const axios = require('axios');
const { OUTSCRAPER_API_KEY } = require('./config');

async function enrichProspect(prospect) {
  const response = await axios.get('https://api.outscraper.com/maps/place-details', {
    params: {
      query: prospect.place_id,
      fields: 'working_hours,photos,description',
      language: 'fr',
    },
    headers: { 'X-API-KEY': OUTSCRAPER_API_KEY },
  });

  const details = response.data.data?.[0]?.[0] || {};

  return {
    ...prospect,
    horaires: details.working_hours || null,
    photos: details.photos || [],
    description: details.description || null,
  };
}

async function enrichAll(prospects) {
  const results = [];
  for (const prospect of prospects) {
    const enriched = await enrichProspect(prospect);
    results.push(enriched);
    await new Promise(r => setTimeout(r, 300)); // éviter rate limit
  }
  return results;
}

module.exports = { enrichProspect, enrichAll };
```

- [ ] **Vérifier que les tests passent**

```bash
npx jest scripts/__tests__/enrich.test.js
```

Résultat attendu : PASS (2 tests)

- [ ] **Commit**

```bash
git add scripts/enrich.js scripts/__tests__/enrich.test.js
git commit -m "feat: enrich.js — enrichissement GMB via Outscraper"
```

---

## Task 6 : generate.js — Génération HTML via Claude API

**Fichiers :**
- Créer : `scripts/generate.js`
- Créer : `scripts/__tests__/generate.test.js`

- [ ] **Écrire le test : `scripts/__tests__/generate.test.js`**

```javascript
jest.mock('@anthropic-ai/sdk');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const fs = require('fs');
const { buildPrompt, generateSite, slugify } = require('../generate');

test('slugify convertit un nom en slug URL-safe', () => {
  expect(slugify('Le Bon Bistrot - Paris')).toBe('le-bon-bistrot-paris');
  expect(slugify('Plombier & Chauffagiste')).toBe('plombier-chauffagiste');
});

test('buildPrompt inclut les données du prospect', () => {
  const prospect = { nom: 'Le Bon Bistrot', secteur: 'restaurant', ville: 'Paris', adresse: '1 rue de Paris', tel: '+33123456789', rating: 4.2, reviews_count: 120, description: 'Resto sympa', horaires: { Monday: '9:00-22:00' }, photos: [] };
  const prompt = buildPrompt(prospect);
  expect(prompt).toContain('Le Bon Bistrot');
  expect(prompt).toContain('Paris');
  expect(prompt).toContain('4.2');
});

test('generateSite appelle Claude API et écrit un fichier HTML', async () => {
  const mockCreate = jest.fn().mockResolvedValue({
    content: [{ text: '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Le Bon Bistrot</h1></body></html>' }]
  });
  Anthropic.mockImplementation(() => ({ messages: { create: mockCreate } }));

  const prospect = { nom: 'Le Bon Bistrot', secteur: 'restaurant', ville: 'Paris', adresse: '1 rue', tel: '0123', rating: 4.2, reviews_count: 10, description: null, horaires: null, photos: [] };
  const result = await generateSite(prospect, '/tmp/test-sites');

  expect(mockCreate).toHaveBeenCalledTimes(1);
  expect(result.slug).toBe('le-bon-bistrot');
  expect(result.htmlPath).toContain('le-bon-bistrot');
  expect(fs.existsSync(result.htmlPath)).toBe(true);

  // Cleanup
  fs.rmSync(path.dirname(result.htmlPath), { recursive: true });
});
```

- [ ] **Vérifier que le test échoue**

```bash
npx jest scripts/__tests__/generate.test.js
```

Résultat attendu : FAIL

- [ ] **Implémenter `scripts/generate.js`**

```javascript
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { ANTHROPIC_API_KEY } = require('./config');

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildPrompt(prospect) {
  const horairesStr = prospect.horaires
    ? Object.entries(prospect.horaires).map(([j, h]) => `${j}: ${h}`).join(', ')
    : 'Non renseignés';

  return `Tu es un expert en web design premium pour petites entreprises françaises.
Génère un site web HTML/CSS complet et autonome (tout dans un seul fichier index.html) pour cette entreprise.

DONNÉES DE L'ENTREPRISE :
- Nom : ${prospect.nom}
- Secteur : ${prospect.secteur}
- Ville : ${prospect.ville}
- Adresse : ${prospect.adresse || 'Non renseignée'}
- Téléphone : ${prospect.tel || 'Non renseigné'}
- Note Google : ${prospect.rating || 'N/A'}/5 (${prospect.reviews_count || 0} avis)
- Description : ${prospect.description || 'Entreprise locale de qualité'}
- Horaires : ${horairesStr}

STYLE REQUIS :
- Design dark et premium
- Couleur principale : #6366f1 (violet)
- Couleur de fond : #0f0f0f
- Texte : #ffffff et #a1a1aa
- Police : Inter, system-ui, sans-serif
- Sections obligatoires (dans cet ordre) :
  1. Hero avec nom entreprise, accroche forte, bouton CTA "Nous contacter"
  2. Services/Spécialités (3-4 cards)
  3. Avis Google (${prospect.reviews_count || 0} avis, note ${prospect.rating || 'N/A'}/5)
  4. Section contact avec téléphone, adresse, lien Google Maps
  5. Footer avec copyright et "Site réalisé par Seuzaret Agency"
- Mobile-first, responsive via media queries
- Aucune dépendance externe (pas de CDN, pas de JavaScript externe)
- Utilise des dégradés CSS et formes géométriques, pas d'images externes

Retourne UNIQUEMENT le code HTML complet, sans aucune explication ni markdown.`;
}

async function generateSite(prospect, sitesDir = path.join(__dirname, '../sites')) {
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  const slug = slugify(prospect.nom);
  const outDir = path.join(sitesDir, slug);
  const htmlPath = path.join(outDir, 'index.html');

  fs.mkdirSync(outDir, { recursive: true });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [{ role: 'user', content: buildPrompt(prospect) }],
  });

  const html = response.content[0].text;
  fs.writeFileSync(htmlPath, html, 'utf-8');

  return { slug, htmlPath, html };
}

module.exports = { slugify, buildPrompt, generateSite };
```

- [ ] **Vérifier que les tests passent**

```bash
npx jest scripts/__tests__/generate.test.js
```

Résultat attendu : PASS (3 tests)

- [ ] **Commit**

```bash
git add scripts/generate.js scripts/__tests__/generate.test.js
git commit -m "feat: generate.js — génération HTML prospects via Claude API"
```

---

## Task 7 : deploy.js — Déploiement Vercel + écriture Supabase

**Fichiers :**
- Créer : `scripts/deploy.js`
- Créer : `scripts/__tests__/deploy.test.js`

- [ ] **Écrire le test : `scripts/__tests__/deploy.test.js`**

```javascript
jest.mock('axios');
jest.mock('../supabase');
const axios = require('axios');
const supabase = require('../supabase');
const { deployProspectSite } = require('../deploy');

test('deployProspectSite déploie sur Vercel et met à jour Supabase', async () => {
  axios.post.mockResolvedValue({ data: { url: 'sa-le-bon-bistrot.vercel.app', id: 'deploy123' } });
  const upsertMock = jest.fn().mockResolvedValue({ data: {}, error: null });
  supabase.from = jest.fn().mockReturnValue({ upsert: upsertMock });

  const prospect = { nom: 'Le Bon Bistrot', secteur: 'restaurant', ville: 'Paris', tel: null, email: null, site_actuel: null, adresse: null, rating: 4.2, reviews_count: 10, place_id: 'abc123' };
  const result = await deployProspectSite(prospect, '<!DOCTYPE html><html></html>', 'le-bon-bistrot');

  expect(axios.post).toHaveBeenCalledWith(
    'https://api.vercel.com/v13/deployments',
    expect.objectContaining({ name: 'sa-le-bon-bistrot' }),
    expect.any(Object)
  );
  expect(result.url).toBe('sa-le-bon-bistrot.vercel.app');
  expect(upsertMock).toHaveBeenCalled();
});
```

- [ ] **Vérifier que le test échoue**

```bash
npx jest scripts/__tests__/deploy.test.js
```

Résultat attendu : FAIL

- [ ] **Implémenter `scripts/deploy.js`**

```javascript
const axios = require('axios');
const supabase = require('./supabase');
const { VERCEL_TOKEN, VERCEL_SCOPE } = require('./config');

async function deployProspectSite(prospect, html, slug) {
  const projectName = `sa-${slug}`;

  const response = await axios.post(
    'https://api.vercel.com/v13/deployments',
    {
      name: projectName,
      files: [{ file: 'index.html', data: html }],
      projectSettings: { framework: null },
      target: 'production',
    },
    {
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      params: { teamId: VERCEL_SCOPE },
    }
  );

  const url = response.data.url;

  const { error } = await supabase.from('prospects').upsert({
    place_id: prospect.place_id,
    nom: prospect.nom,
    secteur: prospect.secteur,
    ville: prospect.ville,
    tel: prospect.tel,
    email: prospect.email,
    site_actuel: prospect.site_actuel,
    adresse: prospect.adresse,
    rating: prospect.rating,
    reviews_count: prospect.reviews_count,
    url_generee: `https://${url}`,
    statut: 'genere',
  }, { onConflict: 'place_id' });

  if (error) throw new Error(`Supabase upsert error: ${error.message}`);

  return { url: `https://${url}`, projectName };
}

module.exports = { deployProspectSite };
```

- [ ] **Vérifier que les tests passent**

```bash
npx jest scripts/__tests__/deploy.test.js
```

Résultat attendu : PASS

- [ ] **Commit**

```bash
git add scripts/deploy.js scripts/__tests__/deploy.test.js
git commit -m "feat: deploy.js — déploiement Vercel et écriture Supabase"
```

---

## Task 8 : runner.js — Orchestrateur principal

**Fichiers :**
- Créer : `scripts/runner.js`
- Modifier : `package.json` (script `scrape`)

- [ ] **Implémenter `scripts/runner.js`**

```javascript
const path = require('path');
const fs = require('fs');
const { scrapeProspects } = require('./scrape');
const { enrichAll } = require('./enrich');
const { generateSite } = require('./generate');
const { deployProspectSite } = require('./deploy');

const SITES_DIR = path.join(__dirname, '../sites');

async function run() {
  const args = process.argv.slice(2);
  const secteur = args[args.indexOf('--secteur') + 1] || 'restaurant';
  const ville = args[args.indexOf('--ville') + 1] || 'Paris';
  const count = parseInt(args[args.indexOf('--count') + 1] || '20', 10);

  console.log(`\n🔍 Scraping: ${count} ${secteur}s à ${ville}...`);
  const prospects = await scrapeProspects({ secteur, ville, count });
  console.log(`✅ ${prospects.length} prospects trouvés après filtrage`);

  fs.writeFileSync('prospects.json', JSON.stringify(prospects, null, 2));

  console.log('\n📊 Enrichissement GMB...');
  const enriched = await enrichAll(prospects);
  fs.writeFileSync('prospects_enriched.json', JSON.stringify(enriched, null, 2));
  console.log(`✅ ${enriched.length} prospects enrichis`);

  console.log('\n🎨 Génération des sites HTML...');
  for (let i = 0; i < enriched.length; i++) {
    const prospect = enriched[i];
    console.log(`  [${i + 1}/${enriched.length}] ${prospect.nom}...`);
    try {
      const { slug, html } = await generateSite(prospect, SITES_DIR);
      await deployProspectSite(prospect, html, slug);
      console.log(`  ✅ Déployé: https://sa-${slug}.vercel.app`);
    } catch (err) {
      console.error(`  ❌ Erreur ${prospect.nom}: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n🎉 Batch terminé.');
}

run().catch(console.error);
```

- [ ] **Tester en mode dry-run** (commenter les appels Vercel et Supabase dans deploy.js temporairement, ou utiliser un seul prospect)

```bash
node scripts/runner.js --secteur restaurant --ville Paris --count 2
```

Résultat attendu : 2 fichiers HTML générés dans `sites/`, logs affichés.

- [ ] **Ajouter `sites/` dans `.gitignore`**

Ajouter dans `.gitignore` :
```
sites/
prospects.json
prospects_enriched.json
```

- [ ] **Commit**

```bash
git add scripts/runner.js .gitignore
git commit -m "feat: runner.js — orchestrateur pipeline complet"
```

---

## Task 9 : lemlist.js — Intégration Lemlist

**Fichiers :**
- Créer : `scripts/lemlist.js`
- Créer : `scripts/__tests__/lemlist.test.js`

- [ ] **Écrire le test : `scripts/__tests__/lemlist.test.js`**

```javascript
jest.mock('axios');
jest.mock('../supabase');
const axios = require('axios');
const supabase = require('../supabase');
const { pushProspectsToLemlist } = require('../lemlist');

test('pushProspectsToLemlist ajoute les prospects avec email à Lemlist et met à jour Supabase', async () => {
  const prospects = [
    { id: 'uuid-1', nom: 'Le Bon Bistrot', email: 'contact@bistrot.fr', url_generee: 'https://sa-le-bon-bistrot.vercel.app', ville: 'Paris' },
    { id: 'uuid-2', nom: 'Sans Email', email: null, url_generee: 'https://sa-sans-email.vercel.app', ville: 'Lyon' },
  ];

  const fromMock = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: prospects, error: null }) };
  supabase.from = jest.fn().mockReturnValue(fromMock);

  axios.post.mockResolvedValue({ data: { _id: 'lead123' } });

  const updateMock = { update: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ error: null }) };
  supabase.from.mockReturnValueOnce(fromMock).mockReturnValue(updateMock);

  await pushProspectsToLemlist();

  // Seul le prospect avec email est envoyé à Lemlist
  expect(axios.post).toHaveBeenCalledTimes(1);
  expect(axios.post).toHaveBeenCalledWith(
    expect.stringContaining('/leads'),
    expect.objectContaining({ email: 'contact@bistrot.fr' }),
    expect.any(Object)
  );
});
```

- [ ] **Vérifier que le test échoue**

```bash
npx jest scripts/__tests__/lemlist.test.js
```

- [ ] **Implémenter `scripts/lemlist.js`**

```javascript
const axios = require('axios');
const supabase = require('./supabase');
const { LEMLIST_API_KEY, LEMLIST_CAMPAIGN_ID } = require('./config');

const LEMLIST_BASE = 'https://api.lemlist.com/api';

async function pushProspectsToLemlist() {
  const { data: prospects, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('statut', 'genere');

  if (error) throw new Error(`Supabase select error: ${error.message}`);

  const withEmail = prospects.filter(p => p.email);
  console.log(`📧 ${withEmail.length}/${prospects.length} prospects avec email → Lemlist`);

  for (const prospect of withEmail) {
    try {
      await axios.post(
        `${LEMLIST_BASE}/campaigns/${LEMLIST_CAMPAIGN_ID}/leads`,
        {
          email: prospect.email,
          firstName: prospect.nom,
          companyName: prospect.nom,
          city: prospect.ville,
          siteUrl: prospect.url_generee,
        },
        {
          auth: { username: '', password: LEMLIST_API_KEY },
        }
      );

      await supabase
        .from('prospects')
        .update({ statut: 'envoye', date_envoi: new Date().toISOString() })
        .eq('id', prospect.id);

      console.log(`  ✅ ${prospect.nom} ajouté à Lemlist`);
    } catch (err) {
      console.error(`  ❌ ${prospect.nom}: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 300));
  }
}

module.exports = { pushProspectsToLemlist };
```

- [ ] **Vérifier que les tests passent**

```bash
npx jest scripts/__tests__/lemlist.test.js
```

Résultat attendu : PASS

- [ ] **Commit**

```bash
git add scripts/lemlist.js scripts/__tests__/lemlist.test.js
git commit -m "feat: lemlist.js — intégration Lemlist API"
```

---

## Task 10 : Webhooks Vercel serverless

**Fichiers :**
- Créer : `api/stripe-webhook.js`
- Créer : `api/lemlist-webhook.js`

- [ ] **Créer `api/stripe-webhook.js`**

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let event;
  try {
    event = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    const metadata = event.data.object.metadata || {};
    const customerEmail = event.data.object.customer_details?.email || event.data.object.receipt_email;
    const offre = metadata.offre || null;

    if (customerEmail) {
      await supabase
        .from('prospects')
        .update({ statut: 'paye', date_paiement: new Date().toISOString(), offre })
        .eq('email', customerEmail);
    }
  }

  res.status(200).json({ received: true });
};
```

- [ ] **Créer `api/lemlist-webhook.js`**

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const STATUT_MAP = {
  emailOpened: 'ouvert',
  emailClicked: 'clique',
  emailReplied: 'repondu',
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let payload;
  try {
    payload = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const newStatut = STATUT_MAP[payload.type];
  if (newStatut && payload.lead?.email) {
    await supabase
      .from('prospects')
      .update({ statut: newStatut })
      .eq('email', payload.lead.email);
  }

  res.status(200).json({ received: true });
};
```

- [ ] **Configurer les webhooks dans les dashboards tiers**
  - **Stripe** : Dashboard Stripe → Developers → Webhooks → Add endpoint → URL : `https://seuzaret-agency.vercel.app/api/stripe-webhook` → Events : `checkout.session.completed`, `payment_intent.succeeded`
  - **Lemlist** : Settings → Webhooks → Add → URL : `https://seuzaret-agency.vercel.app/api/lemlist-webhook` → Events : emailOpened, emailClicked, emailReplied

- [ ] **Commit**

```bash
git add api/
git commit -m "feat: webhooks Stripe et Lemlist (Vercel serverless)"
```

---

## Task 11 : Dashboard web

**Fichiers :**
- Créer : `dashboard/index.html`
- Créer : `dashboard/app.js`
- Créer : `dashboard/style.css`

- [ ] **Créer `dashboard/style.css`**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: Inter, system-ui, sans-serif;
  background: #0f0f0f;
  color: #ffffff;
  min-height: 100vh;
  padding: 2rem;
}

#login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
}

#login input {
  padding: .75rem 1rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  width: 280px;
}

#login button {
  padding: .75rem 2rem;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
}

h1 { font-size: 1.5rem; margin-bottom: 1.5rem; }

.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.kpi {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.25rem;
}

.kpi .value { font-size: 2rem; font-weight: 700; color: #6366f1; }
.kpi .label { font-size: .8rem; color: #a1a1aa; margin-top: .25rem; }

.filters { display: flex; gap: .75rem; margin-bottom: 1.5rem; flex-wrap: wrap; }

.filters select, .filters input {
  padding: .5rem .75rem;
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 8px;
  color: #fff;
  font-size: .875rem;
}

table { width: 100%; border-collapse: collapse; font-size: .875rem; }
th { text-align: left; padding: .75rem 1rem; color: #a1a1aa; border-bottom: 1px solid #333; }
td { padding: .75rem 1rem; border-bottom: 1px solid #1a1a1a; }
tr:hover td { background: #1a1a1a; }

.badge {
  display: inline-block;
  padding: .2rem .6rem;
  border-radius: 100px;
  font-size: .75rem;
  font-weight: 600;
}

.badge.genere { background: #333; color: #a1a1aa; }
.badge.envoye { background: #1e3a5f; color: #60a5fa; }
.badge.ouvert { background: #1e3a5f; color: #93c5fd; }
.badge.clique { background: #1e4a3a; color: #34d399; }
.badge.repondu { background: #2e3a1e; color: #86efac; }
.badge.paye { background: #2d1e4a; color: #c084fc; }
.badge.livre { background: #1a3a1a; color: #4ade80; }

a { color: #6366f1; text-decoration: none; }
a:hover { text-decoration: underline; }
```

- [ ] **Créer `dashboard/app.js`**

```javascript
const SUPABASE_URL = 'REPLACE_WITH_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'REPLACE_WITH_SUPABASE_ANON_KEY';
const DASHBOARD_PASSWORD = 'REPLACE_WITH_DASHBOARD_PASSWORD';

let allProspects = [];

function checkLogin() {
  const stored = sessionStorage.getItem('sa_auth');
  if (stored === 'ok') { showDashboard(); return; }
  document.getElementById('login').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
}

function login() {
  const pw = document.getElementById('pw').value;
  if (pw === DASHBOARD_PASSWORD) {
    sessionStorage.setItem('sa_auth', 'ok');
    showDashboard();
  } else {
    alert('Mot de passe incorrect');
  }
}

function showDashboard() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  fetchProspects();
}

async function fetchProspects() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/prospects?select=*&order=date_creation.desc`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  allProspects = await res.json();
  render(allProspects);
}

function render(prospects) {
  updateKPIs(prospects);
  renderTable(prospects);
}

function updateKPIs(prospects) {
  const generes = prospects.length;
  const envoyes = prospects.filter(p => ['envoye','ouvert','clique','repondu','paye','livre'].includes(p.statut)).length;
  const payes = prospects.filter(p => ['paye','livre'].includes(p.statut)).length;
  const mrr = prospects.filter(p => ['paye','livre'].includes(p.statut) && p.offre).reduce((sum, p) => {
    if (p.offre === 'geo') return sum + 24.99;
    if (p.offre === 'seo') return sum + 24.99;
    return sum + 19.99;
  }, 0);

  document.getElementById('kpi-generes').textContent = generes;
  document.getElementById('kpi-envoyes').textContent = envoyes;
  document.getElementById('kpi-payes').textContent = payes;
  document.getElementById('kpi-mrr').textContent = mrr.toFixed(2) + '€';
}

function renderTable(prospects) {
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = prospects.map(p => `
    <tr>
      <td>${p.nom}</td>
      <td>${p.secteur}</td>
      <td>${p.ville}</td>
      <td>${p.email || '—'}</td>
      <td>${p.url_generee ? `<a href="${p.url_generee}" target="_blank">Voir</a>` : '—'}</td>
      <td><span class="badge ${p.statut}">${p.statut}</span></td>
      <td>${p.offre || '—'}</td>
      <td>${p.date_creation ? new Date(p.date_creation).toLocaleDateString('fr-FR') : '—'}</td>
    </tr>
  `).join('');
}

function filterTable() {
  const statut = document.getElementById('f-statut').value;
  const secteur = document.getElementById('f-secteur').value;
  const search = document.getElementById('f-search').value.toLowerCase();
  const filtered = allProspects.filter(p =>
    (!statut || p.statut === statut) &&
    (!secteur || p.secteur === secteur) &&
    (!search || p.nom.toLowerCase().includes(search) || p.ville.toLowerCase().includes(search))
  );
  render(filtered);
}

setInterval(fetchProspects, 60000);
checkLogin();
```

- [ ] **Créer `dashboard/index.html`**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seuzaret Agency — Dashboard</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<div id="login" style="display:none">
  <h2>Dashboard</h2>
  <input type="password" id="pw" placeholder="Mot de passe" onkeydown="if(event.key==='Enter')login()">
  <button onclick="login()">Accéder</button>
</div>

<div id="dashboard" style="display:none">
  <h1>Seuzaret Agency — Pipeline</h1>

  <div class="kpis">
    <div class="kpi"><div class="value" id="kpi-generes">—</div><div class="label">Sites générés</div></div>
    <div class="kpi"><div class="value" id="kpi-envoyes">—</div><div class="label">Emails envoyés</div></div>
    <div class="kpi"><div class="value" id="kpi-payes">—</div><div class="label">Ventes</div></div>
    <div class="kpi"><div class="value" id="kpi-mrr">—</div><div class="label">MRR</div></div>
  </div>

  <div class="filters">
    <select id="f-statut" onchange="filterTable()">
      <option value="">Tous les statuts</option>
      <option value="genere">Généré</option>
      <option value="envoye">Envoyé</option>
      <option value="ouvert">Ouvert</option>
      <option value="clique">Cliqué</option>
      <option value="repondu">Répondu</option>
      <option value="paye">Payé</option>
      <option value="livre">Livré</option>
    </select>
    <select id="f-secteur" onchange="filterTable()">
      <option value="">Tous les secteurs</option>
      <option value="restaurant">Restaurant</option>
      <option value="artisan">Artisan</option>
      <option value="beaute">Beauté</option>
    </select>
    <input id="f-search" placeholder="Rechercher..." oninput="filterTable()">
  </div>

  <table>
    <thead>
      <tr>
        <th>Nom</th><th>Secteur</th><th>Ville</th><th>Email</th>
        <th>Site</th><th>Statut</th><th>Offre</th><th>Date</th>
      </tr>
    </thead>
    <tbody id="tbody"></tbody>
  </table>
</div>

<script src="app.js"></script>
</body>
</html>
```

- [ ] **Remplacer les constantes dans `dashboard/app.js`** avec les vraies valeurs depuis `.env` (SUPABASE_URL, SUPABASE_ANON_KEY, DASHBOARD_PASSWORD)

- [ ] **Commit**

```bash
git add dashboard/
git commit -m "feat: dashboard web prospects Supabase"
```

---

## Task 12 : Déploiement final et validation

- [ ] **Déployer sur Vercel**

```bash
vercel deploy --token $VERCEL_TOKEN --scope alexisseuzaret-cryptos-projects --prod
```

- [ ] **Vérifier les URLs** :
  - `https://seuzaret-agency.vercel.app` → site vitrine
  - `https://seuzaret-agency.vercel.app/dashboard` → dashboard (mot de passe requis)

- [ ] **Lancer un premier batch de test réel** (20 restaurants Paris) :

```bash
node scripts/runner.js --secteur restaurant --ville Paris --count 20
```

- [ ] **Vérifier dans Supabase** : 20 prospects visibles avec statut "genere" et url_generee remplie

- [ ] **Vérifier dans le dashboard** : KPIs et tableau affichent les données correctement

- [ ] **Lancer lemlist.js** :

```bash
node scripts/lemlist.js
```

- [ ] **Vérifier dans Lemlist** : prospects avec email ajoutés à la campagne

- [ ] **Commit final**

```bash
git add -A
git commit -m "chore: validation pipeline complet — premier batch opérationnel"
```

---

## Task 13 : Gestion annulation abonnement mensuel

Quand un client annule son abonnement mensuel Stripe :
- [ ] Stripe notifie via webhook l'événement `customer.subscription.deleted`
- [ ] Dans `api/stripe-webhook.js`, ajouter le case : mettre le statut prospect à `annule` dans Supabase
- [ ] Aller dans Vercel Dashboard → projet `sa-[slug]` → Settings → Pause deployment
- [ ] Confirmer par email au client que le site sera désactivé à la fin du mois en cours

> Pour le MVP, la pause Vercel est manuelle. L'automatisation (Vercel API pause) peut être ajoutée plus tard.

---

## Task 14 : SEO/GEO — En attente documentation (bloqué)

> **BLOQUÉ** : implémentation suspendue jusqu'à réception de la documentation SEO/GEO par Alexis.

Quand la documentation est reçue :
- Enrichir `buildPrompt()` dans `generate.js` avec un mode `--seo` (balises meta, schema.org, mots-clés)
- Ajouter mode `--geo` (structure autorité pour citation LLM)
- Ajouter flag `--seo` et `--geo` au `runner.js`

---

## Tous les tests

```bash
npx jest scripts/__tests__/
```

Résultat attendu : PASS — 9+ tests en vert.
