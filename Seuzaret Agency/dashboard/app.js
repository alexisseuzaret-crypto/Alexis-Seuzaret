const SUPABASE_URL = 'https://npsawjqcncvothsrrmpc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wc2F3anFjbmN2b3Roc3JybXBjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjU1NzUsImV4cCI6MjA5MjA0MTU3NX0.t0aCBFqTQzfqwxcrKHRUEsBrv3hZvKaWPCn-MWPrsRU';
const DASHBOARD_PASSWORD = 'seuzaret2026';

const STATUT_ORDER = { repondu: 0, clique: 1, ouvert: 2, envoye: 3, genere: 4, paye: 5, livre: 6, annule: 7 };
const TOUS_STATUTS = ['genere','envoye','ouvert','clique','repondu','paye','livre','annule'];
const HOT = ['clique','repondu'];
const PRIX_OFFRE = { geo: 649, seo: 599, vitrine: 499 };
const MRR_OFFRE  = { geo: 24.99, seo: 24.99, vitrine: 19.99 };

let allProspects = [];
let countdown = 30;

// ─── LOGIN ────────────────────────────────────────────────────────────────────

function checkLogin() {
  if (sessionStorage.getItem('sa_auth') === 'ok') { showDashboard(); return; }
  document.getElementById('login').style.display = 'flex';
}

function login() {
  if (document.getElementById('pw').value === DASHBOARD_PASSWORD) {
    sessionStorage.setItem('sa_auth', 'ok');
    showDashboard();
  } else {
    document.getElementById('login-error').textContent = 'Mot de passe incorrect';
  }
}

function showDashboard() {
  document.getElementById('login').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  fetchProspects();
  startCountdown();
}

// ─── COUNTDOWN ───────────────────────────────────────────────────────────────

function startCountdown() {
  setInterval(() => {
    countdown--;
    document.getElementById('countdown').textContent = countdown;
    if (countdown <= 0) { fetchProspects(); countdown = 30; }
  }, 1000);
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

async function fetchProspects() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/prospects?select=*&order=date_creation.desc`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
    });
    if (!res.ok) return;
    allProspects = await res.json();
    render(allProspects);
  } catch { /* garde les données existantes */ }
}

async function updateStatut(id, statut) {
  await fetch(`${SUPABASE_URL}/rest/v1/prospects?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify({ statut })
  });
  const p = allProspects.find(p => p.id === id);
  if (p) { p.statut = statut; render(allProspects); }
}

// ─── RENDER ──────────────────────────────────────────────────────────────────

function render(prospects) {
  renderFunnel(prospects);
  renderKPIs(prospects);
  renderTable(applyFilters(prospects));
}

function renderFunnel(prospects) {
  const steps = [
    { label: 'Générés',  include: ['genere','envoye','ouvert','clique','repondu','paye','livre'] },
    { label: 'Envoyés',  include: ['envoye','ouvert','clique','repondu','paye','livre'] },
    { label: 'Ouverts',  include: ['ouvert','clique','repondu','paye','livre'] },
    { label: 'Cliqués',  include: ['clique','repondu','paye','livre'], hot: true },
    { label: 'Répondus', include: ['repondu','paye','livre'], hot: true },
    { label: 'Payés',    include: ['paye','livre'] },
  ];

  document.getElementById('funnel').innerHTML = steps.map((step, i) => {
    const n    = prospects.filter(p => step.include.includes(p.statut)).length;
    const prev = i > 0 ? prospects.filter(p => steps[i-1].include.includes(p.statut)).length : null;
    const pct  = prev ? Math.round(n / prev * 100) : null;
    return `
      <div class="funnel-step${step.hot ? ' hot' : ''}">
        <div class="fn">${n}</div>
        <div class="fl">${step.label}</div>
        ${pct !== null ? `<div class="fp">${pct}%</div>` : ''}
      </div>
      ${i < steps.length - 1 ? '<div class="fa">›</div>' : ''}
    `;
  }).join('');
}

function renderKPIs(prospects) {
  const hot      = prospects.filter(p => HOT.includes(p.statut)).length;
  const envoyes  = prospects.filter(p => ['envoye','ouvert','clique','repondu','paye','livre'].includes(p.statut)).length;
  const payes    = prospects.filter(p => ['paye','livre'].includes(p.statut)).length;
  const taux     = envoyes > 0 ? Math.round(payes / envoyes * 100) : 0;
  const payedArr = prospects.filter(p => ['paye','livre'].includes(p.statut));
  const ca       = payedArr.reduce((s, p) => s + (PRIX_OFFRE[p.offre] || 499), 0);
  const mrr      = payedArr.reduce((s, p) => s + (MRR_OFFRE[p.offre]  || 19.99), 0);

  document.getElementById('kpi-hot').textContent        = hot;
  document.getElementById('kpi-conversion').textContent = taux + '%';
  document.getElementById('kpi-ca').textContent         = ca.toLocaleString('fr-FR') + ' €';
  document.getElementById('kpi-mrr').textContent        = mrr.toFixed(2) + ' €';

  const hotCard = document.getElementById('kpi-hot-card');
  hotCard.classList.toggle('has-hot', hot > 0);
}

function renderTable(prospects) {
  const sorted = [...prospects].sort((a, b) =>
    (STATUT_ORDER[a.statut] ?? 9) - (STATUT_ORDER[b.statut] ?? 9)
  );

  document.getElementById('tbody').innerHTML = sorted.map(p => `
    <tr class="${HOT.includes(p.statut) ? 'row-hot' : ''}">
      <td><strong>${p.nom || '—'}</strong></td>
      <td>${p.secteur || '—'}</td>
      <td>${p.ville || '—'}</td>
      <td>${p.email ? `<a href="mailto:${p.email}">${p.email}</a>` : '—'}</td>
      <td>${p.url_generee ? `<a href="${p.url_generee}" target="_blank" class="btn-site">Voir →</a>` : '—'}</td>
      <td>
        <select class="statut-sel s-${p.statut}" onchange="updateStatut(${p.id}, this.value)">
          ${TOUS_STATUTS.map(s => `<option value="${s}"${s===p.statut?' selected':''}>${cap(s)}</option>`).join('')}
        </select>
      </td>
      <td>${p.offre || '—'}</td>
      <td>${p.date_creation ? new Date(p.date_creation).toLocaleDateString('fr-FR') : '—'}</td>
    </tr>
  `).join('');

  document.getElementById('count-label').textContent =
    `${prospects.length} lead${prospects.length !== 1 ? 's' : ''}`;
}

// ─── FILTERS ─────────────────────────────────────────────────────────────────

function applyFilters(prospects) {
  const statut  = document.getElementById('f-statut').value;
  const secteur = document.getElementById('f-secteur').value;
  const search  = document.getElementById('f-search').value.toLowerCase();
  return prospects.filter(p =>
    (!statut  || p.statut  === statut) &&
    (!secteur || p.secteur === secteur) &&
    (!search  || (p.nom  && p.nom.toLowerCase().includes(search)) ||
                 (p.ville && p.ville.toLowerCase().includes(search)))
  );
}

function filterTable() {
  renderFunnel(allProspects);
  renderKPIs(allProspects);
  renderTable(applyFilters(allProspects));
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

document.getElementById('f-search').addEventListener('input', filterTable);

checkLogin();
