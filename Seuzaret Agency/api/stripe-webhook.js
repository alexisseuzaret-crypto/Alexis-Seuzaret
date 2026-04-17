const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  let event;
  try {
    event = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    const metadata = event.data.object.metadata || {};
    const customerEmail = event.data.object.customer_details?.email || event.data.object.receipt_email;
    const offre = metadata.offre || null;

    if (customerEmail) {
      await supabase
        .from('prospects')
        .update({ statut: 'paye', date_paiement: new Date().toISOString(), offre })
        .eq('email', customerEmail);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerEmail = event.data.object.customer_email || null;
    if (customerEmail) {
      await supabase
        .from('prospects')
        .update({ statut: 'annule' })
        .eq('email', customerEmail);
    }
  }

  res.status(200).json({ received: true });
};
