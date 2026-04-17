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
