jest.mock('@anthropic-ai/sdk');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');
const fs = require('fs');
const { buildPrompt, generateSite, slugify } = require('../generate');

test('slugify convertit un nom en slug URL-safe', () => {
  expect(slugify('Le Bon Bistrot - Paris')).toBe('le-bon-bistrot-paris');
  expect(slugify('Plombier & Chauffagiste')).toBe('plombier-chauffagiste');
});

test('buildPrompt inclut les données du prospect', () => {
  const prospect = { nom: 'Le Bon Bistrot', secteur: 'restaurant', ville: 'Paris', adresse: '1 rue de Paris', tel: '+33123456789', rating: 4.2, reviews_count: 120, description: 'Resto sympa', horaires: { Monday: '9:00-22:00' }, photos: [] };
  const prompt = buildPrompt(prospect);
  expect(prompt).toContain('Le Bon Bistrot');
  expect(prompt).toContain('Paris');
  expect(prompt).toContain('4.2');
});

test('generateSite appelle Claude API et écrit un fichier HTML', async () => {
  const mockCreate = jest.fn().mockResolvedValue({
    content: [{ text: '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Le Bon Bistrot</h1></body></html>' }]
  });
  Anthropic.mockImplementation(() => ({ messages: { create: mockCreate } }));

  const prospect = { nom: 'Le Bon Bistrot', secteur: 'restaurant', ville: 'Paris', adresse: '1 rue', tel: '0123', rating: 4.2, reviews_count: 10, description: null, horaires: null, photos: [] };
  const result = await generateSite(prospect, '/tmp/test-sites');

  expect(mockCreate).toHaveBeenCalledTimes(1);
  expect(result.slug).toBe('le-bon-bistrot');
  expect(result.htmlPath).toContain('le-bon-bistrot');
  expect(fs.existsSync(result.htmlPath)).toBe(true);

  // Cleanup
  fs.rmSync(path.dirname(result.htmlPath), { recursive: true });
});
