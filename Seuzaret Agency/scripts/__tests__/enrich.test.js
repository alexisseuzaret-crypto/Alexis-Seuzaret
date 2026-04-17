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
