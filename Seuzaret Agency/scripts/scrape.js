const axios = require('axios');
const { OUTSCRAPER_API_KEY } = require('./config');

// Filtre les prospects sans site réel (réseaux sociaux ou absent) et avec une bonne note
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

// Scrape les prospects Google Maps via l'API Outscraper
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
