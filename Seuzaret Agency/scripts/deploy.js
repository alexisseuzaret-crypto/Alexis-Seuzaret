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
