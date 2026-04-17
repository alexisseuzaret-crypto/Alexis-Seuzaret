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
