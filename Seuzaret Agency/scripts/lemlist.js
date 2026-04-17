const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const { LEMLIST_API_KEY, LEMLIST_CAMPAIGN_ID, SUPABASE_URL, SUPABASE_SERVICE_KEY } = require('./config');

const LEMLIST_BASE = 'https://api.lemlist.com/api';

async function pushProspectsToLemlist() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: prospects, error } = await supabase
    .from('prospects')
    .select('*')
    .eq('statut', 'genere');

  if (error) throw new Error(`Supabase select error: ${error.message}`);

  const withEmail = prospects.filter(p => p.email);
  console.log(`📧 ${withEmail.length}/${prospects.length} prospects avec email → Lemlist`);

  for (const prospect of withEmail) {
    try {
      await axios.post(
        `${LEMLIST_BASE}/campaigns/${LEMLIST_CAMPAIGN_ID}/leads`,
        {
          email: prospect.email,
          firstName: prospect.nom,
          companyName: prospect.nom,
          city: prospect.ville,
          siteUrl: prospect.url_generee,
        },
        {
          auth: { username: '', password: LEMLIST_API_KEY },
        }
      );

      await supabase
        .from('prospects')
        .update({ statut: 'envoye', date_envoi: new Date().toISOString() })
        .eq('id', prospect.id);

      console.log(`  ✅ ${prospect.nom} ajouté à Lemlist`);
    } catch (err) {
      console.error(`  ❌ ${prospect.nom}: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 300));
  }
}

module.exports = { pushProspectsToLemlist };
