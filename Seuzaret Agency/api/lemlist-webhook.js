const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const STATUT_MAP = {
  emailOpened: 'ouvert',
  emailClicked: 'clique',
  emailReplied: 'repondu',
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let payload;
  try {
    payload = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const newStatut = STATUT_MAP[payload.type];
  if (newStatut && payload.lead?.email) {
    await supabase
      .from('prospects')
      .update({ statut: newStatut })
      .eq('email', payload.lead.email);
  }

  res.status(200).json({ received: true });
};
