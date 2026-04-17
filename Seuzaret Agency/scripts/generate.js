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
