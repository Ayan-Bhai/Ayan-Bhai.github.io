/* ============================================================
   TECHNOVA — public site, multi-page (routed by pathname)
   Pages: / /shop /about /contact /login /signup /account /cart
   ============================================================ */
(function () {
  'use strict';
  var C = window.SHOP_CONFIG;
  var app = $('#app');
  /* map static .html filename → route key ('index.html' → '/', 'shop.html' → '/shop') */
  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var FILE_ROUTES = {
    '': '/', 'index.html': '/', 'shop.html': '/shop', 'about.html': '/about',
    'contact.html': '/contact', 'login.html': '/login', 'signup.html': '/signup',
    'account.html': '/account', 'cart.html': '/cart', 'pay-success.html': '/pay/success'
  };
  var path = FILE_ROUTES[file] || '/';

  function page(inner, active) {
    app.innerHTML = renderNav(active) + '<main id="page-main">' + inner + '</main>' + renderFooter();
    mountNav();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.1 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* ================= HOME (editorial layout) ================= */
  function homePage() {
    var marqueeWords = ['Genuine Products', 'Honest Prices', 'WhatsApp Ordering', 'Local Warranty', 'Free Advice', 'Tested Before Sale'];
    var marqueeHtml = '';
    for (var mi = 0; mi < 3; mi++) {
      marqueeHtml += marqueeWords.map(function (w) { return '<span>' + esc(w) + '</span><i>✦</i>'; }).join('');
    }

    var inner =
      '<section class="hero hero-split" id="hero-section">' +
        '<div class="container hero-cols">' +
          '<div class="hero-copy">' +
            '<div class="hero-chip"><span class="dot"></span>' + esc(C.brand.tagline) + '</div>' +
            '<h1>' + esc(C.brand.heroTitle) + ' <span class="outline">' + esc(C.brand.heroTitleAccent) + '</span></h1>' +
            '<p class="hero-sub">' + esc(C.brand.heroSub) + '</p>' +
            '<div class="hero-cta">' +
              '<a href="shop.html" class="btn btn-solid">Browse the Shop ' + ic('arrow') + '</a>' +
              '<a href="contact.html" class="btn btn-outline">' + ic('pin') + ' Visit Our Shop</a>' +
            '</div>' +
            '<div class="hero-strip">' + C.stats.map(function (s, i) {
              return (i ? '<span class="strip-div"></span>' : '') +
                '<div class="strip-stat"><strong>' + esc(s.value) + '</strong><small>' + esc(s.label) + '</small></div>';
            }).join('') + '</div>' +
          '</div>' +
          '<div class="hero-visual" id="hero-visual" aria-hidden="true">' +
            '<div class="hv-card hv-a"><div class="hv-ic">' + ic('laptop') + '</div><span>Laptops</span></div>' +
            '<div class="hv-card hv-b"><div class="hv-ic">' + ic('phone') + '</div><span>Mobiles</span></div>' +
            '<div class="hv-card hv-c"><div class="hv-ic">' + ic('headphones') + '</div><span>Audio</span></div>' +
            '<div class="hv-badge">' + ic('check') + ' In stock today</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<div class="marquee" aria-hidden="true"><div class="marquee-track">' + marqueeHtml + '</div></div>' +

      '<section id="featured">' +
        '<div class="container">' +
          '<div class="sec-row reveal">' +
            '<div><div class="sec-kicker">Fresh Stock</div><h2 class="sec-title">Featured <em>Products</em></h2></div>' +
            '<a href="shop.html" class="btn btn-outline btn-sm">View All ' + ic('arrow') + '</a>' +
          '</div>' +
          '<div class="products-grid" id="featured-grid"><div class="empty-note">Loading…</div></div>' +
        '</div>' +
      '</section>' +

      '<section id="services" class="alt-band">' +
        '<div class="container">' +
          '<div class="sec-head reveal"><div class="sec-kicker">Why Choose Us</div>' +
          '<h2 class="sec-title">More Than <em>Just a Shop</em></h2></div>' +
          '<div class="service-index">' + C.services.map(function (s, i) {
            var num = (i + 1) < 10 ? '0' + (i + 1) : String(i + 1);
            return '<article class="service-row reveal">' +
              '<span class="sr-num">' + num + '</span>' +
              '<div class="sr-main"><h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></div>' +
              '<div class="sr-ic">' + ic(s.icon) + '</div>' +
            '</article>';
          }).join('') + '</div>' +
        '</div>' +
      '</section>' +

      '<section id="reviews">' +
        '<div class="container">' +
          '<div class="sec-head reveal"><div class="sec-kicker">Testimonials</div>' +
          '<h2 class="sec-title">What <em>Customers</em> Say</h2></div>' +
          '<div class="testi-stagger">' + C.testimonials.map(function (t, i) {
            var stars = ''; for (var si = 0; si < t.stars; si++) stars += '★';
            return '<article class="testi-card reveal' + (i % 2 ? ' shift' : '') + '">' +
              '<span class="testi-mark">”</span>' +
              '<p class="testi-text">' + esc(t.text) + '</p>' +
              '<div class="testi-foot"><div class="testi-name"><span class="testi-avatar">' + esc(t.name.charAt(0)) + '</span>' + esc(t.name) + '</div>' +
              '<div class="testi-stars">' + stars + '</div></div></article>';
          }).join('') + '</div>' +
        '</div>' +
      '</section>' +

      '<section id="visit-cta" class="visit-band reveal">' +
        '<div class="container visit-band-inner">' +
          '<h2>Come say <em>hello.</em></h2>' +
          '<p>' + esc(C.contact.address) + '</p>' +
          '<div class="hero-cta" style="justify-content:center">' +
            '<a class="btn btn-solid" target="_blank" rel="noopener" href="' + waLink('Hi ' + C.brand.name + '!') + '">' + ic('wa') + ' Chat on WhatsApp</a>' +
            '<a href="contact.html" class="btn btn-outline">Opening Hours ' + ic('arrow') + '</a>' +
          '</div>' +
        '</div>' +
      '</section>';
    page(inner, '/');

    api('/api/catalog').then(function (d) {
      var feat = (d.products || []).slice(0, 4);
      $('#featured-grid').innerHTML = feat.map(productCard).join('') || '<div class="empty-note">No products yet.</div>';
      bindProductButtons($('#featured-grid'), feat);
    });

    /* subtle parallax on hero collage */
    var hv = $('#hero-visual');
    if (hv && window.matchMedia('(hover: hover)').matches) {
      document.addEventListener('mousemove', function (e) {
        var x = (e.clientX / window.innerWidth - 0.5) * 14;
        var y = (e.clientY / window.innerHeight - 0.5) * 10;
        hv.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
    }
  }

  /* ================= product card ================= */
  function productCard(p, idx) {
    var out = p.stock <= 0;
    var imgs = p.images || [];
    var media = imgs.length
      ? '<div class="product-media" data-gallery="' + p.id + '"><img src="' + imgUrl(imgs[0]) + '" alt="' + esc(p.name) + '" loading="lazy" />' +
        (imgs.length > 1 ? '<span class="media-count">' + ic('image') + ' ' + imgs.length + '</span>' : '') +
        '<span class="media-zoom">' + ic('eye') + ' View photos</span></div>'
      : '<div class="product-icon">' + ic(p.icon) + '</div>';
    return '<article class="product-card' + (imgs.length ? ' has-media' : '') + '" style="animation-delay:' + ((idx || 0) * 35) + 'ms">' +
      (p.badge ? '<span class="product-badge">' + esc(p.badge) + '</span>' : (out ? '<span class="product-badge">Sold Out</span>' : '')) +
      media +
      '<div class="product-cat">' + esc(p.category || 'General') + '</div>' +
      '<h3 class="product-name">' + esc(p.name) + '</h3>' +
      '<p class="product-desc">' + esc(p.descr || '') + '</p>' +
      '<div class="product-foot"><div>' +
        (p.oldPrice ? '<span class="product-old">' + rs(p.oldPrice) + '</span>' : '') +
        '<span class="product-price">' + rs(p.price) + '</span></div>' +
        (out ? '<span class="stock-note">Out of stock</span>'
             : '<button class="btn btn-outline btn-sm add-cart-btn" data-id="' + p.id + '">' + ic('cart') + ' Add</button>') +
      '</div></article>';
  }
  function bindProductButtons(container, products) {
    container.addEventListener('click', function (e) {
      var b = e.target.closest('.add-cart-btn');
      if (b) {
        var p = products.filter(function (x) { return x.id === Number(b.dataset.id); })[0];
        if (p) addToCart(p);
        return;
      }
      var m = e.target.closest('.product-media[data-gallery]');
      if (m) {
        var p2 = products.filter(function (x) { return x.id === Number(m.dataset.gallery); })[0];
        if (p2 && (p2.images || []).length) openLightbox(p2);
      }
    });
  }

  /* ================= gallery lightbox ================= */
  function openLightbox(p) {
    var imgs = p.images, cur = 0;
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML =
      '<div class="lb-head"><div><strong>' + esc(p.name) + '</strong><span class="lb-count" id="lb-count"></span></div>' +
        '<button class="lb-btn" id="lb-close" aria-label="Close">' + ic('close') + '</button></div>' +
      '<div class="lb-stage">' +
        (imgs.length > 1 ? '<button class="lb-btn lb-nav" id="lb-prev" aria-label="Previous">' + ic('chevL') + '</button>' : '') +
        '<img id="lb-img" src="" alt="' + esc(p.name) + '" />' +
        (imgs.length > 1 ? '<button class="lb-btn lb-nav" id="lb-next" aria-label="Next">' + ic('chevR') + '</button>' : '') +
      '</div>' +
      (imgs.length > 1
        ? '<div class="lb-thumbs" id="lb-thumbs">' + imgs.map(function (id, i) {
            return '<button class="lb-thumb" data-i="' + i + '"><img src="' + imgUrl(id) + '" alt="" loading="lazy" /></button>';
          }).join('') + '</div>'
        : '');
    document.body.appendChild(lb);
    document.body.style.overflow = 'hidden';

    function show(i) {
      cur = (i + imgs.length) % imgs.length;
      $('#lb-img', lb).src = imgUrl(imgs[cur]);
      var c = $('#lb-count', lb);
      if (c) c.textContent = (cur + 1) + ' / ' + imgs.length;
      $$('.lb-thumb', lb).forEach(function (t) { t.classList.toggle('active', Number(t.dataset.i) === cur); });
    }
    function close() {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      lb.remove();
    }
    function onKey(e) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    }
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.closest('#lb-close')) { close(); return; }
      if (e.target.closest('#lb-prev')) show(cur - 1);
      if (e.target.closest('#lb-next')) show(cur + 1);
      var t = e.target.closest('.lb-thumb');
      if (t) show(Number(t.dataset.i));
    });
    document.addEventListener('keydown', onKey);
    /* swipe on touch */
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (sx == null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 45) show(cur + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });
    show(0);
  }

  /* ================= SHOP (v8 — banner + tile grid, per user's mockup) ================= */
  function productTile(p, idx) {
    var out = p.stock <= 0;
    var imgs = p.images || [];
    var media = imgs.length
      ? '<div class="tile-media product-media" data-gallery="' + p.id + '"><img src="' + imgUrl(imgs[0]) + '" alt="' + esc(p.name) + '" loading="lazy" />' +
        (imgs.length > 1 ? '<span class="media-count">' + ic('image') + ' ' + imgs.length + '</span>' : '') + '</div>'
      : '<div class="tile-media tile-icon">' + ic(p.icon) + '</div>';
    return '<article class="tile' + (out ? ' is-out' : '') + '" style="animation-delay:' + ((idx || 0) * 30) + 'ms">' +
      (p.badge ? '<span class="tile-badge">' + esc(p.badge) + '</span>' : '') +
      media +
      '<div class="tile-body">' +
        '<h3 class="tile-name">' + esc(p.name) + '</h3>' +
        '<p class="tile-spec">' + esc(p.descr || '') + '</p>' +
        '<div class="tile-foot">' +
          '<div class="tile-prices">' +
            (p.oldPrice ? '<span class="tile-old">' + rs(p.oldPrice) + '</span>' : '') +
            '<span class="tile-price">' + rs(p.price) + '</span>' +
          '</div>' +
          (out ? '<span class="tile-out-tag">Sold out</span>'
               : '<button class="tile-add add-cart-btn" data-id="' + p.id + '" aria-label="Add ' + esc(p.name) + ' to cart">' + ic('plus') + '</button>') +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function shopHeroBanner(p) {
    if (!p) return '';
    var imgs = p.images || [];
    var media = imgs.length
      ? '<div class="sb-media product-media" data-gallery="' + p.id + '"><img src="' + imgUrl(imgs[0]) + '" alt="' + esc(p.name) + '" /></div>'
      : '<div class="sb-media sb-icon">' + ic(p.icon) + '</div>';
    return '<section class="shop-banner reveal in" id="shop-banner">' +
      media +
      '<div class="sb-info">' +
        (p.badge ? '<span class="sb-badge">' + esc(p.badge) + '</span>' : '') +
        '<h2 class="sb-name">' + esc(p.name) + '</h2>' +
        '<p class="sb-spec">' + esc(p.descr || '') + '</p>' +
        '<div class="sb-row">' +
          '<button class="btn btn-primary add-cart-btn" data-id="' + p.id + '">' + ic('cart') + ' Shop Now</button>' +
          '<div class="sb-prices">' + (p.oldPrice ? '<span class="tile-old">' + rs(p.oldPrice) + '</span>' : '') +
          '<span class="sb-price">' + rs(p.price) + '</span></div>' +
        '</div>' +
      '</div>' +
    '</section>';
  }

  function shopPage() {
    var inner =
      '<section class="shop-v8">' +
        '<div class="container">' +
          '<div class="crumbs reveal in"><a href="index.html">Home</a><span>/</span><strong>Shop</strong></div>' +
          '<div class="shop8-top reveal in">' +
            '<h1 class="shop8-title">The Shop</h1>' +
            '<div class="shop8-search">' + ic('search') + '<input type="search" id="search-input" placeholder="Search the whole shop…" /><span class="shop8-count" id="result-count"></span></div>' +
          '</div>' +
          '<div id="banner-slot"></div>' +
          '<div class="shop8-cats" id="cat-tabs"></div>' +
          '<div class="tile-grid" id="products-grid"><div class="empty-note">Loading…</div></div>' +
        '</div>' +
      '</section>';
    page(inner, '/shop');

    var all = [], activeCat = 'All';
    var grid = $('#products-grid'), tabs = $('#cat-tabs'), search = $('#search-input'), bannerSlot = $('#banner-slot');

    function apply() {
      var q = (search.value || '').trim().toLowerCase();
      var list = all.filter(function (p) {
        if (activeCat !== 'All' && p.category !== activeCat) return false;
        if (q && (p.name + ' ' + (p.descr || '') + ' ' + (p.category || '')).toLowerCase().indexOf(q) === -1) return false;
        return true;
      });
      $('#result-count').textContent = list.length + ' item' + (list.length === 1 ? '' : 's');
      bannerSlot.style.display = (q || activeCat !== 'All') ? 'none' : '';
      grid.innerHTML = list.map(productTile).join('') || '<div class="empty-note">No products match your search.</div>';
    }

    api('/api/catalog').then(function (d) {
      all = d.products || [];
      /* Featured banner: admin-chosen product first, else pinned with photos, then pinned, then priciest */
      var feat = (d.banner ? all.filter(function (p) { return p.id === d.banner; })[0] : null) ||
                 all.filter(function (p) { return p.pinned && (p.images || []).length && p.stock > 0; })[0] ||
                 all.filter(function (p) { return p.pinned && p.stock > 0; })[0] ||
                 all.slice().sort(function (a, b) { return b.price - a.price; })[0];
      bannerSlot.innerHTML = shopHeroBanner(feat);
      if (feat) bindProductButtons(bannerSlot, all);

      var cats = ['All'].concat((d.categories || []).map(function (c) { return c.name; }));
      tabs.innerHTML = cats.map(function (cat, i) {
        return '<button class="cat-tab' + (i === 0 ? ' active' : '') + '" data-cat="' + esc(cat) + '">' + esc(cat) + '</button>';
      }).join('');
      tabs.addEventListener('click', function (e) {
        var b = e.target.closest('.cat-tab'); if (!b) return;
        $$('.cat-tab', tabs).forEach(function (t) { t.classList.remove('active'); });
        b.classList.add('active');
        activeCat = b.dataset.cat;
        apply();
      });
      search.addEventListener('input', apply);
      bindProductButtons(grid, all);
      apply();
    });
  }

  /* ================= ABOUT ================= */
  function aboutPage() {
    var inner =
      '<section class="page-top">' +
        '<div class="container">' +
          '<div class="crumbs reveal in"><a href="index.html">Home</a><span>/</span><strong>About Us</strong></div>' +
          '<h1 class="page-title">About ' + esc(C.brand.name) + '</h1>' +
          '<div class="about-grid">' +
            '<div class="about-text reveal in">' +
              '<p class="lead">' + esc(C.about.lead) + '</p>' +
              C.about.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
              '<div class="hero-cta" style="margin-top:28px">' +
                '<a href="shop.html" class="btn btn-solid">Browse Products ' + ic('arrow') + '</a>' +
                '<a href="contact.html" class="btn btn-outline">Contact Us</a>' +
              '</div>' +
            '</div>' +
            '<div class="about-side">' +
              '<div class="stats stats-stack">' + C.stats.map(function (s) {
                return '<div class="stat"><div class="stat-value">' + esc(s.value) + '</div><div class="stat-label">' + esc(s.label) + '</div></div>';
              }).join('') + '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section id="services" style="padding-top:0;border-top:none">' +
        '<div class="container">' +
          '<div class="sec-head reveal"><div class="sec-kicker">What We Do</div>' +
          '<h2 class="sec-title">Our Services</h2></div>' +
          '<div class="services-grid">' + C.services.map(function (s, i) {
            var num = (i + 1) < 10 ? '0' + (i + 1) : String(i + 1);
            return '<article class="service-card reveal"><span class="service-num">/ ' + num + '</span>' +
              '<div class="service-icon">' + ic(s.icon) + '</div>' +
              '<h3>' + esc(s.title) + '</h3><p>' + esc(s.desc) + '</p></article>';
          }).join('') + '</div>' +
        '</div>' +
      '</section>';
    page(inner, '/about');
  }

  /* ================= CONTACT ================= */
  function contactPage() {
    var inner =
      '<section class="page-top">' +
        '<div class="container">' +
          '<div class="crumbs reveal in"><a href="index.html">Home</a><span>/</span><strong>Contact Us</strong></div>' +
          '<h1 class="page-title">Contact Us</h1>' +
          '<div class="visit-grid reveal in">' +
            '<div class="visit-card">' +
              '<div class="visit-row"><div class="visit-ic">' + ic('pin') + '</div><div><h4>Address</h4><p>' + esc(C.contact.address) + '</p>' +
                '<a class="visit-link" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(C.contact.mapQuery) + '" target="_blank" rel="noopener">Get Directions →</a></div></div>' +
              '<div class="visit-row"><div class="visit-ic">' + ic('phoneCall') + '</div><div><h4>Phone</h4><p><a href="tel:' + esc(C.contact.phone.replace(/\s/g, '')) + '">' + esc(C.contact.phone) + '</a></p></div></div>' +
              '<div class="visit-row"><div class="visit-ic">' + ic('mail') + '</div><div><h4>Email</h4><p><a href="mailto:' + esc(C.contact.email) + '">' + esc(C.contact.email) + '</a></p></div></div>' +
              '<div class="visit-row"><div class="visit-ic">' + ic('clock') + '</div><div style="flex:1"><h4>Opening Hours</h4>' +
                '<table class="hours-table">' + C.contact.hours.map(function (h) {
                  return '<tr><td>' + esc(h[0]) + '</td><td>' + esc(h[1]) + '</td></tr>';
                }).join('') + '</table></div></div>' +
            '</div>' +
            '<div class="visit-card form-card">' +
              '<h3 class="form-title">Send a Message</h3>' +
              '<form id="contact-form">' +
                '<label class="field"><span>Your Name</span><input required name="name" maxlength="80" /></label>' +
                '<label class="field"><span>Your Email</span><input required type="email" name="email" maxlength="120" /></label>' +
                '<label class="field"><span>Message</span><textarea required name="body" rows="5" maxlength="2000"></textarea></label>' +
                '<button class="btn btn-solid" type="submit" style="width:100%">Send Message ' + ic('arrow') + '</button>' +
              '</form>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>';
    page(inner, '/contact');

    $('#contact-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target;
      api('/api/contact', { method: 'POST', body: { name: f.name.value, email: f.email.value, body: f.body.value } })
        .then(function (d) {
          if (d.ok) { toast('Message sent! We\'ll get back to you soon.'); f.reset(); }
          else toast(d.error || 'Something went wrong.', true);
        });
    });
  }

  /* ================= LOGIN (with forgot-password flow) ================= */
  function loginPage() {
    var inner =
      '<section class="auth-wrap">' +
        '<div class="auth-card reveal in" id="login-card">' +
          '<h1 class="auth-title">Welcome Back</h1>' +
          '<p class="auth-sub">Log in to track orders and check out faster.</p>' +
          '<form id="login-form">' +
            '<label class="field"><span>Email</span><input required type="email" name="email" autocomplete="email" /></label>' +
            '<label class="field"><span>Password</span><div class="pass-wrap"><input required type="password" name="password" autocomplete="current-password" id="pass-input" /><button type="button" class="pass-eye" id="pass-eye">' + ic('eye') + '</button></div></label>' +
            '<div class="form-error" id="form-error"></div>' +
            '<button class="btn btn-solid" type="submit" style="width:100%" id="submit-btn">Log In ' + ic('arrow') + '</button>' +
          '</form>' +
          '<p class="auth-alt"><a href="#" id="forgot-link">Forgot your password?</a></p>' +
          '<p class="auth-alt">New here? <a href="signup.html">Create an account</a></p>' +
        '</div>' +

        '<div class="auth-card reveal in" id="forgot-card" style="display:none">' +
          '<h1 class="auth-title">Reset Password</h1>' +
          '<p class="auth-sub">Enter your email and we\'ll send you a 6-digit reset code.</p>' +
          '<form id="forgot-form">' +
            '<label class="field"><span>Email</span><input required type="email" name="email" autocomplete="email" /></label>' +
            '<div class="form-error" id="forgot-error"></div>' +
            '<button class="btn btn-solid" type="submit" style="width:100%" id="forgot-btn">Send Reset Code ' + ic('arrow') + '</button>' +
          '</form>' +
          '<p class="auth-alt"><a href="#" id="back-login-1">← Back to login</a></p>' +
        '</div>' +

        '<div class="auth-card reveal in" id="reset-card" style="display:none">' +
          '<h1 class="auth-title">Enter Code</h1>' +
          '<p class="auth-sub" id="reset-sub">We sent a 6-digit code to your email. Enter it with your new password.</p>' +
          '<form id="reset-form">' +
            '<label class="field"><span>6-Digit Code</span><input required name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" class="code-input" placeholder="000000" /></label>' +
            '<label class="field"><span>New Password (min 6 chars)</span><div class="pass-wrap"><input required type="password" name="password" minlength="6" id="reset-pass" autocomplete="new-password" /><button type="button" class="pass-eye" id="reset-eye">' + ic('eye') + '</button></div></label>' +
            '<div class="form-error" id="reset-error"></div>' +
            '<button class="btn btn-solid" type="submit" style="width:100%" id="reset-btn">Set New Password ' + ic('check') + '</button>' +
          '</form>' +
          '<p class="auth-alt"><a href="#" id="back-login-2">← Back to login</a></p>' +
        '</div>' +
      '</section>';
    page(inner, '');

    function show(id) {
      ['login-card', 'forgot-card', 'reset-card'].forEach(function (c) {
        $('#' + c).style.display = c === id ? 'block' : 'none';
      });
    }
    $('#pass-eye').addEventListener('click', function () {
      var i = $('#pass-input'); i.type = i.type === 'password' ? 'text' : 'password';
    });
    $('#reset-eye').addEventListener('click', function () {
      var i = $('#reset-pass'); i.type = i.type === 'password' ? 'text' : 'password';
    });
    $('#forgot-link').addEventListener('click', function (e) { e.preventDefault(); show('forgot-card'); });
    $('#back-login-1').addEventListener('click', function (e) { e.preventDefault(); show('login-card'); });
    $('#back-login-2').addEventListener('click', function (e) { e.preventDefault(); show('login-card'); });

    $('#login-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, btn = $('#submit-btn'), err = $('#form-error');
      err.textContent = ''; btn.disabled = true; btn.textContent = 'Logging in…';
      api('/api/auth/login', { method: 'POST', body: { email: f.email.value, password: f.password.value } })
        .then(function (d) {
          if (d.ok) {
            setAuth(d.token, d.user);
            location.href = isStaff(d.user) ? 'admin.html' : 'account.html';
          } else {
            err.textContent = d.error || 'Login failed.';
            btn.disabled = false; btn.innerHTML = 'Log In ' + ic('arrow');
          }
        });
    });

    var resetEmail = '';
    $('#forgot-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, btn = $('#forgot-btn'), err = $('#forgot-error');
      err.textContent = ''; btn.disabled = true; btn.textContent = 'Sending…';
      resetEmail = f.email.value.trim();
      api('/api/auth/forgot', { method: 'POST', body: { email: resetEmail } }).then(function (d) {
        btn.disabled = false; btn.innerHTML = 'Send Reset Code ' + ic('arrow');
        if (!d.ok) { err.textContent = d.error || 'Failed.'; return; }
        show('reset-card');
        if (d.devCode) {
          $('#reset-sub').innerHTML = 'Email sending is not configured on this preview — your code is: <strong style="font-size:1.2rem;letter-spacing:.2em">' + d.devCode + '</strong>';
        }
      });
    });

    $('#reset-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, btn = $('#reset-btn'), err = $('#reset-error');
      err.textContent = ''; btn.disabled = true; btn.textContent = 'Saving…';
      api('/api/auth/reset', { method: 'POST', body: { email: resetEmail, code: f.code.value, password: f.password.value } })
        .then(function (d) {
          if (d.ok) {
            setAuth(d.token, d.user);
            toast('Password updated! Welcome back, ' + d.user.name);
            setTimeout(function () { location.href = isStaff(d.user) ? 'admin.html' : 'account.html'; }, 700);
          } else {
            err.textContent = d.error || 'Reset failed.';
            btn.disabled = false; btn.innerHTML = 'Set New Password ' + ic('check');
          }
        });
    });
  }

  /* ================= SIGNUP (2-step with email code) ================= */
  function signupPage() {
    var inner =
      '<section class="auth-wrap">' +
        '<div class="auth-card reveal in" id="signup-step1">' +
          '<h1 class="auth-title">Create Account</h1>' +
          '<p class="auth-sub">Sign up to order faster and track your purchases.</p>' +
          '<form id="signup-form">' +
            '<label class="field"><span>Full Name</span><input required name="name" maxlength="60" autocomplete="name" /></label>' +
            '<label class="field"><span>Email</span><input required type="email" name="email" autocomplete="email" /></label>' +
            '<label class="field"><span>Password (min 6 chars)</span><div class="pass-wrap"><input required type="password" name="password" minlength="6" id="pass-input" autocomplete="new-password" /><button type="button" class="pass-eye" id="pass-eye">' + ic('eye') + '</button></div></label>' +
            '<div class="form-error" id="form-error"></div>' +
            '<button class="btn btn-solid" type="submit" style="width:100%" id="submit-btn">Send Verification Code ' + ic('arrow') + '</button>' +
          '</form>' +
          '<p class="auth-alt">Already have an account? <a href="login.html">Log in</a></p>' +
        '</div>' +
        '<div class="auth-card reveal in" id="signup-step2" style="display:none">' +
          '<h1 class="auth-title">Check Your Email</h1>' +
          '<p class="auth-sub" id="code-sub">We sent a 6-digit code to your email. Enter it below to activate your account.</p>' +
          '<form id="verify-form">' +
            '<label class="field"><span>6-Digit Code</span><input required name="code" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" class="code-input" placeholder="000000" /></label>' +
            '<div class="form-error" id="verify-error"></div>' +
            '<button class="btn btn-solid" type="submit" style="width:100%" id="verify-btn">Verify &amp; Log In ' + ic('check') + '</button>' +
          '</form>' +
        '</div>' +
      '</section>';
    page(inner, '');

    $('#pass-eye').addEventListener('click', function () {
      var i = $('#pass-input'); i.type = i.type === 'password' ? 'text' : 'password';
    });

    var pendingEmail = '';
    $('#signup-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, btn = $('#submit-btn'), err = $('#form-error');
      err.textContent = ''; btn.disabled = true; btn.textContent = 'Sending code…';
      pendingEmail = f.email.value.trim();
      api('/api/auth/signup', { method: 'POST', body: { name: f.name.value, email: pendingEmail, password: f.password.value } })
        .then(function (d) {
          btn.disabled = false; btn.innerHTML = 'Send Verification Code ' + ic('arrow');
          if (!d.ok) { err.textContent = d.error || 'Signup failed.'; return; }
          $('#signup-step1').style.display = 'none';
          $('#signup-step2').style.display = 'block';
          if (d.devCode) {
            $('#code-sub').innerHTML = 'Email sending is not configured on this preview — your code is: <strong style="font-size:1.2rem;letter-spacing:.2em">' + d.devCode + '</strong>';
          } else if (!d.emailSent) {
            $('#code-sub').textContent = 'We could not send the email right now. Please try again in a minute.';
          }
        });
    });

    $('#verify-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, btn = $('#verify-btn'), err = $('#verify-error');
      err.textContent = ''; btn.disabled = true; btn.textContent = 'Verifying…';
      api('/api/auth/verify', { method: 'POST', body: { email: pendingEmail, code: f.code.value } })
        .then(function (d) {
          if (d.ok) {
            setAuth(d.token, d.user);
            toast('Account created! Welcome, ' + d.user.name);
            setTimeout(function () { location.href = 'account.html'; }, 700);
          } else {
            err.textContent = d.error || 'Verification failed.';
            btn.disabled = false; btn.innerHTML = 'Verify & Log In ' + ic('check');
          }
        });
    });
  }

  /* ================= ACCOUNT ================= */
  function accountPage() {
    var u = getUser();
    if (!u) { location.href = 'login.html'; return; }
    var inner =
      '<section class="page-top">' +
        '<div class="container">' +
          '<div class="crumbs reveal in"><a href="index.html">Home</a><span>/</span><strong>My Account</strong></div>' +
          '<div class="account-head reveal in">' +
            '<div><h1 class="page-title" style="margin-bottom:4px">Hi, ' + esc(u.name) + '</h1>' +
            '<p class="auth-sub" style="margin:0">' + esc(u.email) + (isStaff(u) ? ' · <a href="admin.html" style="text-decoration:underline">Open Admin Panel</a>' : '') + '</p></div>' +
            '<button class="btn btn-outline btn-sm" id="logout-btn">' + ic('logout') + ' Log Out</button>' +
          '</div>' +
          '<h2 class="form-title" style="margin-top:44px">My Orders</h2>' +
          '<div id="orders-wrap" class="reveal in"><div class="empty-note">Loading…</div></div>' +
        '</div>' +
      '</section>';
    page(inner, '');

    $('#logout-btn').addEventListener('click', function () {
      api('/api/auth/logout', { method: 'POST' }).then(function () {
        setAuth(null, null);
        location.href = 'index.html';
      });
    });

    api('/api/my/orders').then(function (d) {
      if (d.error) { $('#orders-wrap').innerHTML = '<div class="empty-note">' + esc(d.error) + '</div>'; return; }
      var orders = d.orders || [];
      if (!orders.length) {
        $('#orders-wrap').innerHTML = '<div class="empty-note">No orders yet. <a href="shop.html" style="text-decoration:underline">Start shopping →</a></div>';
        return;
      }
      $('#orders-wrap').innerHTML = '<table class="data-table"><thead><tr><th>Code</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>' +
        orders.map(function (o) {
          var items = []; try { items = JSON.parse(o.items); } catch (e) {}
          return '<tr><td><strong>' + esc(o.code) + '</strong></td>' +
            '<td>' + items.map(function (i) { return esc(i.name) + ' ×' + i.qty; }).join('<br>') + '</td>' +
            '<td>' + rs(o.total) + '</td>' +
            '<td><span class="status-pill s-' + esc(o.status) + '">' + esc(o.status) + '</span></td>' +
            '<td>' + esc(String(o.created_at).slice(0, 10)) + '</td></tr>';
        }).join('') + '</tbody></table>';
    });
  }

  /* ================= CART ================= */
  function cartPage() {
    var inner =
      '<section class="page-top">' +
        '<div class="container">' +
          '<div class="crumbs reveal in"><a href="index.html">Home</a><span>/</span><strong>Cart</strong></div>' +
          '<h1 class="page-title">Your Cart</h1>' +
          '<div id="cart-wrap" class="reveal in"></div>' +
        '</div>' +
      '</section>';
    page(inner, '');

    var coupon = null;       /* {code, percent} once validated */
    var cardEnabled = false;
    api('/api/pay/config').then(function (d) {
      cardEnabled = !!(d && d.enabled);
      if (cardEnabled && $('#cart-wrap')) renderCart();
    });

    function renderCart() {
      var cart = getCart();
      var wrap = $('#cart-wrap');
      if (!wrap) return;
      if (!cart.length) {
        wrap.innerHTML = '<div class="empty-note">Your cart is empty. <a href="shop.html" style="text-decoration:underline">Go shopping →</a></div>';
        return;
      }
      var subtotal = cart.reduce(function (a, i) { return a + i.price * i.qty; }, 0);
      var discount = coupon ? Math.round(subtotal * coupon.percent / 100) : 0;
      var total = subtotal - discount;
      wrap.innerHTML =
        '<table class="data-table cart-table"><thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead><tbody>' +
        cart.map(function (i, idx) {
          return '<tr><td><div class="cart-item-name"><span class="cart-item-icon">' + ic(i.icon) + '</span>' + esc(i.name) + '</div></td>' +
            '<td>' + rs(i.price) + '</td>' +
            '<td><div class="qty-ctrl"><button data-act="dec" data-i="' + idx + '">−</button><span>' + i.qty + '</span><button data-act="inc" data-i="' + idx + '">+</button></div></td>' +
            '<td>' + rs(i.price * i.qty) + '</td>' +
            '<td><button class="icon-btn" data-act="del" data-i="' + idx + '">' + ic('trash') + '</button></td></tr>';
        }).join('') +
        '</tbody></table>' +
        '<div class="coupon-row">' +
          (coupon
            ? '<div class="coupon-applied">' + ic('tag') + ' <strong>' + esc(coupon.code) + '</strong> — ' + coupon.percent + '% off applied <button class="icon-btn" id="coupon-remove" title="Remove code">' + ic('close') + '</button></div>'
            : '<form id="coupon-form" class="coupon-inline"><input id="coupon-input" placeholder="Discount code" maxlength="20" style="text-transform:uppercase" /><button type="submit" class="btn btn-outline btn-sm">Apply</button></form>') +
        '</div>' +
        '<div class="cart-summary">' +
          '<div class="cs-line"><span>Subtotal</span><span>' + rs(subtotal) + '</span></div>' +
          (discount ? '<div class="cs-line cs-discount"><span>Discount (' + esc(coupon.code) + ')</span><span>− ' + rs(discount) + '</span></div>' : '') +
          '<div class="cs-line cs-total"><span>Total</span><strong>' + rs(total) + '</strong></div>' +
        '</div>' +
        '<div class="cart-foot cart-pay-row">' +
          '<button class="btn btn-solid" id="checkout-btn">' + ic('wa') + ' Checkout on WhatsApp</button>' +
          (cardEnabled ? '<button class="btn btn-outline" id="card-btn">' + ic('card') + ' Pay by Card</button>' : '') +
        '</div>' +
        '<p class="auth-sub" style="margin-top:14px">' +
          (cardEnabled
            ? 'WhatsApp checkout: we confirm stock, payment and delivery in chat. Pay by Card: secure online payment via Stripe — your order is confirmed instantly.'
            : 'Checkout creates an order code and opens WhatsApp with your order pre-filled — we confirm stock, payment and delivery in chat.') + '</p>';

      var cf = $('#coupon-form');
      if (cf) cf.addEventListener('submit', function (e) {
        e.preventDefault();
        var code = $('#coupon-input').value.trim().toUpperCase();
        if (!code) return;
        api('/api/coupons/check', { method: 'POST', body: { code: code, items: getCart() } }).then(function (d) {
          if (d.ok) { coupon = { code: d.code, percent: d.percent }; toast(d.percent + '% discount applied!'); renderCart(); }
          else toast(d.error || 'Invalid code.', true);
        });
      });

      wrap.onclick = function (e) {
        if (e.target.closest('#coupon-remove')) { coupon = null; renderCart(); return; }
        var b = e.target.closest('button[data-act]');
        if (b) {
          var cart2 = getCart(); var i = Number(b.dataset.i);
          if (b.dataset.act === 'inc') cart2[i].qty = Math.min(99, cart2[i].qty + 1);
          if (b.dataset.act === 'dec') { cart2[i].qty--; if (cart2[i].qty < 1) cart2.splice(i, 1); }
          if (b.dataset.act === 'del') cart2.splice(i, 1);
          setCart(cart2); renderCart(); return;
        }
        if (e.target.closest('#checkout-btn')) {
          var btn = $('#checkout-btn'); btn.disabled = true; btn.textContent = 'Creating order…';
          api('/api/orders', { method: 'POST', body: { items: getCart(), coupon: coupon ? coupon.code : '' } }).then(function (d) {
            if (!d.ok) { toast(d.error || 'Checkout failed.', true); btn.disabled = false; btn.innerHTML = ic('wa') + ' Checkout on WhatsApp'; return; }
            var lines = d.items.map(function (i) { return '- ' + i.name + ' x' + i.qty + ' = ' + rs(i.price * i.qty); });
            var msg = 'Hi ' + C.brand.name + '! New order ' + d.code + ':\n' + lines.join('\n') +
              (d.discount ? '\nDiscount (' + d.coupon + '): -' + rs(d.discount) : '') +
              '\nTotal: ' + rs(d.total);
            setCart([]); coupon = null;
            toast('Order ' + d.code + ' created!');
            window.open(waLink(msg), '_blank');
            renderCart();
          });
          return;
        }
        if (e.target.closest('#card-btn')) {
          var cb = $('#card-btn'); cb.disabled = true; cb.textContent = 'Opening secure payment…';
          api('/api/pay/checkout', { method: 'POST', body: { items: getCart(), coupon: coupon ? coupon.code : '' } }).then(function (d) {
            if (d.ok && d.url) { location.href = d.url; return; }
            toast(d.error || 'Could not start card payment.', true);
            cb.disabled = false; cb.innerHTML = ic('card') + ' Pay by Card';
          });
        }
      };
    }
    renderCart();
  }

  /* ================= PAY SUCCESS ================= */
  function paySuccessPage() {
    var inner =
      '<section class="auth-wrap"><div class="auth-card" id="pay-card">' +
        '<h1 class="auth-title">Checking payment…</h1>' +
        '<p class="auth-sub">Please wait while we confirm your payment with Stripe.</p>' +
      '</div></section>';
    page(inner, '');
    var sid = new URLSearchParams(location.search).get('session_id');
    var card = $('#pay-card');
    if (!sid) {
      card.innerHTML = '<h1 class="auth-title">Missing payment session</h1><p class="auth-sub">We could not find a payment to verify.</p><a class="btn btn-solid" href="cart.html" style="width:100%">Back to Cart</a>';
      return;
    }
    api('/api/pay/verify?session_id=' + encodeURIComponent(sid)).then(function (d) {
      if (d.ok && d.paid) {
        setCart([]);
        card.innerHTML =
          '<div class="pay-ok-icon">' + ic('check') + '</div>' +
          '<h1 class="auth-title">Payment Successful!</h1>' +
          '<p class="auth-sub">Order <strong>' + esc(d.code) + '</strong> is confirmed and paid — ' + rs(d.total) + '. A confirmation email is on its way. We\'ll contact you about delivery.</p>' +
          '<a class="btn btn-solid" href="shop.html" style="width:100%">Continue Shopping</a>' +
          '<a class="btn btn-outline" href="account.html" style="width:100%;margin-top:10px">View My Orders</a>';
      } else {
        card.innerHTML =
          '<h1 class="auth-title">Payment Not Completed</h1>' +
          '<p class="auth-sub">' + esc(d.error || 'This payment was not completed. Your cart is untouched — you can try again.') + '</p>' +
          '<a class="btn btn-solid" href="cart.html" style="width:100%">Back to Cart</a>';
      }
    });
  }

  /* ================= router ================= */
  var routes = {
    '/': homePage, '/shop': shopPage, '/about': aboutPage, '/contact': contactPage,
    '/login': loginPage, '/signup': signupPage, '/account': accountPage, '/cart': cartPage,
    '/pay/success': paySuccessPage
  };
  /* wait for site overrides (brand/logo/services) before first render */
  (window.SITE_READY || Promise.resolve()).then(function () {
    document.title = C.brand.name + ' — ' + ({
      '/': C.brand.tagline, '/shop': 'Shop', '/about': 'About Us', '/contact': 'Contact Us',
      '/login': 'Login', '/signup': 'Sign Up', '/account': 'My Account', '/cart': 'Cart'
    }[path] || C.brand.tagline);
    (routes[path] || homePage)();
  });
})();
