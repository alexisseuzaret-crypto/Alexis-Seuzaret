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
    await new Promise(r => setTimeout(r, 300));
  }
  return results;
}

module.exports = { enrichProspect, enrichAll };
