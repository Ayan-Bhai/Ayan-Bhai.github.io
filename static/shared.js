/* ============================================================
   TECHNOVA — shared.js: icons, helpers, auth state, nav, theme
   Loaded on every page before app.js / admin.js
   ============================================================ */
(function () {
  'use strict';
  var C = window.SHOP_CONFIG;

  /* ---------- API base (Railway backend) — set in api-config.js ---------- */
  window.API_BASE = (window.API_BASE || '').replace(/\/+$/, '');

  /* ---------- site overrides (name, logo, hero, services) ----------
     Fetched from the backend (/api/site). A localStorage cache is applied
     synchronously so repeat visits render instantly with the right brand;
     the fresh value is fetched in the background and cached for next paint. */
  function applyOverrides(OV) {
    OV = OV || {};
    if (OV.name) C.brand.name = OV.name;
    if (OV.tagline) C.brand.tagline = OV.tagline;
    if (OV.logoText) C.brand.logoText = OV.logoText;
    if (OV.heroTitle) C.brand.heroTitle = OV.heroTitle;
    if (OV.heroAccent) C.brand.heroTitleAccent = OV.heroAccent;
    if (OV.heroSub) C.brand.heroSub = OV.heroSub;
    if (OV.services && OV.services.length) C.services = OV.services;
    C.brand.logoUrl = OV.logo || '';
    /* dynamic SEO (static pages can't be server-rendered) */
    try {
      if (OV.seoTitle && (location.pathname === '/' || location.pathname === '/index.html')) document.title = OV.seoTitle;
      if (OV.seoDesc) {
        var md = document.querySelector('meta[name="description"]');
        if (md) md.setAttribute('content', OV.seoDesc);
      }
      if (OV.logo) {
        var fav = document.querySelector('link[rel="icon"]');
        if (fav) fav.setAttribute('href', OV.logo);
      }
    } catch (e) {}
  }

  var cachedOV = null;
  try { cachedOV = JSON.parse(localStorage.getItem('tn_site') || 'null'); } catch (e) {}
  if (cachedOV) applyOverrides(cachedOV);

  /* SITE_READY resolves when overrides are known (cache hit = instant) */
  window.SITE_READY = cachedOV
    ? Promise.resolve()
    : fetch(window.API_BASE + '/api/site')
        .then(function (r) { return r.json(); })
        .then(function (d) {
          applyOverrides(d);
          try { localStorage.setItem('tn_site', JSON.stringify(d)); } catch (e) {}
        })
        .catch(function () {});
  /* background refresh of the cache (don't block render) */
  if (cachedOV) {
    fetch(window.API_BASE + '/api/site')
      .then(function (r) { return r.json(); })
      .then(function (d) { try { localStorage.setItem('tn_site', JSON.stringify(d)); } catch (e) {} })
      .catch(function () {});
  }

  window.isStaff = function (u) { return !!u && (u.role === 'admin' || u.role === 'owner'); };
  window.logoHtml = function () {
    return C.brand.logoUrl
      ? '<span class="nav-logo has-img"><img src="' + C.brand.logoUrl + '" alt="' + esc(C.brand.name) + ' logo" /></span>'
      : '<span class="nav-logo">' + esc(C.brand.logoText) + '</span>';
  };
  window.$ = function (s, p) { return (p || document).querySelector(s); };
  window.$$ = function (s, p) { return Array.prototype.slice.call((p || document).querySelectorAll(s)); };

  window.rs = function (n) { return 'Rs ' + Number(n).toLocaleString('en-PK'); };
  window.esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  }); };
  window.waLink = function (msg) {
    return 'https://wa.me/' + C.contact.whatsapp + '?text=' + encodeURIComponent(msg);
  };

  /* ---------- auth state ---------- */
  window.getToken = function () { try { return localStorage.getItem('tn_token') || ''; } catch (e) { return ''; } };
  window.setAuth = function (token, user) {
    try {
      if (token) localStorage.setItem('tn_token', token); else localStorage.removeItem('tn_token');
      if (user) localStorage.setItem('tn_user', JSON.stringify(user)); else localStorage.removeItem('tn_user');
    } catch (e) {}
  };
  window.getUser = function () {
    try { var u = localStorage.getItem('tn_user'); return u ? JSON.parse(u) : null; } catch (e) { return null; }
  };
  window.api = function (path, opts) {
    opts = opts || {};
    opts.headers = opts.headers || {};
    opts.headers['Content-Type'] = 'application/json';
    var t = getToken();
    if (t) opts.headers['Authorization'] = 'Bearer ' + t;
    if (opts.body && typeof opts.body !== 'string') opts.body = JSON.stringify(opts.body);
    return fetch(window.API_BASE + path, opts).then(function (r) { return r.json(); });
  };
  /* product image URL (served by the backend) */
  window.imgUrl = function (id) { return window.API_BASE + '/img/' + id; };

  /* ---------- cart (localStorage) ---------- */
  window.getCart = function () { try { return JSON.parse(localStorage.getItem('tn_cart') || '[]'); } catch (e) { return []; } };
  window.setCart = function (c) { try { localStorage.setItem('tn_cart', JSON.stringify(c)); } catch (e) {} updateCartBadge(); };
  window.addToCart = function (item) {
    var cart = getCart();
    var f = cart.filter(function (i) { return i.id === item.id; })[0];
    if (f) f.qty = Math.min(99, f.qty + 1); else cart.push({ id: item.id, name: item.name, price: item.price, icon: item.icon, qty: 1 });
    setCart(cart);
    toast('Added to cart: ' + item.name);
  };
  window.updateCartBadge = function () {
    var n = getCart().reduce(function (a, i) { return a + i.qty; }, 0);
    $$('.cart-count').forEach(function (el) { el.textContent = n; el.style.display = n ? 'flex' : 'none'; });
  };

  /* ---------- toast ---------- */
  window.toast = function (msg, bad) {
    var t = document.createElement('div');
    t.className = 'toast' + (bad ? ' bad' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 10);
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 350); }, 3000);
  };

  /* ---------- icons ---------- */
  window.ICONS = {
    laptop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M2 20h20"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>',
    earbuds: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="8" r="3"/><circle cx="17" cy="8" r="3"/><path d="M7 11v6a2 2 0 0 0 2 2"/><path d="M17 11v6a2 2 0 0 1-2 2"/></svg>',
    speaker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="14" r="4"/><path d="M12 6h.01"/></svg>',
    headphones: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    charger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>',
    mouse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="6"/><path d="M12 7v4"/></svg>',
    keyboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"/></svg>',
    watch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6"/><path d="M12 10v2l1.5 1.5"/><path d="M9 3h6M9 21h6"/></svg>',
    ram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="10" rx="1"/><path d="M6 17v3M10 17v3M14 17v3M18 17v3M6 10v4M10 10v4M14 10v4M18 10v4"/></svg>',
    gpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="19" height="12" rx="2"/><circle cx="9" cy="12" r="3"/><circle cx="16" cy="12" r="2"/><path d="M2 10v8"/></svg>',
    monitor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4.5 4.5 0 0 0-6 6L3 18l3 3 5.7-5.7a4.5 4.5 0 0 0 6-6L14 13l-3-3z"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 5h14v11H1zM15 8h4l4 4v4h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3 21 7l-4 4"/><path d="M21 7H8"/><path d="m7 21-4-4 4-4"/><path d="M3 17h13"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
    headset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><rect x="3" y="14" width="4" height="6" rx="2"/><rect x="17" y="14" width="4" height="6" rx="2"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
    phoneCall: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.5 2.8.7a2 2 0 0 1 1.7 2z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L21 7H6"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 5 5L20 7"/></svg>',
    box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 8-9-5-9 5v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v9"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 21h18M7 17V9M12 17V5M17 17v-6"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.2-.7l.5-.6c.1-.2.1-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.5 1.1 2.7c.1.2 1.9 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2 0-.1-.2-.2-.4-.3z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>',
    gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 1 1.5h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1z"/></svg>',
    image: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.4-4.4a1.5 1.5 0 0 0-2.1 0L5 20"/></svg>',
    chevL: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
    chevR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/></svg>',
    tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 12 22 2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>'
  };
  window.ic = function (name) { return ICONS[name] || ICONS.box; };

  /* ---------- theme ---------- */
  var root = document.documentElement;
  var saved = null;
  try { saved = localStorage.getItem('tn_theme'); } catch (e) {}
  if (saved !== 'black' && saved !== 'white') root.dataset.theme = C.brand.defaultTheme;

  window.mountThemeSwitch = function () {
    var knob = $('#theme-knob');
    if (!knob) return;
    function paint() { knob.innerHTML = root.dataset.theme === 'black' ? ICONS.moon : ICONS.sun; }
    $('#theme-toggle').addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'black' ? 'white' : 'black';
      try { localStorage.setItem('tn_theme', root.dataset.theme); } catch (e) {}
      paint();
    });
    paint();
  };

  /* ---------- cursor dot ---------- */
  window.mountCursor = function () {
    var dot = $('#cursor-dot');
    if (!dot || !window.matchMedia('(hover: hover)').matches) return;
    var dx = -100, dy = -100, cx = -100, cy = -100, raf;
    document.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      if (!raf) loop();
    });
    function loop() {
      dx += (cx - dx) * 0.18; dy += (cy - dy) * 0.18;
      dot.style.transform = 'translate(' + (dx - 9) + 'px,' + (dy - 9) + 'px)';
      raf = requestAnimationFrame(loop);
    }
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('a, button, input, select, textarea')) dot.classList.add('grow');
      else dot.classList.remove('grow');
    });
  };

  /* ---------- static-page href helper ---------- */
  window.pageHref = function (route) {
    return route === '/' ? 'index.html' : route.slice(1) + '.html';
  };

  /* ---------- site navbar (public pages) ---------- */
  window.renderNav = function (active) {
    var u = getUser();
    var links = [
      ['/', 'Home'], ['/shop', 'Shop'], ['/about', 'About Us'], ['/contact', 'Contact Us']
    ];
    function linkHtml(cls) {
      return links.map(function (l) {
        return '<a href="' + pageHref(l[0]) + '"' + (active === l[0] ? ' class="active"' : '') + '>' + l[1] + '</a>';
      }).join('');
    }
    var authHtml = u
      ? '<a href="' + (isStaff(u) ? 'admin.html' : 'account.html') + '" class="btn btn-outline btn-sm">' + ICONS.user + ' ' + esc(u.name.split(' ')[0]) + '</a>'
      : '<a href="login.html" class="btn btn-outline btn-sm">Login</a>';
    return '<header class="nav"><div class="container nav-inner">' +
      '<a href="index.html" class="nav-brand">' + logoHtml() + esc(C.brand.name) + '</a>' +
      '<nav class="nav-links">' + linkHtml() + '</nav>' +
      '<div class="nav-actions">' +
        '<button class="theme-switch" id="theme-toggle" aria-label="Switch theme"><span class="knob" id="theme-knob"></span></button>' +
        authHtml +
        '<a href="cart.html" class="btn btn-solid btn-sm cart-btn">' + ICONS.cart + ' <span class="cart-count" style="display:none">0</span></a>' +
        '<button class="hamburger" id="hamburger" aria-label="Menu">' + ICONS.menu + '</button>' +
      '</div>' +
    '</div></header>' +
    '<div class="drawer-overlay" id="drawer-overlay"></div>' +
    '<aside class="drawer" id="drawer">' +
      '<div class="drawer-head"><strong>' + esc(C.brand.name) + '</strong>' +
      '<button class="hamburger" id="drawer-close" style="display:flex">' + ICONS.close + '</button></div>' +
      linkHtml() +
      (u ? '<a href="' + (isStaff(u) ? 'admin.html' : 'account.html') + '">My Account</a>' : '<a href="login.html">Login</a><a href="signup.html">Sign Up</a>') +
      '<a href="cart.html">Cart</a>' +
    '</aside>';
  };
  window.mountNav = function () {
    var drawer = $('#drawer'), overlay = $('#drawer-overlay');
    function openDrawer(open) {
      drawer.classList.toggle('open', open);
      overlay.classList.toggle('show', open);
    }
    $('#hamburger').addEventListener('click', function () { openDrawer(true); });
    $('#drawer-close').addEventListener('click', function () { openDrawer(false); });
    overlay.addEventListener('click', function () { openDrawer(false); });
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) openDrawer(false); });
    mountThemeSwitch();
    mountCursor();
    updateCartBadge();
  };

  /* ---------- footer ---------- */
  window.renderFooter = function () {
    var w = C.credits;
    return '<footer><div class="container">' +
      '<div class="footer-giant" aria-hidden="true">' + esc(C.brand.name) + '</div>' +
      '<div class="footer-grid">' +
        '<div class="footer-brand"><span class="nav-brand">' + logoHtml() + esc(C.brand.name) + '</span>' +
          '<p>' + esc(C.brand.heroSub) + '</p></div>' +
        '<div class="footer-links">' +
          '<div class="footer-col"><h4>Pages</h4><a href="index.html">Home</a><a href="shop.html">Shop</a><a href="about.html">About Us</a><a href="contact.html">Contact Us</a></div>' +
          '<div class="footer-col"><h4>Account</h4><a href="login.html">Login</a><a href="signup.html">Sign Up</a><a href="account.html">My Orders</a><a href="cart.html">Cart</a></div>' +
          '<div class="footer-col"><h4>Contact</h4>' +
            '<a href="tel:' + esc(C.contact.phone.replace(/\s/g, '')) + '">' + esc(C.contact.phone) + '</a>' +
            '<a href="mailto:' + esc(C.contact.email) + '">' + esc(C.contact.email) + '</a>' +
            '<a href="' + waLink('Hi!') + '" target="_blank" rel="noopener">WhatsApp</a></div>' +
        '</div>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<span>© ' + new Date().getFullYear() + ' ' + esc(C.brand.name) + '. All rights reserved.</span>' +
        '<span class="watermark">Made by <a href="' + esc(w.madeBy.url) + '" target="_blank" rel="noopener">' + esc(w.madeBy.name) + '</a>, Planed by <a href="' + esc(w.planedBy.url) + '" target="_blank" rel="noopener">' + esc(w.planedBy.name) + '</a></span>' +
      '</div>' +
    '</div></footer>' +
    '<a class="wa-float" aria-label="WhatsApp" target="_blank" rel="noopener" href="' + waLink('Hi ' + C.brand.name + '!') + '">' + ICONS.wa + '</a>';
  };
})();
