require('dotenv').config();
const axios = require('axios');
const { generateSite } = require('./generate');
const { VERCEL_TOKEN, VERCEL_SCOPE } = require('./config');

const DEMOS = [
  {
    nom: 'Le Bistrot du Marché',
    secteur: 'Restaurant français traditionnel',
    ville: 'Paris',
    adresse: '14 rue de Bretagne, 75003 Paris',
    tel: '01 42 78 45 12',
    rating: 4.7,
    reviews_count: 312,
    description: 'Bistrot parisien traditionnel proposant une cuisine du marché, faite maison chaque jour. Spécialités : entrecôte, tartare, crème brûlée.',
    horaires: {
      'Lundi-Vendredi': '12h00-14h30 / 19h00-22h30',
      'Samedi': '12h00-23h00',
      'Dimanche': 'Fermé',
    },
  },
  {
    nom: 'Dupont Plomberie',
    secteur: 'Plombier chauffagiste',
    ville: 'Lyon',
    adresse: '8 avenue Jean Jaurès, 69007 Lyon',
    tel: '04 72 61 38 90',
    rating: 4.9,
    reviews_count: 187,
    description: 'Plombier chauffagiste à Lyon depuis 2009. Intervention urgence 24h/24. Dépannage, installation, rénovation salle de bain.',
    horaires: {
      'Lundi-Vendredi': '7h30-19h00',
      'Samedi': '8h00-17h00',
      'Dimanche': 'Urgences uniquement',
    },
  },
  {
    nom: 'Studio Lumière',
    secteur: 'Salon de coiffure',
    ville: 'Bordeaux',
    adresse: '22 cours de l\'Intendance, 33000 Bordeaux',
    tel: '05 56 44 29 17',
    rating: 4.8,
    reviews_count: 241,
    description: 'Salon de coiffure mixte au cœur de Bordeaux. Coupes, colorations, soins kératine, balayages. Équipe de 4 coiffeurs expérimentés.',
    horaires: {
      'Mardi-Vendredi': '9h00-19h00',
      'Samedi': '9h00-18h00',
      'Dimanche-Lundi': 'Fermé',
    },
  },
];

async function deployDemo(html, slug) {
  const projectName = `sa-demo-${slug}`;

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

  return `https://${response.data.url}`;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateWithRetry(demo, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateSite(demo);
    } catch (err) {
      if (err.status === 429) {
        const retryAfter = parseInt(err.headers?.get?.('retry-after') || '120', 10);
        const wait = (retryAfter + 10) * 1000;
        console.log(`  ⏳ Rate limit — attente ${retryAfter + 10}s (tentative ${attempt}/${maxRetries})…`);
        await sleep(wait);
      } else {
        throw err;
      }
    }
  }
  throw new Error('Max retries atteint');
}

async function main() {
  const filter = process.argv.slice(2);
  const demosToRun = filter.length
    ? DEMOS.filter(d => filter.some(f => d.nom.toLowerCase().includes(f) || d.secteur.toLowerCase().includes(f)))
    : DEMOS;

  for (let i = 0; i < demosToRun.length; i++) {
    const demo = demosToRun[i];
    console.log(`\n→ Génération : ${demo.nom} (${demo.ville})`);

    const { slug, html } = await generateWithRetry(demo);
    console.log(`  ✓ Site généré (${html.length} caractères)`);

    const url = await deployDemo(html, slug);
    console.log(`  ✓ Déployé : ${url}`);

    const key = demo.secteur.includes('Restaurant') ? 'RESTAURANT' : demo.secteur.includes('Plomb') ? 'ARTISAN' : 'BEAUTE';
    console.log(`  DEMO_URL_${key} = ${url}`);
  }
}

main().catch(console.error);
