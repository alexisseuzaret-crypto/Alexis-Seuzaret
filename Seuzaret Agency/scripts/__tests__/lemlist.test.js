jest.mock('axios');
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({}))
}));
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { pushProspectsToLemlist } = require('../lemlist');

test('pushProspectsToLemlist ajoute les prospects avec email à Lemlist et met à jour Supabase', async () => {
  const prospects = [
    { id: 'uuid-1', nom: 'Le Bon Bistrot', email: 'contact@bistrot.fr', url_generee: 'https://sa-le-bon-bistrot.vercel.app', ville: 'Paris' },
    { id: 'uuid-2', nom: 'Sans Email', email: null, url_generee: 'https://sa-sans-email.vercel.app', ville: 'Lyon' },
  ];

  const fromMock = { select: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ data: prospects, error: null }) };
  const updateMock = { update: jest.fn().mockReturnThis(), eq: jest.fn().mockResolvedValue({ error: null }) };
  const mockFrom = jest.fn()
    .mockReturnValueOnce(fromMock)
    .mockReturnValue(updateMock);

  createClient.mockReturnValue({ from: mockFrom });
  axios.post.mockResolvedValue({ data: { _id: 'lead123' } });

  await pushProspectsToLemlist();

  expect(axios.post).toHaveBeenCalledTimes(1);
  expect(axios.post).toHaveBeenCalledWith(
    expect.stringContaining('/leads'),
    expect.objectContaining({ email: 'contact@bistrot.fr' }),
    expect.any(Object)
  );
});
