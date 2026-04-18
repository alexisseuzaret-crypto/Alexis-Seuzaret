# Site Vitrine Redesign — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refonte complète de `index.html` — single page avec nav ancres sticky, dark + violet, SEO/GEO optimisé, 3 démos Vercel, fix dashboard routing.

**Architecture:** Un seul fichier HTML vanilla self-contained (CSS inline + JS en bas). Animations via IntersectionObserver natif. 3 sites démos générés via script Node.js réutilisant le pipeline `generate.js` + Vercel API directe (sans Supabase).

**Tech Stack:** HTML/CSS/JS vanilla, Inter via Google Fonts, Node.js + @anthropic-ai/sdk + axios (scripts existants), Vercel API

---

## Fichiers touchés

| Fichier | Action |
|---|---|
| `index.html` | Réécriture complète |
| `vercel.json` | Supprimer rewrite `/dashboard` redondant |
| `scripts/generate-demo.js` | Créer — génère + déploie 3 sites démos |

---

### Task 1: Réécriture complète index.html

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Sauvegarder l'original**

```bash
cp index.html index.html.bak
```

- [ ] **Step 2: Remplacer entièrement index.html**

Écrire le contenu suivant dans `index.html` (remplace tout le fichier) :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seuzaret Agency — Création de sites web professionnels pour TPE et PME</title>
  <meta name="description" content="Seuzaret Agency crée des sites web professionnels pour les TPE et PME françaises. Site vitrine, SEO et GEO. Livraison en 7 jours. À partir de 499€.">
  <meta name="keywords" content="création site web, site vitrine, TPE PME, SEO, GEO, agence web France, site internet professionnel">
  <meta property="og:title" content="Seuzaret Agency — Création de sites web professionnels">
  <meta property="og:description" content="Sites web professionnels pour TPE et PME françaises. Vitrine, SEO et GEO. Livraison 7 jours. À partir de 499€.">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://seuzaret-agency.com">
  <meta property="og:locale" content="fr_FR">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Seuzaret Agency — Création de sites web professionnels">
  <meta name="twitter:description" content="Sites web professionnels pour TPE et PME françaises. Livraison 7 jours.">
  <link rel="canonical" href="https://seuzaret-agency.com">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://seuzaret-agency.com/#organization",
        "name": "Seuzaret Agency",
        "url": "https://seuzaret-agency.com",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+33-7-64-67-07-91",
          "email": "alexis@seuzaret-agency.com",
          "contactType": "customer service",
          "availableLanguage": "French"
        },
        "areaServed": "FR",
        "knowsAbout": ["création site web", "SEO", "GEO", "sites vitrine", "TPE PME"]
      },
      {
        "@type": "WebSite",
        "@id": "https://seuzaret-agency.com/#website",
        "url": "https://seuzaret-agency.com",
        "name": "Seuzaret Agency",
        "description": "Création de sites web professionnels pour TPE et PME françaises — vitrine, SEO et GEO",
        "publisher": { "@id": "https://seuzaret-agency.com/#organization" }
      },
      {
        "@type": "Service",
        "name": "Site Vitrine",
        "provider": { "@id": "https://seuzaret-agency.com/#organization" },
        "description": "Création de site vitrine professionnel responsive en 7 jours pour TPE et PME",
        "offers": { "@type": "Offer", "price": "499", "priceCurrency": "EUR" }
      },
      {
        "@type": "Service",
        "name": "Site Vitrine + SEO",
        "provider": { "@id": "https://seuzaret-agency.com/#organization" },
        "description": "Site vitrine avec optimisation SEO complète pour Google — balises meta, schema.org, mots-clés métier",
        "offers": { "@type": "Offer", "price": "599", "priceCurrency": "EUR" }
      },
      {
        "@type": "Service",
        "name": "Site Vitrine + SEO + GEO",
        "provider": { "@id": "https://seuzaret-agency.com/#organization" },
        "description": "Site vitrine avec SEO et GEO — optimisation pour les IA conversationnelles ChatGPT et Perplexity",
        "offers": { "@type": "Offer", "price": "649", "priceCurrency": "EUR" }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Quel est le délai de livraison d'un site web chez Seuzaret Agency ?",
            "acceptedAnswer": { "@type": "Answer", "text": "Tous nos sites sont livrés en 7 jours maximum après validation du projet." }
          },
          {
            "@type": "Question",
            "name": "Combien coûte un site web chez Seuzaret Agency ?",
            "acceptedAnswer": { "@type": "Answer", "text": "Nos sites commencent à 499€ pour un site vitrine, 599€ avec SEO, et 649€ avec SEO + GEO. La maintenance mensuelle est de 19,99€/mois ou 24,99€/mois selon la formule." }
          },
          {
            "@type": "Question",
            "name": "Qu'est-ce que le GEO (Generative Engine Optimization) ?",
            "acceptedAnswer": { "@type": "Answer", "text": "Le GEO optimise votre site pour être cité et recommandé par les IA conversationnelles comme ChatGPT et Perplexity, en complément du référencement Google classique." }
          },
          {
            "@type": "Question",
            "name": "Comment se déroule la collaboration avec Seuzaret Agency ?",
            "acceptedAnswer": { "@type": "Answer", "text": "Nous nous adaptons à vos préférences : envoi d'une démo par email, présentation en visio, ou construction sur mesure à partir de vos besoins. Livraison garantie en 7 jours." }
          }
        ]
      }
    ]
  }
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0a0a0a;
      --bg2: #111111;
      --bg3: #1a1a1a;
      --border: #222222;
      --text: #f0f0f0;
      --muted: #888888;
      --accent: #6366f1;
      --accent-hover: #818cf8;
      --accent-glow: rgba(99, 102, 241, 0.15);
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      overflow-x: hidden;
    }

    /* ANIMATIONS */
    .animate {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    .animate.visible { opacity: 1; transform: translateY(0); }
    .delay-1 { transition-delay: 0.1s; }
    .delay-2 { transition-delay: 0.2s; }
    .delay-3 { transition-delay: 0.3s; }
    .delay-4 { transition-delay: 0.4s; }

    /* NAV */
    nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      padding: 18px 48px;
      display: flex; justify-content: space-between; align-items: center;
      transition: background 0.3s, border-color 0.3s;
      border-bottom: 1px solid transparent;
    }
    nav.scrolled {
      background: rgba(10, 10, 10, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom-color: var(--border);
    }
    .nav-logo {
      font-size: 18px; font-weight: 800; letter-spacing: -0.5px;
      text-decoration: none; color: var(--text);
    }
    .nav-logo span { color: var(--accent); }
    .nav-links {
      display: flex; align-items: center; gap: 32px;
    }
    .nav-links a {
      color: var(--muted); text-decoration: none; font-size: 14px;
      font-weight: 500; transition: color 0.2s;
    }
    .nav-links a:hover { color: var(--text); }
    .nav-cta {
      background: var(--accent); color: #fff;
      padding: 9px 20px; border-radius: 8px;
      text-decoration: none; font-size: 14px; font-weight: 600;
      transition: background 0.2s, transform 0.15s;
      white-space: nowrap;
    }
    .nav-cta:hover { background: var(--accent-hover); transform: translateY(-1px); }

    /* BOUTONS */
    .btn-primary {
      background: var(--accent); color: #fff;
      padding: 15px 30px; border-radius: 10px;
      text-decoration: none; font-size: 15px; font-weight: 600;
      transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
      display: inline-block; border: none; cursor: pointer;
    }
    .btn-primary:hover {
      background: var(--accent-hover); transform: translateY(-2px);
      box-shadow: 0 8px 28px rgba(99,102,241,0.4);
    }
    .btn-secondary {
      background: transparent; color: var(--text);
      padding: 15px 30px; border-radius: 10px;
      text-decoration: none; font-size: 15px; font-weight: 600;
      border: 1px solid var(--border); transition: border-color 0.2s, color 0.2s;
      display: inline-block;
    }
    .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }

    /* SECTIONS COMMUNES */
    section { padding: 100px 40px; }
    .section-inner { max-width: 1100px; margin: 0 auto; }
    .section-header { margin-bottom: 56px; }
    .section-tag {
      display: inline-block; color: var(--accent);
      font-size: 12px; font-weight: 700; letter-spacing: 1.5px;
      text-transform: uppercase; margin-bottom: 14px;
    }
    .section-title {
      font-size: clamp(28px, 4vw, 44px); font-weight: 800;
      letter-spacing: -1.5px; line-height: 1.12; margin-bottom: 14px;
    }
    .section-sub { color: var(--muted); font-size: 17px; max-width: 520px; line-height: 1.7; }

    /* HERO */
    .hero {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      text-align: center; padding: 120px 40px 80px;
      position: relative; overflow: hidden;
    }
    .hero-glow {
      position: absolute; top: 15%; left: 50%; transform: translateX(-50%);
      width: 700px; height: 700px;
      background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%);
      pointer-events: none;
    }
    .hero-content { position: relative; z-index: 1; }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--accent-glow); border: 1px solid rgba(99,102,241,0.3);
      color: var(--accent-hover);
      padding: 7px 18px; border-radius: 100px;
      font-size: 13px; font-weight: 500; margin-bottom: 32px;
    }
    .hero-badge-dot {
      width: 7px; height: 7px; background: var(--accent); border-radius: 50%;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
    .hero h1 {
      font-size: clamp(42px, 6.5vw, 76px); font-weight: 800;
      line-height: 1.08; letter-spacing: -2.5px;
      margin-bottom: 24px; max-width: 860px;
    }
    .hero h1 em {
      font-style: normal;
      background: linear-gradient(135deg, var(--accent) 0%, #a78bfa 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .hero-sub {
      font-size: 18px; color: var(--muted); max-width: 540px;
      margin: 0 auto 48px; line-height: 1.75;
    }
    .hero-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }

    /* OFFRES */
    #offres { background: var(--bg); }
    .offres-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }
    .offre-card {
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: 16px; padding: 36px;
      transition: border-color 0.25s, transform 0.25s;
      position: relative;
    }
    .offre-card:hover { border-color: var(--accent); transform: translateY(-4px); }
    .offre-card.recommended { border-color: rgba(99,102,241,0.5); }
    .offre-badge {
      position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
      background: var(--accent); color: #fff;
      padding: 4px 16px; border-radius: 100px;
      font-size: 12px; font-weight: 700; white-space: nowrap;
    }
    .offre-icon {
      width: 50px; height: 50px; background: var(--accent-glow);
      border: 1px solid rgba(99,102,241,0.2); border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; margin-bottom: 24px;
    }
    .offre-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; letter-spacing: -0.3px; }
    .offre-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .offre-list li {
      display: flex; align-items: flex-start; gap: 10px;
      color: var(--muted); font-size: 14px; line-height: 1.5;
    }
    .offre-list li::before {
      content: '✓'; color: var(--accent); font-weight: 700;
      font-size: 13px; margin-top: 1px; flex-shrink: 0;
    }

    /* PRIX */
    #prix { background: var(--bg2); }
    .prix-table-wrap { overflow-x: auto; border-radius: 12px; border: 1px solid var(--border); }
    .prix-table { width: 100%; border-collapse: collapse; min-width: 500px; }
    .prix-table th, .prix-table td {
      padding: 20px 24px; text-align: center;
      border-bottom: 1px solid var(--border);
    }
    .prix-table th {
      font-size: 13px; font-weight: 700; color: var(--muted);
      text-transform: uppercase; letter-spacing: 0.8px;
      background: var(--bg3);
    }
    .prix-table td:first-child { text-align: left; color: var(--muted); font-size: 14px; font-weight: 500; }
    .prix-table tr:last-child td { border-bottom: none; }
    .prix-montant { font-size: 24px; font-weight: 800; color: var(--text); letter-spacing: -0.5px; display: block; }
    .prix-mensuel { font-size: 14px; color: var(--accent); font-weight: 600; display: block; }
    .col-featured { background: rgba(99,102,241,0.05); }
    .prix-note {
      text-align: center; margin-top: 24px;
      color: var(--muted); font-size: 14px; line-height: 1.8;
    }
    .prix-cta { text-align: center; margin-top: 36px; }

    /* PROCESS */
    #process { background: var(--bg); }
    .process-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
      gap: 24px;
    }
    .process-card {
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: 16px; padding: 32px;
      transition: border-color 0.25s, transform 0.25s;
    }
    .process-card:hover { border-color: var(--accent); transform: translateY(-4px); }
    .process-icon { font-size: 28px; margin-bottom: 18px; display: block; }
    .process-title { font-size: 17px; font-weight: 700; margin-bottom: 10px; }
    .process-desc { color: var(--muted); font-size: 14px; line-height: 1.7; }

    /* RÉALISATIONS */
    #realisations { background: var(--bg2); }
    .realisations-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }
    .realisation-card {
      background: var(--bg3); border: 1px solid var(--border);
      border-radius: 16px; overflow: hidden;
      transition: transform 0.25s, border-color 0.25s;
    }
    .realisation-card:hover { transform: translateY(-4px); border-color: var(--accent); }
    .realisation-preview {
      height: 180px; display: flex; align-items: center; justify-content: center;
      font-size: 44px; position: relative;
    }
    .realisation-preview.restaurant { background: linear-gradient(135deg, #1a0808 0%, #2d1010 100%); }
    .realisation-preview.artisan    { background: linear-gradient(135deg, #080d1a 0%, #0f1a2d 100%); }
    .realisation-preview.beaute     { background: linear-gradient(135deg, #150815 0%, #280d28 100%); }
    .realisation-demo-badge {
      position: absolute; top: 12px; right: 12px;
      background: var(--accent); color: #fff;
      padding: 3px 10px; border-radius: 100px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.5px;
    }
    .realisation-info { padding: 24px; }
    .realisation-sector {
      font-size: 11px; font-weight: 700; color: var(--accent);
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
    }
    .realisation-name { font-size: 17px; font-weight: 700; margin-bottom: 8px; }
    .realisation-desc { color: var(--muted); font-size: 13px; line-height: 1.6; margin-bottom: 16px; }
    .btn-demo {
      display: inline-block; padding: 9px 18px;
      border: 1px solid var(--border); border-radius: 8px;
      color: var(--muted); text-decoration: none; font-size: 13px; font-weight: 600;
      transition: border-color 0.2s, color 0.2s;
    }
    .btn-demo:not(.disabled):hover { border-color: var(--accent); color: var(--accent); }
    .btn-demo.disabled { opacity: 0.35; pointer-events: none; cursor: not-allowed; }

    /* CONTACT */
    #contact { background: var(--bg); }
    .contact-inner { max-width: 680px; margin: 0 auto; text-align: center; }
    .contact-blocks {
      display: flex; gap: 20px; justify-content: center;
      flex-wrap: wrap; margin-top: 48px; margin-bottom: 36px;
    }
    .contact-block {
      background: var(--bg2); border: 1px solid var(--border);
      border-radius: 16px; padding: 32px 40px;
      text-decoration: none; color: var(--text);
      transition: border-color 0.25s, transform 0.25s;
      min-width: 210px; flex: 1; max-width: 280px;
    }
    .contact-block:hover { border-color: var(--accent); transform: translateY(-3px); }
    .contact-block-icon { font-size: 28px; margin-bottom: 14px; display: block; }
    .contact-block-label {
      font-size: 11px; font-weight: 700; color: var(--muted);
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;
    }
    .contact-block-value { font-size: 15px; font-weight: 600; color: var(--text); }

    /* FOOTER */
    footer {
      padding: 36px 48px; border-top: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center;
      flex-wrap: wrap; gap: 16px;
    }
    .footer-logo { font-weight: 800; font-size: 16px; }
    .footer-logo span { color: var(--accent); }
    .footer-links { display: flex; gap: 28px; flex-wrap: wrap; }
    .footer-links a { color: var(--muted); text-decoration: none; font-size: 13px; transition: color 0.2s; }
    .footer-links a:hover { color: var(--text); }
    .footer-copy { color: var(--muted); font-size: 13px; }

    /* RESPONSIVE */
    @media (max-width: 768px) {
      nav { padding: 16px 20px; }
      .nav-links { display: none; }
      section { padding: 80px 20px; }
      .hero { padding: 100px 20px 60px; }
      footer { padding: 28px 20px; flex-direction: column; text-align: center; }
      .footer-links { justify-content: center; }
      .contact-blocks { flex-direction: column; align-items: center; }
      .contact-block { width: 100%; max-width: 320px; }
    }
  </style>
</head>
<body>

  <!-- NAV -->
  <nav id="nav">
    <a href="#accueil" class="nav-logo">Seuzaret<span>.</span></a>
    <div class="nav-links">
      <a href="#accueil">Accueil</a>
      <a href="#offres">Offres</a>
      <a href="#prix">Prix</a>
      <a href="#process">Process</a>
      <a href="#realisations">Réalisations</a>
    </div>
    <a href="#contact" class="nav-cta">Nous contacter</a>
  </nav>

  <!-- HERO -->
  <section id="accueil" class="hero">
    <div class="hero-glow"></div>
    <div class="hero-content">
      <div class="hero-badge animate">
        <span class="hero-badge-dot"></span>
        Agence disponible — livraison 7 jours
      </div>
      <h1 class="animate delay-1">Votre site internet,<br><em>livré en 7 jours.</em></h1>
      <p class="hero-sub animate delay-2">Seuzaret Agency crée des sites professionnels pour les TPE et PME françaises — vitrine, SEO et GEO inclus selon votre formule.</p>
      <div class="hero-actions animate delay-3">
        <a href="#offres" class="btn-primary">Voir nos offres</a>
        <a href="#contact" class="btn-secondary">Nous contacter</a>
      </div>
    </div>
  </section>

  <!-- OFFRES -->
  <section id="offres">
    <div class="section-inner">
      <div class="section-header animate">
        <span class="section-tag">Nos offres</span>
        <h2 class="section-title">Ce que nous créons<br>pour vous</h2>
        <p class="section-sub">Des sites conçus pour attirer vos clients et vous démarquer durablement.</p>
      </div>
      <div class="offres-grid">
        <div class="offre-card animate delay-1">
          <div class="offre-icon">🏠</div>
          <div class="offre-title">Site Vitrine</div>
          <ul class="offre-list">
            <li>Design premium sur mesure</li>
            <li>Responsive mobile et desktop</li>
            <li>Hébergement Vercel inclus</li>
            <li>Livraison en 7 jours</li>
          </ul>
        </div>
        <div class="offre-card animate delay-2">
          <div class="offre-icon">📈</div>
          <div class="offre-title">Site Vitrine + SEO</div>
          <ul class="offre-list">
            <li>Tout le Vitrine inclus</li>
            <li>Balises meta optimisées</li>
            <li>Schema.org (LocalBusiness)</li>
            <li>Contenu structuré Google</li>
            <li>Mots-clés métier ciblés</li>
          </ul>
        </div>
        <div class="offre-card recommended animate delay-3">
          <div class="offre-badge">Recommandé</div>
          <div class="offre-icon">🤖</div>
          <div class="offre-title">Site Vitrine + SEO + GEO</div>
          <ul class="offre-list">
            <li>Tout le SEO inclus</li>
            <li>Optimisation ChatGPT / Perplexity</li>
            <li>Données structurées JSON-LD</li>
            <li>Autorité de citation LLMs</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- PRIX -->
  <section id="prix">
    <div class="section-inner">
      <div class="section-header animate">
        <span class="section-tag">Tarifs</span>
        <h2 class="section-title">Des prix clairs,<br>sans surprise</h2>
      </div>
      <div class="prix-table-wrap animate">
        <table class="prix-table">
          <thead>
            <tr>
              <th></th>
              <th>Vitrine</th>
              <th class="col-featured">Vitrine + SEO</th>
              <th>Vitrine + SEO + GEO</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Création (une fois)</td>
              <td><span class="prix-montant">499€</span></td>
              <td class="col-featured"><span class="prix-montant">599€</span></td>
              <td><span class="prix-montant">649€</span></td>
            </tr>
            <tr>
              <td>Maintenance mensuelle</td>
              <td><span class="prix-mensuel">19,99€/mois</span></td>
              <td class="col-featured"><span class="prix-mensuel">24,99€/mois</span></td>
              <td><span class="prix-mensuel">24,99€/mois</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="prix-note animate">La maintenance inclut hébergement, mises à jour et support.<br>Résiliable à tout moment — site désactivé en fin de mois en cours.</p>
      <div class="prix-cta animate">
        <a href="#contact" class="btn-primary">Demander un devis gratuit</a>
      </div>
    </div>
  </section>

  <!-- PROCESS -->
  <section id="process">
    <div class="section-inner">
      <div class="section-header animate">
        <span class="section-tag">Notre approche</span>
        <h2 class="section-title">On s'adapte à vous</h2>
        <p class="section-sub">Chaque client est différent. Nous choisissons ensemble le mode de collaboration qui vous convient le mieux.</p>
      </div>
      <div class="process-grid">
        <div class="process-card animate delay-1">
          <span class="process-icon">📩</span>
          <div class="process-title">Démo par email</div>
          <p class="process-desc">On génère une maquette de votre futur site et on vous l'envoie directement. Vous voyez le résultat avant de payer quoi que ce soit.</p>
        </div>
        <div class="process-card animate delay-2">
          <span class="process-icon">🎥</span>
          <div class="process-title">Présentation en visio</div>
          <p class="process-desc">Vous préférez qu'on vous présente le projet en direct ? On organise un appel à votre convenance.</p>
        </div>
        <div class="process-card animate delay-3">
          <span class="process-icon">✏️</span>
          <div class="process-title">Sur mesure</div>
          <p class="process-desc">Un besoin spécifique ? On part de zéro avec vous pour construire exactement ce qu'il vous faut.</p>
        </div>
        <div class="process-card animate delay-4">
          <span class="process-icon">⚡</span>
          <div class="process-title">Livraison 7 jours</div>
          <p class="process-desc">Quel que soit le mode choisi, votre site est en ligne en 7 jours maximum après validation.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- RÉALISATIONS -->
  <section id="realisations">
    <div class="section-inner">
      <div class="section-header animate">
        <span class="section-tag">Réalisations</span>
        <h2 class="section-title">Exemples de sites<br>créés</h2>
      </div>
      <div class="realisations-grid">
        <div class="realisation-card animate delay-1">
          <div class="realisation-preview restaurant">
            🍕
            <span class="realisation-demo-badge">Démo</span>
          </div>
          <div class="realisation-info">
            <div class="realisation-sector">Restauration</div>
            <div class="realisation-name">Le Bistrot du Marché</div>
            <p class="realisation-desc">Site vitrine restaurant avec menu, horaires et contact. Design sombre et appétissant.</p>
            <a href="DEMO_URL_RESTAURANT" class="btn-demo disabled" target="_blank">Voir le site →</a>
          </div>
        </div>
        <div class="realisation-card animate delay-2">
          <div class="realisation-preview artisan">
            🔧
            <span class="realisation-demo-badge">Démo</span>
          </div>
          <div class="realisation-info">
            <div class="realisation-sector">Artisanat</div>
            <div class="realisation-name">Dupont Plomberie</div>
            <p class="realisation-desc">Site vitrine artisan avec services, zone d'intervention et contact rapide.</p>
            <a href="DEMO_URL_ARTISAN" class="btn-demo disabled" target="_blank">Voir le site →</a>
          </div>
        </div>
        <div class="realisation-card animate delay-3">
          <div class="realisation-preview beaute">
            💇
            <span class="realisation-demo-badge">Démo</span>
          </div>
          <div class="realisation-info">
            <div class="realisation-sector">Beauté & Bien-être</div>
            <div class="realisation-name">Studio Lumière</div>
            <p class="realisation-desc">Site vitrine salon de beauté avec prestations, galerie et prise de contact.</p>
            <a href="DEMO_URL_BEAUTE" class="btn-demo disabled" target="_blank">Voir le site →</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CONTACT -->
  <section id="contact">
    <div class="section-inner">
      <div class="contact-inner">
        <div class="animate">
          <span class="section-tag">Contact</span>
          <h2 class="section-title">Parlons de<br>votre projet</h2>
          <p class="section-sub" style="margin: 0 auto;">On vous répond dans la journée.</p>
        </div>
        <div class="contact-blocks">
          <a href="mailto:alexis@seuzaret-agency.com?subject=Demande de devis — Seuzaret Agency" class="contact-block animate delay-1">
            <span class="contact-block-icon">📧</span>
            <div class="contact-block-label">Email</div>
            <div class="contact-block-value">alexis@seuzaret-agency.com</div>
          </a>
          <a href="tel:+33764670791" class="contact-block animate delay-2">
            <span class="contact-block-icon">📞</span>
            <div class="contact-block-label">Téléphone</div>
            <div class="contact-block-value">07 64 67 07 91</div>
          </a>
        </div>
        <div class="animate delay-3">
          <a href="mailto:alexis@seuzaret-agency.com?subject=Demande de devis — Seuzaret Agency" class="btn-primary">Envoyer un email</a>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer>
    <div class="footer-logo">Seuzaret<span>.</span></div>
    <div class="footer-links">
      <a href="#offres">Offres</a>
      <a href="#prix">Prix</a>
      <a href="#process">Process</a>
      <a href="#realisations">Réalisations</a>
      <a href="#contact">Contact</a>
    </div>
    <div class="footer-copy">© 2026 Seuzaret Agency</div>
  </footer>

  <script>
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate').forEach(el => observer.observe(el));
  </script>

</body>
</html>
```

- [ ] **Step 3: Ouvrir index.html dans un navigateur et vérifier**

Ouvrir directement `index.html` dans Chrome (file://). Vérifier :
- Nav sticky fonctionne au scroll
- Toutes les sections s'affichent dans l'ordre
- Animations fade-in au scroll
- Responsive sur mobile (DevTools → mobile)
- Liens ancres nav scrollent vers la bonne section
- Email et téléphone cliquables dans la section Contact
- Cards Réalisations ont bien les boutons "disabled" (grisés)

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: refonte complète site vitrine — single page nav ancres dark+violet"
```

---

### Task 2: Fix dashboard routing (vercel.json)

**Files:**
- Modify: `vercel.json`

**Contexte :** La rewrite `/dashboard` → `/dashboard/index.html` est redondante. Vercel sert automatiquement `dashboard/index.html` à l'URL `/dashboard` via ses clean URLs. La rewrite peut créer un conflit. La supprimer suffit.

- [ ] **Step 1: Modifier vercel.json**

Remplacer le contenu de `vercel.json` par :

```json
{
  "rewrites": [
    { "source": "/api/stripe-webhook", "destination": "/api/stripe-webhook.js" },
    { "source": "/api/lemlist-webhook", "destination": "/api/lemlist-webhook.js" }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add vercel.json
git commit -m "fix: supprimer rewrite /dashboard redondant — Vercel clean URLs suffisent"
```

---

### Task 3: Générer et déployer les 3 sites démos

**Files:**
- Create: `scripts/generate-demo.js`

**Contexte :** `scripts/generate.js` exporte `generateSite(prospect, sitesDir)` qui appelle Claude API et écrit le HTML dans `sites/[slug]/index.html`. `scripts/deploy.js` exporte `deployProspectSite(prospect, html, slug)` mais inclut une écriture Supabase qu'on ne veut pas pour les démos. Ce script crée sa propre fonction de déploiement Vercel sans Supabase.

- [ ] **Step 1: Créer scripts/generate-demo.js**

```javascript
require('dotenv').config();
const axios = require('axios');
const { generateSite } = require('./generate');
const { VERCEL_TOKEN, VERCEL_SCOPE } = require('./config');

const DEMOS = [
  {
    nom: 'Le Bistrot du Marché',
    secteur: 'restaurant',
    ville: 'Paris',
    adresse: '12 rue du Marché, 75011 Paris',
    tel: '01 42 00 00 00',
    rating: 4.5,
    reviews_count: 87,
    description: 'Restaurant traditionnel français au cœur de Paris. Cuisine du marché, produits frais, ambiance conviviale.',
    horaires: {
      'Lundi': '12h00–14h30, 19h00–22h30',
      'Mardi': '12h00–14h30, 19h00–22h30',
      'Mercredi': '12h00–14h30, 19h00–22h30',
      'Jeudi': '12h00–14h30, 19h00–22h30',
      'Vendredi': '12h00–14h30, 19h00–23h00',
      'Samedi': '19h00–23h00',
      'Dimanche': 'Fermé'
    }
  },
  {
    nom: 'Dupont Plomberie',
    secteur: 'artisan',
    ville: 'Lyon',
    adresse: '8 avenue des Artisans, 69003 Lyon',
    tel: '04 78 00 00 00',
    rating: 4.7,
    reviews_count: 43,
    description: 'Plombier chauffagiste à Lyon depuis 15 ans. Dépannage urgent, installation, rénovation. Devis gratuit.',
    horaires: {
      'Lundi–Vendredi': '8h00–18h00',
      'Samedi': '9h00–12h00',
      'Dimanche': 'Urgences uniquement'
    }
  },
  {
    nom: 'Studio Lumière',
    secteur: 'beaute',
    ville: 'Bordeaux',
    adresse: '24 rue des Fleurs, 33000 Bordeaux',
    tel: '05 56 00 00 00',
    rating: 4.8,
    reviews_count: 62,
    description: 'Institut de beauté et bien-être à Bordeaux. Soins du visage, épilation, massages, onglerie. Sur rendez-vous.',
    horaires: {
      'Mardi–Vendredi': '9h00–19h00',
      'Samedi': '9h00–17h00',
      'Dimanche–Lundi': 'Fermé'
    }
  }
];

async function deployDemo(html, slug) {
  const projectName = `sa-demo-${slug}`;
  const response = await axios.post(
    'https://api.vercel.com/v13/deployments',
    {
      name: projectName,
      files: [{ file: 'index.html', data: html }],
      projectSettings: { framework: null },
      target: 'production',
    },
    {
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      params: { teamId: VERCEL_SCOPE },
    }
  );
  return `https://${response.data.url}`;
}

async function main() {
  const results = [];

  for (const demo of DEMOS) {
    console.log(`\nGénération : ${demo.nom}...`);
    const { slug, html } = await generateSite(demo);
    console.log(`  HTML généré (${html.length} chars). Déploiement Vercel...`);
    const url = await deployDemo(html, slug);
    console.log(`  ✓ Déployé : ${url}`);
    results.push({ nom: demo.nom, slug, url });
  }

  console.log('\n=== RÉSULTATS ===');
  results.forEach(r => console.log(`${r.nom} → ${r.url}`));
  console.log('\nCopiez ces URLs dans index.html (DEMO_URL_RESTAURANT, DEMO_URL_ARTISAN, DEMO_URL_BEAUTE)');
}

main().catch(console.error);
```

- [ ] **Step 2: Exécuter le script**

Depuis la racine du projet :

```bash
node scripts/generate-demo.js
```

Attendre la fin (environ 1–2 minutes). Le script affiche les 3 URLs en fin d'exécution.

Expected output :
```
Génération : Le Bistrot du Marché...
  HTML généré (XXXX chars). Déploiement Vercel...
  ✓ Déployé : https://sa-demo-le-bistrot-du-marche-XXXX.vercel.app

Génération : Dupont Plomberie...
  ...

Génération : Studio Lumière...
  ...

=== RÉSULTATS ===
Le Bistrot du Marché → https://sa-demo-le-bistrot-du-marche-XXXX.vercel.app
Dupont Plomberie → https://sa-demo-dupont-plomberie-XXXX.vercel.app
Studio Lumière → https://sa-demo-studio-lumiere-XXXX.vercel.app

Copiez ces URLs dans index.html (DEMO_URL_RESTAURANT, DEMO_URL_ARTISAN, DEMO_URL_BEAUTE)
```

- [ ] **Step 3: Vérifier les 3 URLs dans le navigateur**

Ouvrir chacune des 3 URLs Vercel et vérifier que les sites s'affichent correctement.

- [ ] **Step 4: Commit generate-demo.js**

```bash
git add scripts/generate-demo.js
git commit -m "feat: script génération 3 sites démos (restaurant, artisan, beauté)"
```

---

### Task 4: Mettre à jour les URLs démos dans index.html

**Files:**
- Modify: `index.html`

**Contexte :** Les placeholders `DEMO_URL_RESTAURANT`, `DEMO_URL_ARTISAN`, `DEMO_URL_BEAUTE` dans index.html doivent être remplacés par les vraies URLs Vercel obtenues à la Task 3. Les boutons `disabled` doivent aussi être activés.

- [ ] **Step 1: Remplacer les 3 placeholders et activer les boutons**

Dans `index.html`, effectuer ces 3 remplacements (utiliser les vraies URLs de la Task 3) :

```
DEMO_URL_RESTAURANT  →  https://sa-demo-le-bistrot-du-marche-XXXX.vercel.app
DEMO_URL_ARTISAN     →  https://sa-demo-dupont-plomberie-XXXX.vercel.app
DEMO_URL_BEAUTE      →  https://sa-demo-studio-lumiere-XXXX.vercel.app
```

Et retirer la classe `disabled` des 3 boutons `.btn-demo` :

```html
<!-- AVANT -->
<a href="https://sa-demo-le-bistrot-du-marche-XXXX.vercel.app" class="btn-demo disabled" target="_blank">Voir le site →</a>

<!-- APRÈS -->
<a href="https://sa-demo-le-bistrot-du-marche-XXXX.vercel.app" class="btn-demo" target="_blank">Voir le site →</a>
```

Faire pareil pour les 2 autres cartes.

- [ ] **Step 2: Vérifier dans le navigateur**

Ouvrir `index.html`. Les 3 boutons "Voir le site →" doivent être visibles (non grisés) et pointer vers les bons sites Vercel.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: mise à jour URLs démos réalisations"
```

---

### Task 5: Deploy production + vérification finale

**Files:** aucun fichier modifié — deploy via git push

- [ ] **Step 1: Push vers Vercel (via git)**

```bash
git push origin main
```

Vercel détecte automatiquement le push et re-déploie le projet `seuzaret-agency`.

- [ ] **Step 2: Vérifier https://seuzaret-agency.vercel.app**

Ouvrir le site en production. Vérifier :
- [ ] Nav sticky fonctionne
- [ ] Toutes les 6 sections sont présentes et dans le bon ordre
- [ ] Animations au scroll fonctionnelles
- [ ] Tableau des prix s'affiche correctement
- [ ] Boutons "Voir le site" des démos fonctionnent (liens s'ouvrent)
- [ ] Section contact : clic sur email → ouvre client mail
- [ ] Section contact : clic sur téléphone → propose appel sur mobile
- [ ] Responsive mobile correct
- [ ] Dashboard accessible sur `/dashboard` (plus d'erreur 404)

- [ ] **Step 3: Vérifier les meta tags SEO**

Ouvrir les DevTools → View Page Source. Vérifier la présence de :
- `<meta name="description">`
- `<meta property="og:title">`
- `<script type="application/ld+json">` avec le JSON-LD complet

- [ ] **Step 4: Supprimer le backup**

```bash
rm index.html.bak
```

Pas de commit — ce fichier n'a jamais été tracké par Git.
