const SUPABASE_URL = 'https://npsawjqcncvothsrrmpc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wc2F3anFjbmN2b3Roc3JybXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjU1NzUsImV4cCI6MjA5MjA0MTU3NX0.t0aCBFqTQzfqwxcrKHRUEsBrv3hZvKaWPCn-MWPrsRU';
const DASHBOARD_PASSWORD = 'REPLACE_WITH_DASHBOARD_PASSWORD';

let allProspects = [];

function checkLogin() {
  const stored = sessionStorage.getItem('sa_auth');
  if (stored === 'ok') { showDashboard(); return; }
  document.getElementById('login').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
}

function login() {
  const pw = document.getElementById('pw').value;
  if (pw === DASHBOARD_PASSWORD) {
    sessionStorage.setItem('sa_auth', 'ok');
    showDashboard();
  } else {
    alert('Mot de passe incorrect');
  }
}

function showDashboard() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  fetchProspects();
}

async function fetchProspects() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/prospects?select=*&order=date_creation.desc`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  allProspects = await res.json();
  render(allProspects);
}

function render(prospects) {
  updateKPIs(prospects);
  renderTable(prospects);
}

function updateKPIs(prospects) {
  const generes = prospects.length;
  const envoyes = prospects.filter(p => ['envoye','ouvert','clique','repondu','paye','livre'].includes(p.statut)).length;
  const payes = prospects.filter(p => ['paye','livre'].includes(p.statut)).length;
  const mrr = prospects.filter(p => ['paye','livre'].includes(p.statut) && p.offre).reduce((sum, p) => {
    if (p.offre === 'geo') return sum + 24.99;
    if (p.offre === 'seo') return sum + 24.99;
    return sum + 19.99;
  }, 0);

  document.getElementById('kpi-generes').textContent = generes;
  document.getElementById('kpi-envoyes').textContent = envoyes;
  document.getElementById('kpi-payes').textContent = payes;
  document.getElementById('kpi-mrr').textContent = mrr.toFixed(2) + '€';
}

function renderTable(prospects) {
  const tbody = document.getElementById('tbody');
  tbody.innerHTML = prospects.map(p => `
    <tr>
      <td>${p.nom}</td>
      <td>${p.secteur}</td>
      <td>${p.ville}</td>
      <td>${p.email || '—'}</td>
      <td>${p.url_generee ? `<a href="${p.url_generee}" target="_blank">Voir</a>` : '—'}</td>
      <td><span class="badge ${p.statut}">${p.statut}</span></td>
      <td>${p.offre || '—'}</td>
      <td>${p.date_creation ? new Date(p.date_creation).toLocaleDateString('fr-FR') : '—'}</td>
    </tr>
  `).join('');
}

function filterTable() {
  const statut = document.getElementById('f-statut').value;
  const secteur = document.getElementById('f-secteur').value;
  const search = document.getElementById('f-search').value.toLowerCase();
  const filtered = allProspects.filter(p =>
    (!statut || p.statut === statut) &&
    (!secteur || p.secteur === secteur) &&
    (!search || p.nom.toLowerCase().includes(search) || p.ville.toLowerCase().includes(search))
  );
  render(filtered);
}

setInterval(fetchProspects, 60000);
checkLogin();
