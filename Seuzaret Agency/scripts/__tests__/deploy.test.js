jest.mock('axios');
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({})),
}));

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
  expect(result.url).toBe('https://sa-le-bon-bistrot.vercel.app');
  expect(upsertMock).toHaveBeenCalled();
});
