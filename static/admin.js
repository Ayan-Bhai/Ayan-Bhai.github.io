/* ============================================================
   TECHNOVA — Admin Panel (monochrome, sidebar layout)
   Tabs: Dashboard, Products, Categories, Orders, Users, Messages
   ============================================================ */
(function () {
  'use strict';
  var C = window.SHOP_CONFIG;
  var app = $('#app');
  document.title = C.brand.name + ' — Admin';

  var u = getUser();
  if (!isStaff(u)) {
    app.innerHTML =
      '<section class="auth-wrap"><div class="auth-card">' +
      '<h1 class="auth-title">Admin Only</h1>' +
      '<p class="auth-sub">You must log in with an admin account to open this panel.</p>' +
      '<a class="btn btn-solid" href="login.html" style="width:100%">Go to Login</a>' +
      '</div></section>';
    mountCursor();
    return;
  }

  var TABS = [
    ['dash', 'Dashboard', 'chart'],
    ['analytics', 'Analytics', 'chart'],
    ['products', 'Products', 'box'],
    ['categories', 'Categories', 'menu'],
    ['orders', 'Orders', 'cart'],
    ['coupons', 'Discounts', 'tag'],
    ['users', 'Users', 'user'],
    ['messages', 'Messages', 'mail'],
    ['website', 'Website', 'star'],
    ['settings', 'Settings', 'gear']
  ];
  var cats = [];

  app.innerHTML =
    '<div class="admin-shell">' +
      '<aside class="admin-side" id="admin-side">' +
        '<a href="index.html" class="nav-brand" style="margin-bottom:26px">' + logoHtml() + esc(C.brand.name) + '</a>' +
        '<nav class="admin-nav" id="admin-nav">' +
          TABS.map(function (t) {
            return '<button data-tab="' + t[0] + '">' + ic(t[2]) + '<span>' + t[1] + '</span></button>';
          }).join('') +
        '</nav>' +
        '<div class="admin-side-foot">' +
          '<button class="theme-switch" id="theme-toggle"><span class="knob" id="theme-knob"></span></button>' +
          '<button class="btn btn-outline btn-sm" id="logout-btn">' + ic('logout') + ' Log Out</button>' +
        '</div>' +
      '</aside>' +
      '<div class="admin-overlay" id="admin-overlay"></div>' +
      '<main class="admin-main">' +
        '<header class="admin-top">' +
          '<button class="hamburger" id="admin-burger">' + ic('menu') + '</button>' +
          '<h1 id="admin-title">Dashboard</h1>' +
          '<span class="admin-user">' + ic('user') + ' ' + esc(u.name) + (u.role === 'owner' ? ' <span class="status-pill s-confirmed">owner</span>' : '') + '</span>' +
        '</header>' +
        '<div class="admin-body" id="admin-body"></div>' +
      '</main>' +
    '</div>' +
    '<div class="modal-back" id="modal-back"><div class="modal" id="modal"></div></div>';

  mountThemeSwitch();
  mountCursor();

  $('#logout-btn').addEventListener('click', function () {
    api('/api/auth/logout', { method: 'POST' }).then(function () {
      setAuth(null, null); location.href = 'index.html';
    });
  });

  /* sidebar mobile */
  var side = $('#admin-side'), aoverlay = $('#admin-overlay');
  $('#admin-burger').addEventListener('click', function () {
    side.classList.add('open'); aoverlay.classList.add('show');
  });
  aoverlay.addEventListener('click', function () {
    side.classList.remove('open'); aoverlay.classList.remove('show');
  });

  /* modal helpers */
  var modalBack = $('#modal-back'), modal = $('#modal');
  function openModal(html) { modal.innerHTML = html; modalBack.classList.add('show'); }
  function closeModal() { modalBack.classList.remove('show'); }
  modalBack.addEventListener('click', function (e) { if (e.target === modalBack) closeModal(); });

  var body = $('#admin-body');
  function setTab(tab) {
    $$('#admin-nav button').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === tab); });
    var t = TABS.filter(function (x) { return x[0] === tab; })[0];
    $('#admin-title').textContent = t ? t[1] : '';
    side.classList.remove('open'); aoverlay.classList.remove('show');
    views[tab]();
  }
  $('#admin-nav').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tab]'); if (b) setTab(b.dataset.tab);
  });

  function guard(d) {
    if (d && d.error === 'Admin only.') { setAuth(null, null); location.href = 'login.html'; return true; }
    return false;
  }

  /* ============ DASHBOARD ============ */
  var views = {};
  views.dash = function () {
    body.innerHTML = '<div class="empty-note">Loading…</div>';
    api('/api/admin/stats').then(function (d) {
      if (guard(d)) return;
      body.innerHTML =
        '<div class="admin-stats">' +
          card('Customers', d.users) + card('Active Products', d.products) +
          card('Orders', d.orders) + card('Unread Messages', d.unread) +
          card('Confirmed Revenue', rs(d.revenue || 0)) +
        '</div>' +
        '<div class="admin-hint">Use the sidebar to manage products, categories, orders, users and messages. Changes go live on the website instantly.</div>';
    });
    function card(label, val) {
      return '<div class="stat"><div class="stat-value">' + esc(val == null ? 0 : val) + '</div><div class="stat-label">' + esc(label) + '</div></div>';
    }
  };

  /* ============ PRODUCTS ============ */
  var ICON_CHOICES = ['laptop','phone','earbuds','speaker','headphones','charger','mouse','keyboard','watch','ram','gpu','monitor','cpu','box'];

  /* --- generic drag & drop for table rows --- */
  function makeSortable(tbody, onDone) {
    var dragging = null;
    $$('tr[data-id]', tbody).forEach(function (tr) {
      tr.draggable = true;
      tr.addEventListener('dragstart', function (e) {
        dragging = tr; tr.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', tr.dataset.id); } catch (err) {}
      });
      tr.addEventListener('dragend', function () {
        if (dragging) dragging.classList.remove('dragging');
        dragging = null;
        onDone($$('tr[data-id]', tbody).map(function (r) { return Number(r.dataset.id); }));
      });
    });
    tbody.addEventListener('dragover', function (e) {
      e.preventDefault();
      if (!dragging) return;
      var after = null;
      $$('tr[data-id]:not(.dragging)', tbody).forEach(function (r) {
        var rect = r.getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2 && !after) after = r;
      });
      if (after) tbody.insertBefore(dragging, after);
      else tbody.appendChild(dragging);
    });
  }

  views.products = function () {
    body.innerHTML = '<div class="empty-note">Loading…</div>';
    Promise.all([api('/api/admin/products'), api('/api/catalog'), api('/api/admin/settings')]).then(function (r) {
      if (guard(r[0])) return;
      cats = r[1].categories || [];
      var bannerId = r[2].banner_product || null;
      var products = r[0].products || [];
      body.innerHTML =
        '<div class="admin-actions"><button class="btn btn-solid btn-sm" id="add-product-btn">' + ic('plus') + ' Add Product</button>' +
        '<span class="dim-note" style="margin-left:auto">' + ic('menu') + ' Drag rows to reorder the shop</span></div>' +
        '<div class="table-scroll"><table class="data-table"><thead><tr>' +
        '<th></th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Flags</th><th style="text-align:right">Actions</th>' +
        '</tr></thead><tbody id="prod-tbody">' +
        products.map(function (p) {
          return '<tr data-id="' + p.id + '">' +
            '<td class="drag-cell" title="Drag to reorder">' + ic('menu') + '</td>' +
            '<td><div class="cart-item-name"><span class="cart-item-icon">' + ic(p.icon) + '</span><div><strong>' + esc(p.name) + '</strong><br><small class="dim-note">' + esc(p.descr || '') + '</small></div></div></td>' +
            '<td>' + esc(p.category || '—') + '</td>' +
            '<td>' + rs(p.price) + (p.old_price ? '<br><small class="dim-note" style="text-decoration:line-through">' + rs(p.old_price) + '</small>' : '') + '</td>' +
            '<td>' + (p.stock <= 0 ? '<span class="status-pill s-cancelled">out</span>' : (p.stock <= 3 ? '<span class="status-pill s-pending">' + p.stock + ' low</span>' : p.stock)) + '</td>' +
            '<td>' + (p.id === bannerId ? '<span class="status-pill s-confirmed">banner</span> ' : '') + (p.pinned ? '<span class="status-pill">pinned</span> ' : '') + (p.active ? '' : '<span class="status-pill s-cancelled">hidden</span>') + (p.badge ? '<span class="status-pill s-confirmed">' + esc(p.badge) + '</span>' : '') + '</td>' +
            '<td style="text-align:right">' +
              '<button class="icon-btn pin-btn' + (p.pinned ? ' on' : '') + '" title="' + (p.pinned ? 'Unpin' : 'Pin to top') + '">' + ic('pin') + '</button> ' +
              '<button class="icon-btn banner-btn' + (p.id === bannerId ? ' on' : '') + '" title="' + (p.id === bannerId ? 'Remove from shop banner' : 'Show in shop banner') + '">' + ic('star') + '</button> ' +
              '<button class="icon-btn img-btn" title="Images / cover">' + ic('image') + '<span class="img-count">' + (p.img_count || '') + '</span></button> ' +
              '<button class="icon-btn edit-btn" title="Edit">' + ic('edit') + '</button> ' +
              '<button class="icon-btn del-btn" title="Delete">' + ic('trash') + '</button></td>' +
            '</tr>';
        }).join('') +
        '</tbody></table></div>' +
        '<p class="dim-note" style="margin-top:12px">★ = featured in the big shop banner · 📌 pin keeps a product at the top · open Images to add photos and pick the cover.</p>';

      $('#add-product-btn').addEventListener('click', function () { productForm(null); });
      makeSortable($('#prod-tbody'), function (ids) {
        api('/api/admin/reorder/products', { method: 'PUT', body: { ids: ids } }).then(function (d) {
          if (d.ok) toast('Order saved'); else toast(d.error || 'Failed', true);
        });
      });
      body.onclick = function (e) {
        var tr = e.target.closest('tr[data-id]'); if (!tr) return;
        var p = products.filter(function (x) { return x.id === Number(tr.dataset.id); })[0];
        if (!p) return;
        if (e.target.closest('.pin-btn')) {
          api('/api/admin/products/' + p.id + '/pin', { method: 'PUT', body: { pinned: p.pinned ? 0 : 1 } }).then(function (d) {
            if (d.ok) { toast(p.pinned ? 'Unpinned' : 'Pinned to top'); views.products(); } else toast(d.error || 'Failed', true);
          });
          return;
        }
        if (e.target.closest('.banner-btn')) {
          var makeIt = p.id !== bannerId;
          api('/api/admin/banner', { method: 'PUT', body: { product_id: makeIt ? p.id : 0 } }).then(function (d) {
            if (d.ok) { toast(makeIt ? '"' + p.name + '" is now the shop banner' : 'Banner cleared'); views.products(); } else toast(d.error || 'Failed', true);
          });
          return;
        }
        if (e.target.closest('.img-btn')) imageManager(p);
        if (e.target.closest('.edit-btn')) productForm(p);
        if (e.target.closest('.del-btn')) {
          if (confirm('Delete "' + p.name + '"?')) {
            api('/api/admin/products/' + p.id, { method: 'DELETE' }).then(function () {
              toast('Product deleted'); views.products();
            });
          }
        }
      };
    });
  };

  function productForm(p) {
    p = p || {};
    openModal(
      '<h3 class="form-title">' + (p.id ? 'Edit Product' : 'Add Product') + '</h3>' +
      '<form id="product-form">' +
        '<label class="field"><span>Name</span><input required name="name" value="' + esc(p.name || '') + '" maxlength="90" /></label>' +
        '<div class="field-row">' +
          '<label class="field"><span>Price (Rs)</span><input required type="number" name="price" min="0" value="' + (p.price || '') + '" /></label>' +
          '<label class="field"><span>Old Price (optional)</span><input type="number" name="old_price" min="0" value="' + (p.old_price || '') + '" /></label>' +
        '</div>' +
        '<div class="field-row">' +
          '<label class="field"><span>Category</span><select name="category_id">' +
            '<option value="">— None —</option>' +
            cats.map(function (c) { return '<option value="' + c.id + '"' + (p.category_id === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') +
          '</select></label>' +
          '<label class="field"><span>Stock</span><input type="number" name="stock" min="0" value="' + (p.stock == null ? 5 : p.stock) + '" /></label>' +
        '</div>' +
        '<div class="field-row">' +
          '<label class="field"><span>Badge (Hot / New / …)</span><input name="badge" value="' + esc(p.badge || '') + '" maxlength="14" /></label>' +
          '<label class="field"><span>Icon</span><select name="icon">' +
            ICON_CHOICES.map(function (i) { return '<option value="' + i + '"' + ((p.icon || 'laptop') === i ? ' selected' : '') + '>' + i + '</option>'; }).join('') +
          '</select></label>' +
        '</div>' +
        '<label class="field"><span>Description / Specs</span><input name="descr" value="' + esc(p.descr || '') + '" maxlength="140" /></label>' +
        '<div class="check-row">' +
          '<label><input type="checkbox" name="pinned"' + (p.pinned ? ' checked' : '') + ' /> Pinned (always first)</label>' +
          '<label><input type="checkbox" name="active"' + (p.active === 0 ? '' : ' checked') + ' /> Visible on website</label>' +
        '</div>' +
        '<div class="modal-actions">' +
          '<button type="button" class="btn btn-outline btn-sm" id="modal-cancel">Cancel</button>' +
          '<button type="submit" class="btn btn-solid btn-sm">' + (p.id ? 'Save Changes' : 'Add Product') + '</button>' +
        '</div>' +
      '</form>'
    );
    $('#modal-cancel').addEventListener('click', closeModal);
    $('#product-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target;
      var bodyData = {
        name: f.name.value.trim(),
        price: Number(f.price.value),
        old_price: f.old_price.value ? Number(f.old_price.value) : null,
        category_id: f.category_id.value ? Number(f.category_id.value) : null,
        stock: Number(f.stock.value) || 0,
        badge: f.badge.value.trim() || null,
        icon: f.icon.value,
        descr: f.descr.value.trim(),
        pinned: f.pinned.checked ? 1 : 0,
        active: f.active.checked ? 1 : 0
      };
      var req = p.id
        ? api('/api/admin/products/' + p.id, { method: 'PUT', body: bodyData })
        : api('/api/admin/products', { method: 'POST', body: bodyData });
      req.then(function (d) {
        if (d.ok) { toast(p.id ? 'Product updated' : 'Product added'); closeModal(); views.products(); }
        else toast(d.error || 'Failed', true);
      });
    });
  }

  /* ============ CATEGORIES ============ */
  views.categories = function () {
    body.innerHTML = '<div class="empty-note">Loading…</div>';
    api('/api/catalog').then(function (d) {
      cats = d.categories || [];
      var counts = {};
      (d.products || []).forEach(function (p) { counts[p.category] = (counts[p.category] || 0) + 1; });
      body.innerHTML =
        '<div class="admin-actions"><form id="cat-add-form" class="inline-form">' +
          '<input required name="name" placeholder="New category name" maxlength="40" />' +
          '<button class="btn btn-solid btn-sm" type="submit">' + ic('plus') + ' Add</button>' +
        '</form></div>' +
        '<div class="table-scroll"><table class="data-table"><thead><tr><th></th><th>Category</th><th>Products</th><th style="text-align:right">Actions</th></tr></thead><tbody id="cat-tbody">' +
        cats.map(function (c) {
          return '<tr data-id="' + c.id + '"><td class="drag-cell" title="Drag to reorder">' + ic('menu') + '</td><td><strong>' + esc(c.name) + '</strong></td>' +
            '<td>' + (counts[c.name] || 0) + '</td>' +
            '<td style="text-align:right"><button class="icon-btn ren-btn">' + ic('edit') + '</button> <button class="icon-btn del-btn">' + ic('trash') + '</button></td></tr>';
        }).join('') +
        '</tbody></table></div>' +
        '<p class="dim-note" style="margin-top:14px">Drag rows to change the order shown in the shop filter. Deleting a category moves its products to “no category”.</p>';

      makeSortable($('#cat-tbody'), function (ids) {
        api('/api/admin/reorder/categories', { method: 'PUT', body: { ids: ids } }).then(function (d) {
          if (d.ok) toast('Order saved'); else toast(d.error || 'Failed', true);
        });
      });

      $('#cat-add-form').addEventListener('submit', function (e) {
        e.preventDefault();
        api('/api/admin/categories', { method: 'POST', body: { name: e.target.name.value } }).then(function (d) {
          if (guard(d)) return;
          if (d.ok) { toast('Category added'); views.categories(); }
          else toast(d.error || 'Failed', true);
        });
      });
      body.onclick = function (e) {
        var tr = e.target.closest('tr[data-id]'); if (!tr) return;
        var c = cats.filter(function (x) { return x.id === Number(tr.dataset.id); })[0];
        if (e.target.closest('.ren-btn')) {
          var name = prompt('Rename category:', c.name);
          if (name && name.trim()) {
            api('/api/admin/categories/' + c.id, { method: 'PUT', body: { name: name.trim() } }).then(function () {
              toast('Renamed'); views.categories();
            });
          }
        }
        if (e.target.closest('.del-btn')) {
          if (confirm('Delete category "' + c.name + '"?')) {
            api('/api/admin/categories/' + c.id, { method: 'DELETE' }).then(function () {
              toast('Category deleted'); views.categories();
            });
          }
        }
      };
    });
  };

  /* ============ ORDERS ============ */
  views.orders = function () {
    body.innerHTML = '<div class="empty-note">Loading…</div>';
    api('/api/admin/orders').then(function (d) {
      if (guard(d)) return;
      var orders = d.orders || [];
      if (!orders.length) { body.innerHTML = '<div class="empty-note">No orders yet.</div>'; return; }
      body.innerHTML =
        '<div class="table-scroll"><table class="data-table"><thead><tr>' +
        '<th>Code</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>' +
        orders.map(function (o) {
          var items = []; try { items = JSON.parse(o.items); } catch (e) {}
          return '<tr data-id="' + o.id + '"><td><strong>' + esc(o.code) + '</strong></td>' +
            '<td>' + esc(o.user_email || 'guest') + '</td>' +
            '<td>' + items.map(function (i) { return esc(i.name) + ' ×' + i.qty; }).join('<br>') + '</td>' +
            '<td>' + rs(o.total) + '</td>' +
            '<td><select class="status-select" data-id="' + o.id + '">' +
              ['pending', 'confirmed', 'delivered', 'cancelled'].map(function (s) {
                return '<option value="' + s + '"' + (o.status === s ? ' selected' : '') + '>' + s + '</option>';
              }).join('') + '</select></td>' +
            '<td>' + esc(String(o.created_at).slice(0, 16)) + '</td></tr>';
        }).join('') + '</tbody></table></div>';

      body.onchange = function (e) {
        var s = e.target.closest('.status-select'); if (!s) return;
        api('/api/admin/orders/' + s.dataset.id, { method: 'PUT', body: { status: s.value } }).then(function (d2) {
          if (d2.ok) toast('Order updated'); else toast(d2.error || 'Failed', true);
        });
      };
    });
  };

  /* ============ USERS (with role management) ============ */
  views.users = function () {
    body.innerHTML = '<div class="empty-note">Loading…</div>';
    api('/api/admin/users').then(function (d) {
      if (guard(d)) return;
      var users = d.users || [];
      var me = d.me || { id: u.id, role: u.role };
      var iAmOwner = me.role === 'owner';

      function rolePill(r) {
        if (r === 'owner') return '<span class="status-pill s-confirmed">owner</span>';
        if (r === 'admin') return '<span class="status-pill">admin</span>';
        return 'user';
      }
      function roleCell(x) {
        /* owner can change everyone except self & the owner row; admins just see the role */
        if (!iAmOwner || x.id === me.id || x.role === 'owner') return rolePill(x.role);
        return '<select class="status-select role-select" data-id="' + x.id + '">' +
          [['customer', 'user'], ['admin', 'admin'], ['owner', 'owner']].map(function (r) {
            return '<option value="' + r[0] + '"' + (x.role === r[0] ? ' selected' : '') + '>' + r[1] + '</option>';
          }).join('') + '</select>';
      }
      function canDelete(x) {
        if (x.id === me.id || x.role === 'owner') return false;
        if (x.role === 'admin' && !iAmOwner) return false;
        return true;
      }

      body.innerHTML =
        (iAmOwner
          ? '<div class="admin-hint" style="margin-bottom:18px">You are the <strong>owner</strong> — you can promote users to admin, demote admins, or transfer ownership. Admins can manage the shop but cannot change roles.</div>'
          : '<div class="admin-hint" style="margin-bottom:18px">Only the <strong>owner</strong> can change user roles.</div>') +
        '<div class="table-scroll"><table class="data-table"><thead><tr>' +
        '<th>Name</th><th>Email</th><th>Role</th><th>Verified</th><th>Joined</th><th style="text-align:right">Actions</th></tr></thead><tbody>' +
        users.map(function (x) {
          return '<tr data-id="' + x.id + '"><td><strong>' + esc(x.name) + '</strong>' + (x.id === me.id ? ' <small class="dim-note">(you)</small>' : '') + '</td>' +
            '<td>' + esc(x.email) + '</td>' +
            '<td>' + roleCell(x) + '</td>' +
            '<td>' + (x.verified ? ic('check') : '—') + '</td>' +
            '<td>' + esc(String(x.created_at).slice(0, 10)) + '</td>' +
            '<td style="text-align:right">' + (canDelete(x) ? '<button class="icon-btn del-btn">' + ic('trash') + '</button>' : '') + '</td></tr>';
        }).join('') + '</tbody></table></div>';

      body.onchange = function (e) {
        var s = e.target.closest('.role-select'); if (!s) return;
        var x = users.filter(function (q) { return q.id === Number(s.dataset.id); })[0];
        var newRole = s.value;
        var label = newRole === 'customer' ? 'user' : newRole;
        var msg = newRole === 'owner'
          ? 'Transfer OWNERSHIP to ' + x.email + '?\n\nYou will become an admin and ' + x.name + ' becomes the owner. Only they will be able to change roles after this.'
          : 'Change ' + x.email + ' to "' + label + '"?';
        if (!confirm(msg)) { s.value = x.role; return; }
        api('/api/admin/users/' + x.id + '/role', { method: 'PUT', body: { role: newRole } }).then(function (d2) {
          if (d2.ok) {
            if (d2.transferred) {
              toast('Ownership transferred to ' + x.name);
              /* my own role changed — refresh cached user */
              api('/api/auth/me').then(function (m) {
                if (m.user) setAuth(getToken(), m.user);
                location.reload();
              });
            } else { toast('Role updated'); views.users(); }
          } else { toast(d2.error || 'Failed', true); s.value = x.role; }
        });
      };
      body.onclick = function (e) {
        var tr = e.target.closest('tr[data-id]'); if (!tr || !e.target.closest('.del-btn')) return;
        var x = users.filter(function (q) { return q.id === Number(tr.dataset.id); })[0];
        if (confirm('Delete user ' + x.email + '? Their orders stay in the log.')) {
          api('/api/admin/users/' + x.id, { method: 'DELETE' }).then(function (d2) {
            if (d2.ok) { toast('User deleted'); views.users(); } else toast(d2.error || 'Failed', true);
          });
        }
      };
    });
  };

  /* ============ MESSAGES ============ */
  views.messages = function () {
    body.innerHTML = '<div class="empty-note">Loading…</div>';
    api('/api/admin/messages').then(function (d) {
      if (guard(d)) return;
      var msgs = d.messages || [];
      if (!msgs.length) { body.innerHTML = '<div class="empty-note">No messages yet.</div>'; return; }
      body.innerHTML = msgs.map(function (m) {
        return '<article class="msg-card' + (m.read ? '' : ' unread') + '" data-id="' + m.id + '">' +
          '<div class="msg-head"><strong>' + esc(m.name) + '</strong> <a href="mailto:' + esc(m.email) + '">' + esc(m.email) + '</a>' +
          '<span class="dim-note">' + esc(String(m.created_at).slice(0, 16)) + '</span>' +
          (m.read ? '' : '<button class="btn btn-outline btn-sm mark-btn">Mark read</button>') + '</div>' +
          '<p>' + esc(m.body) + '</p></article>';
      }).join('');

      body.onclick = function (e) {
        var b = e.target.closest('.mark-btn'); if (!b) return;
        var card = b.closest('.msg-card');
        api('/api/admin/messages/' + card.dataset.id + '/read', { method: 'PUT' }).then(function () {
          card.classList.remove('unread'); b.remove();
        });
      };
    });
  };

  /* ============ ANALYTICS ============ */
  var anaSel = { year: '', month: '', day: '' };
  views.analytics = function () {
    body.innerHTML = '<div class="empty-note">Loading…</div>';
    var qs = [];
    if (anaSel.year) qs.push('year=' + anaSel.year);
    if (anaSel.month) qs.push('month=' + anaSel.month);
    if (anaSel.day) qs.push('day=' + anaSel.day);
    api('/api/admin/analytics' + (qs.length ? '?' + qs.join('&') : '')).then(function (d) {
      if (guard(d)) return;
      var t = d.totals || {};
      var years = d.years && d.years.length ? d.years : [String(new Date().getFullYear())];
      if (!anaSel.year) anaSel.year = years[0];

      function opt(v, label, cur) { return '<option value="' + v + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + label + '</option>'; }
      var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      var monthOpts = '<option value="">Whole year</option>';
      for (var m = 1; m <= 12; m++) monthOpts += opt(String(m).padStart(2, '0'), MONTHS[m - 1], anaSel.month);
      var dayOpts = '<option value="">Whole month</option>';
      for (var dd = 1; dd <= 31; dd++) dayOpts += opt(String(dd).padStart(2, '0'), dd, anaSel.day);

      var controls =
        '<div class="ana-controls">' +
          '<label class="field"><span>Year</span><select id="ana-year">' + years.map(function (y) { return opt(y, y, anaSel.year); }).join('') + '</select></label>' +
          '<label class="field"><span>Month</span><select id="ana-month">' + monthOpts + '</select></label>' +
          '<label class="field"><span>Day</span><select id="ana-day"' + (anaSel.month ? '' : ' disabled') + '>' + dayOpts + '</select></label>' +
        '</div>';

      var cards =
        '<div class="admin-stats">' +
          card('Orders', t.orders || 0) +
          card('Revenue', rs(t.revenue || 0)) +
          card('Confirmed Revenue', rs(t.confirmed_revenue || 0)) +
          card('Paid Online', rs(t.paid_online || 0)) +
          card('Discounts Given', rs(t.discounts || 0)) +
          card('Avg Order', rs(Math.round(t.avg_order || 0))) +
        '</div>';

      /* bar chart */
      var series = d.series || [];
      var chart;
      if (!series.length) {
        chart = '<div class="empty-note">No orders in this period.</div>';
      } else {
        var max = Math.max.apply(null, series.map(function (s) { return s.revenue; }).concat([1]));
        var unit = d.labelFmt === 'hour' ? 'h' : '';
        chart = '<div class="ana-chart">' + series.map(function (s) {
          var h = Math.max(4, Math.round((s.revenue / max) * 150));
          var lbl = d.labelFmt === 'month' ? ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(s.k)] : Number(s.k) + unit;
          return '<div class="ana-col" title="' + esc(lbl) + ': ' + rs(s.revenue) + ' · ' + s.orders + ' order(s)">' +
            '<div class="ana-bar" style="height:' + h + 'px"></div>' +
            '<div class="ana-lbl">' + esc(lbl) + '</div></div>';
        }).join('') + '</div>';
      }

      var topRows = (d.topProducts || []).map(function (p) {
        return '<tr><td>' + esc(p.name) + '</td><td>' + p.qty + '</td><td>' + rs(p.revenue) + '</td></tr>';
      }).join('') || '<tr><td colspan="3" class="dim-note">No sales in this period.</td></tr>';
      var statusRows = (d.byStatus || []).map(function (s) {
        return '<tr><td><span class="status-pill s-' + esc(s.status) + '">' + esc(s.status) + '</span></td><td>' + s.n + '</td></tr>';
      }).join('') || '<tr><td colspan="2" class="dim-note">—</td></tr>';

      body.innerHTML =
        controls + cards +
        '<div class="settings-card"><h3 class="form-title">Revenue — ' +
          (anaSel.day && anaSel.month ? 'by hour' : anaSel.month ? 'by day' : 'by month') + '</h3>' + chart + '</div>' +
        '<div class="ana-two">' +
          '<div class="settings-card"><h3 class="form-title">Top Products</h3>' +
            '<div class="table-wrap"><table class="admin-table"><thead><tr><th>Product</th><th>Qty</th><th>Revenue</th></tr></thead><tbody>' + topRows + '</tbody></table></div></div>' +
          '<div class="settings-card"><h3 class="form-title">Orders by Status</h3>' +
            '<div class="table-wrap"><table class="admin-table"><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>' + statusRows + '</tbody></table></div></div>' +
        '</div>';

      body.onchange = function (e) {
        if (e.target.id === 'ana-year') { anaSel.year = e.target.value; }
        else if (e.target.id === 'ana-month') { anaSel.month = e.target.value; if (!anaSel.month) anaSel.day = ''; }
        else if (e.target.id === 'ana-day') { anaSel.day = e.target.value; }
        else return;
        views.analytics();
      };
    });
    function card(label, val) {
      return '<div class="stat"><div class="stat-value">' + esc(val == null ? 0 : val) + '</div><div class="stat-label">' + esc(label) + '</div></div>';
    }
  };

  /* ============ COUPONS / DISCOUNTS ============ */
  views.coupons = function () {
    body.innerHTML = '<div class="empty-note">Loading…</div>';
    api('/api/admin/coupons').then(function (d) {
      if (guard(d)) return;
      var list = d.coupons || [];
      var rows = list.map(function (cp) {
        var expired = cp.expires_at && new Date(cp.expires_at.replace(' ', 'T')) < new Date();
        var usedUp = cp.max_uses > 0 && cp.uses >= cp.max_uses;
        var state = !cp.active ? ['paused', 's-pending'] : expired ? ['expired', 's-cancelled'] : usedUp ? ['used up', 's-cancelled'] : ['active', 's-confirmed'];
        return '<tr data-id="' + cp.id + '">' +
          '<td><strong>' + esc(cp.code) + '</strong></td>' +
          '<td>' + cp.percent + '% off</td>' +
          '<td>' + (cp.min_total ? rs(cp.min_total) : '—') + '</td>' +
          '<td>' + cp.uses + (cp.max_uses ? ' / ' + cp.max_uses : '') + '</td>' +
          '<td>' + (cp.expires_at ? esc(String(cp.expires_at).slice(0, 10)) : 'Never') + '</td>' +
          '<td><span class="status-pill ' + state[1] + '">' + state[0] + '</span></td>' +
          '<td class="row-actions">' +
            '<button class="btn btn-outline btn-sm cp-toggle">' + (cp.active ? 'Pause' : 'Activate') + '</button>' +
            '<button class="icon-btn cp-del" title="Delete">' + ic('trash') + '</button>' +
          '</td></tr>';
      }).join('');

      body.innerHTML =
        '<div class="settings-card">' +
          '<h3 class="form-title">Create Discount Code</h3>' +
          '<p class="dim-note" style="margin-bottom:16px">Customers type this code in the cart to get a percentage off their order.</p>' +
          '<form id="coupon-form" class="coupon-form">' +
            '<label class="field"><span>Code</span><input name="code" placeholder="SUMMER20" required maxlength="20" style="text-transform:uppercase" /></label>' +
            '<label class="field"><span>Discount %</span><input name="percent" type="number" min="1" max="90" placeholder="10" required /></label>' +
            '<label class="field"><span>Min order (Rs, optional)</span><input name="min_total" type="number" min="0" placeholder="0" /></label>' +
            '<label class="field"><span>Max uses (0 = unlimited)</span><input name="max_uses" type="number" min="0" placeholder="0" /></label>' +
            '<label class="field"><span>Expires (optional)</span><input name="expires_at" type="date" /></label>' +
            '<button type="submit" class="btn btn-solid btn-sm">' + ic('plus') + ' Create Code</button>' +
          '</form>' +
        '</div>' +
        (list.length
          ? '<div class="table-wrap"><table class="admin-table"><thead><tr><th>Code</th><th>Discount</th><th>Min Order</th><th>Uses</th><th>Expires</th><th>Status</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>'
          : '<div class="empty-note">No discount codes yet — create one above.</div>');

      $('#coupon-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var f = e.target;
        api('/api/admin/coupons', { method: 'POST', body: {
          code: f.code.value, percent: f.percent.value,
          min_total: f.min_total.value, max_uses: f.max_uses.value, expires_at: f.expires_at.value
        } }).then(function (d2) {
          if (d2.ok) { toast('Discount code created'); views.coupons(); }
          else toast(d2.error || 'Failed', true);
        });
      });

      body.onclick = function (e) {
        var tr = e.target.closest('tr[data-id]'); if (!tr) return;
        var id = tr.dataset.id;
        var cp = list.filter(function (x) { return String(x.id) === id; })[0];
        if (e.target.closest('.cp-toggle')) {
          api('/api/admin/coupons/' + id, { method: 'PUT', body: { active: !cp.active } }).then(function (d2) {
            if (d2.ok) { toast(cp.active ? 'Code paused' : 'Code activated'); views.coupons(); } else toast(d2.error || 'Failed', true);
          });
        } else if (e.target.closest('.cp-del')) {
          if (!confirm('Delete code "' + cp.code + '"?')) return;
          api('/api/admin/coupons/' + id, { method: 'DELETE' }).then(function (d2) {
            if (d2.ok) { toast('Code deleted'); views.coupons(); } else toast(d2.error || 'Failed', true);
          });
        }
      };
    });
  };

  /* ============ PRODUCT IMAGES ============ */
  function compressImage(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      var url = URL.createObjectURL(file);
      img.onload = function () {
        URL.revokeObjectURL(url);
        var MAX = 1000;
        var w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        var cv = document.createElement('canvas');
        cv.width = w; cv.height = h;
        cv.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(cv.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('bad image')); };
      img.src = url;
    });
  }

  function imageManager(p) {
    openModal(
      '<h3 class="form-title">Images — ' + esc(p.name) + '</h3>' +
      '<p class="dim-note" style="margin-bottom:16px">Up to 8 photos. The first one is the cover shown on the product card. Click ★ to make an image the cover.</p>' +
      '<div class="img-grid" id="img-grid"><div class="empty-note">Loading…</div></div>' +
      '<label class="img-drop" id="img-drop">' + ic('plus') +
        '<span>Add photos (JPG / PNG / WebP)</span>' +
        '<input type="file" id="img-input" accept="image/jpeg,image/png,image/webp" multiple hidden />' +
      '</label>' +
      '<div class="modal-actions"><button type="button" class="btn btn-outline btn-sm" id="modal-cancel">Done</button></div>'
    );
    $('#modal-cancel').addEventListener('click', function () { closeModal(); views.products(); });

    function load() {
      api('/api/admin/products/' + p.id + '/images').then(function (d) {
        var imgs = d.images || [];
        $('#img-grid').innerHTML = imgs.length
          ? imgs.map(function (im, i) {
              return '<figure class="img-thumb' + (i === 0 ? ' cover' : '') + '" data-id="' + im.id + '">' +
                '<img src="' + imgUrl(im.id) + '" alt="" loading="lazy" />' +
                (i === 0 ? '<span class="cover-tag">Cover</span>' : '<button class="thumb-act cover-btn" title="Make cover">★</button>') +
                '<button class="thumb-act thumb-del del-img-btn" title="Remove">' + ic('close') + '</button>' +
                '</figure>';
            }).join('')
          : '<div class="empty-note" style="padding:16px 0">No photos yet — the product card shows its icon instead.</div>';
      });
    }
    load();

    $('#img-grid').onclick = function (e) {
      var fig = e.target.closest('.img-thumb'); if (!fig) return;
      if (e.target.closest('.del-img-btn')) {
        api('/api/admin/images/' + fig.dataset.id, { method: 'DELETE' }).then(function () { toast('Image removed'); load(); });
      }
      if (e.target.closest('.cover-btn')) {
        api('/api/admin/images/' + fig.dataset.id + '/cover', { method: 'PUT' }).then(function () { toast('Cover updated'); load(); });
      }
    };

    $('#img-input').addEventListener('change', function () {
      var files = Array.prototype.slice.call(this.files || []);
      if (!files.length) return;
      var drop = $('#img-drop');
      drop.classList.add('busy');
      Promise.all(files.slice(0, 8).map(compressImage)).then(function (datas) {
        return api('/api/admin/products/' + p.id + '/images', { method: 'POST', body: { images: datas.map(function (d) { return { data: d }; }) } });
      }).then(function (d) {
        drop.classList.remove('busy');
        if (d.ok) { toast(d.added + ' photo(s) added'); load(); }
        else toast(d.error || 'Upload failed', true);
      }).catch(function () {
        drop.classList.remove('busy');
        toast('Could not read one of the files', true);
      });
      this.value = '';
    });
  }

  /* ============ WEBSITE (identity, logo, SEO, Why-Choose-Us) ============ */
  var SVC_ICONS = ['shield','wrench','truck','swap','card','headset','box','star','check','clock','pin','mail','tag','laptop','phone','headphones','chart','user','gear'];

  views.website = function () {
    body.innerHTML = '<div class="empty-note">Loading…</div>';
    api('/api/admin/site').then(function (d) {
      if (guard(d)) return;
      var services = [];
      if (d.site_services) { try { services = JSON.parse(d.site_services); } catch (e) {} }
      var usingDefaults = !services.length;
      if (usingDefaults) services = C.services.map(function (s) { return { icon: s.icon, title: s.title, desc: s.desc }; });

      body.innerHTML =
        /* ---- identity ---- */
        '<div class="settings-card">' +
          '<h3 class="form-title">Website Name &amp; Branding</h3>' +
          '<p class="dim-note" style="margin-bottom:20px">These rebrand the whole website instantly — navbar, footer, hero and browser tab.</p>' +
          '<form id="brand-form">' +
            '<div class="field-row">' +
              '<label class="field"><span>Website Name</span><input name="site_name" value="' + esc(d.site_name) + '" placeholder="' + esc(C.brand.name) + '" maxlength="40" /></label>' +
              '<label class="field"><span>Logo Letters (2–3, used when no logo image)</span><input name="site_logo_text" value="' + esc(d.site_logo_text) + '" placeholder="' + esc(C.brand.logoText) + '" maxlength="3" style="text-transform:uppercase" /></label>' +
            '</div>' +
            '<label class="field"><span>Tagline</span><input name="site_tagline" value="' + esc(d.site_tagline) + '" placeholder="' + esc(C.brand.tagline) + '" maxlength="80" /></label>' +
            '<div class="field-row">' +
              '<label class="field"><span>Hero Title</span><input name="hero_title" value="' + esc(d.hero_title) + '" placeholder="' + esc(C.brand.heroTitle) + '" maxlength="60" /></label>' +
              '<label class="field"><span>Hero Accent Line</span><input name="hero_accent" value="' + esc(d.hero_accent) + '" placeholder="' + esc(C.brand.heroTitleAccent) + '" maxlength="60" /></label>' +
            '</div>' +
            '<label class="field"><span>Hero Subtitle</span><textarea name="hero_sub" rows="2" maxlength="300" placeholder="' + esc(C.brand.heroSub) + '">' + esc(d.hero_sub) + '</textarea></label>' +
            '<div class="modal-actions" style="justify-content:flex-start"><button type="submit" class="btn btn-solid btn-sm">Save Branding</button></div>' +
          '</form>' +
        '</div>' +

        /* ---- logo ---- */
        '<div class="settings-card">' +
          '<h3 class="form-title">Website Logo</h3>' +
          '<p class="dim-note" style="margin-bottom:20px">Shown in the navbar, footer and as the browser-tab icon. Square images look best (PNG / JPG / WebP / SVG, max ~500 KB).</p>' +
          '<div class="logo-row" style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">' +
            '<span class="nav-logo' + (d.has_logo ? ' has-img' : '') + '" id="logo-preview" style="width:56px;height:56px;font-size:1.2rem">' +
              (d.has_logo ? '<img src="' + API_BASE + '/logo?v=' + esc(d.logo_ver) + '" alt="logo" />' : esc(C.brand.logoText)) + '</span>' +
            '<label class="btn btn-solid btn-sm" style="cursor:pointer">' + ic('image') + ' Upload Logo' +
              '<input type="file" id="logo-input" accept="image/jpeg,image/png,image/webp,image/svg+xml" hidden /></label>' +
            (d.has_logo ? '<button class="btn btn-outline btn-sm" id="logo-remove">' + ic('trash') + ' Remove Logo</button>' : '') +
          '</div>' +
        '</div>' +

        /* ---- SEO ---- */
        '<div class="settings-card">' +
          '<h3 class="form-title">SEO — Search Engine Settings</h3>' +
          '<p class="dim-note" style="margin-bottom:20px">Control how your site appears on Google. The site already includes sitemap.xml, robots.txt, Open Graph tags and structured data automatically — these fields fine-tune the text.</p>' +
          '<form id="seo-form">' +
            '<label class="field"><span>SEO Title (≤ 60 chars) <small class="dim-note" id="seo-title-count"></small></span><input name="seo_title" value="' + esc(d.seo_title) + '" placeholder="' + esc(C.brand.name) + ' — ' + esc(C.brand.tagline) + '" maxlength="70" /></label>' +
            '<label class="field"><span>SEO Description (≤ 160 chars) <small class="dim-note" id="seo-desc-count"></small></span><textarea name="seo_desc" rows="2" maxlength="170" placeholder="Laptops, mobiles, audio and accessories — genuine products at honest prices.">' + esc(d.seo_desc) + '</textarea></label>' +
            '<label class="field"><span>Keywords (comma separated)</span><input name="seo_keywords" value="' + esc(d.seo_keywords) + '" placeholder="laptops, mobiles, tech shop karachi" maxlength="300" /></label>' +
            '<div class="modal-actions" style="justify-content:flex-start"><button type="submit" class="btn btn-solid btn-sm">Save SEO</button></div>' +
          '</form>' +
          '<div class="setting-status"><span class="dim-note">Google preview:</span>' +
            '<div style="margin-top:8px;padding:14px;border:1px solid var(--line,#333);border-radius:12px">' +
              '<div id="seo-prev-title" style="font-size:1.05rem;text-decoration:underline"></div>' +
              '<div id="seo-prev-desc" class="dim-note" style="margin-top:4px"></div>' +
            '</div></div>' +
        '</div>' +

        /* ---- Why Choose Us ---- */
        '<div class="settings-card">' +
          '<h3 class="form-title">“Why Choose Us” Section</h3>' +
          '<p class="dim-note" style="margin-bottom:20px">The numbered rows on the home page (“More Than Just a Shop”). Edit, reorder, add or remove items — shown on the Home and About pages.' +
            (usingDefaults ? ' <strong>Currently showing the built-in defaults.</strong>' : '') + '</p>' +
          '<div id="svc-list"></div>' +
          '<div class="modal-actions" style="justify-content:flex-start;margin-top:14px">' +
            '<button class="btn btn-outline btn-sm" id="svc-add">' + ic('plus') + ' Add Item</button>' +
            '<button class="btn btn-solid btn-sm" id="svc-save">Save Section</button>' +
            '<button class="btn btn-outline btn-sm" id="svc-reset">Reset to Defaults</button>' +
          '</div>' +
        '</div>';

      /* --- branding save --- */
      $('#brand-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var f = e.target;
        api('/api/admin/site', { method: 'PUT', body: {
          site_name: f.site_name.value, site_tagline: f.site_tagline.value,
          site_logo_text: f.site_logo_text.value.toUpperCase(),
          hero_title: f.hero_title.value, hero_accent: f.hero_accent.value, hero_sub: f.hero_sub.value
        } }).then(function (d2) {
          if (d2.ok) { toast('Branding saved — reloading…'); setTimeout(function () { location.reload(); }, 700); }
          else toast(d2.error || 'Failed', true);
        });
      });

      /* --- logo upload / remove --- */
      $('#logo-input').addEventListener('change', function () {
        var file = this.files && this.files[0]; if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toast('File too big — pick an image under 2 MB', true); return; }
        var isSvg = file.type === 'image/svg+xml';
        var done = function (dataUrl) {
          api('/api/admin/site/logo', { method: 'PUT', body: { data: dataUrl } }).then(function (d2) {
            if (d2.ok) { toast('Logo updated — reloading…'); setTimeout(function () { location.reload(); }, 700); }
            else toast(d2.error || 'Upload failed', true);
          });
        };
        if (isSvg) {
          var rd = new FileReader();
          rd.onload = function () { done(rd.result); };
          rd.readAsDataURL(file);
        } else {
          /* resize raster logos to max 512px, keep transparency as PNG */
          var img = new Image(), url = URL.createObjectURL(file);
          img.onload = function () {
            URL.revokeObjectURL(url);
            var MAX = 512, w = img.width, h = img.height;
            if (w > MAX || h > MAX) { if (w > h) { h = Math.round(h * MAX / w); w = MAX; } else { w = Math.round(w * MAX / h); h = MAX; } }
            var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
            cv.getContext('2d').drawImage(img, 0, 0, w, h);
            done(cv.toDataURL('image/png'));
          };
          img.onerror = function () { URL.revokeObjectURL(url); toast('Could not read that image', true); };
          img.src = url;
        }
        this.value = '';
      });
      var rm = $('#logo-remove');
      if (rm) rm.addEventListener('click', function () {
        if (!confirm('Remove the logo? The letter tile (' + (d.site_logo_text || C.brand.logoText) + ') will be shown instead.')) return;
        api('/api/admin/site/logo', { method: 'PUT', body: { data: '' } }).then(function (d2) {
          if (d2.ok) { toast('Logo removed — reloading…'); setTimeout(function () { location.reload(); }, 700); }
          else toast(d2.error || 'Failed', true);
        });
      });

      /* --- SEO live preview + save --- */
      var sf = $('#seo-form');
      function seoPrev() {
        var t = sf.seo_title.value.trim() || (C.brand.name + ' — ' + C.brand.tagline);
        var ds = sf.seo_desc.value.trim() || 'Laptops, mobiles, audio and accessories — genuine products at honest prices.';
        $('#seo-prev-title').textContent = t;
        $('#seo-prev-desc').textContent = ds;
        $('#seo-title-count').textContent = '(' + sf.seo_title.value.length + '/60)';
        $('#seo-desc-count').textContent = '(' + sf.seo_desc.value.length + '/160)';
      }
      sf.addEventListener('input', seoPrev); seoPrev();
      sf.addEventListener('submit', function (e) {
        e.preventDefault();
        api('/api/admin/site', { method: 'PUT', body: {
          seo_title: sf.seo_title.value, seo_desc: sf.seo_desc.value, seo_keywords: sf.seo_keywords.value
        } }).then(function (d2) {
          if (d2.ok) toast('SEO settings saved'); else toast(d2.error || 'Failed', true);
        });
      });

      /* --- services editor --- */
      function drawSvcs() {
        $('#svc-list').innerHTML = services.map(function (s, i) {
          return '<div class="svc-item" data-i="' + i + '" style="display:grid;grid-template-columns:auto 110px 1fr auto;gap:10px;align-items:start;padding:12px 0;border-bottom:1px solid var(--line,#2a2a2a)">' +
            '<strong class="dim-note" style="padding-top:10px">' + (i + 1 < 10 ? '0' + (i + 1) : i + 1) + '</strong>' +
            '<select class="svc-icon" style="padding:9px">' + SVC_ICONS.map(function (ic2) {
              return '<option value="' + ic2 + '"' + (s.icon === ic2 ? ' selected' : '') + '>' + ic2 + '</option>';
            }).join('') + '</select>' +
            '<div><input class="svc-title" value="' + esc(s.title) + '" maxlength="60" placeholder="Title" style="width:100%;margin-bottom:6px" />' +
            '<input class="svc-desc" value="' + esc(s.desc) + '" maxlength="220" placeholder="Description" style="width:100%" /></div>' +
            '<div style="display:flex;flex-direction:column;gap:4px;padding-top:4px">' +
              '<button class="icon-btn svc-up" title="Move up"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
              '<button class="icon-btn svc-down" title="Move down"' + (i === services.length - 1 ? ' disabled' : '') + '>↓</button>' +
              '<button class="icon-btn svc-del" title="Remove">' + ic('trash') + '</button>' +
            '</div></div>';
        }).join('') || '<div class="empty-note">No items — click “Add Item”.</div>';
      }
      function pullSvcs() {
        $$('.svc-item').forEach(function (el, i) {
          services[i] = {
            icon: $('.svc-icon', el).value,
            title: $('.svc-title', el).value.trim(),
            desc: $('.svc-desc', el).value.trim()
          };
        });
      }
      drawSvcs();
      $('#svc-list').addEventListener('click', function (e) {
        var item = e.target.closest('.svc-item'); if (!item) return;
        var i = Number(item.dataset.i);
        if (e.target.closest('.svc-del')) { pullSvcs(); services.splice(i, 1); drawSvcs(); }
        else if (e.target.closest('.svc-up') && i > 0) { pullSvcs(); var t1 = services[i - 1]; services[i - 1] = services[i]; services[i] = t1; drawSvcs(); }
        else if (e.target.closest('.svc-down') && i < services.length - 1) { pullSvcs(); var t2 = services[i + 1]; services[i + 1] = services[i]; services[i] = t2; drawSvcs(); }
      });
      $('#svc-add').addEventListener('click', function () {
        if (services.length >= 12) { toast('Max 12 items', true); return; }
        pullSvcs(); services.push({ icon: 'shield', title: '', desc: '' }); drawSvcs();
      });
      $('#svc-save').addEventListener('click', function () {
        pullSvcs();
        for (var i = 0; i < services.length; i++) {
          if (!services[i].title || !services[i].desc) { toast('Item ' + (i + 1) + ' needs a title and a description', true); return; }
        }
        api('/api/admin/site/services', { method: 'PUT', body: { services: services } }).then(function (d2) {
          if (d2.ok) toast('“Why Choose Us” saved — live on the website');
          else toast(d2.error || 'Failed', true);
        });
      });
      $('#svc-reset').addEventListener('click', function () {
        if (!confirm('Reset the section to the built-in default items?')) return;
        api('/api/admin/site/services', { method: 'PUT', body: { services: null } }).then(function (d2) {
          if (d2.ok) { toast('Reset to defaults'); views.website(); }
          else toast(d2.error || 'Failed', true);
        });
      });
    });
  };

  /* ============ SETTINGS ============ */
  views.settings = function () {
    body.innerHTML = '<div class="empty-note">Loading…</div>';
    api('/api/admin/settings').then(function (d) {
      if (guard(d)) return;
      body.innerHTML =
        '<div class="settings-card">' +
          '<h3 class="form-title">Email Sending (Gmail)</h3>' +
          '<p class="dim-note" style="margin-bottom:20px">The website uses this Gmail account to send verification codes, order confirmations and contact-form copies. Use a Gmail <strong>App Password</strong> (Google Account → Security → 2-Step Verification → App passwords).</p>' +
          '<form id="settings-form">' +
            '<label class="field"><span>Gmail Address (sender)</span><input type="email" name="gmail_user" value="' + esc(d.gmail_user || '') + '" placeholder="yourshop@gmail.com" /></label>' +
            '<label class="field"><span>App Password ' + (d.gmail_pass_set ? '(saved — leave blank to keep)' : '') + '</span><input name="gmail_pass" placeholder="xxxx xxxx xxxx xxxx" autocomplete="off" /></label>' +
            '<div class="modal-actions" style="justify-content:flex-start">' +
              '<button type="submit" class="btn btn-solid btn-sm">Save Settings</button>' +
              '<button type="button" class="btn btn-outline btn-sm" id="test-email-btn">Send Test Email</button>' +
            '</div>' +
          '</form>' +
          '<div class="setting-status">' +
            '<span class="status-pill ' + (d.gmail_user && d.gmail_pass_set ? 's-confirmed' : 's-pending') + '">' +
              (d.gmail_user && d.gmail_pass_set ? 'Email configured' : 'Email not fully configured') + '</span>' +
            (!d.gmail_user ? '<span class="dim-note"> — add the Gmail address to start sending real emails. Until then, signup codes are shown on-screen.</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="settings-card">' +
          '<h3 class="form-title">Card Payments (Stripe)</h3>' +
          '<p class="dim-note" style="margin-bottom:20px">Get your key at <strong>dashboard.stripe.com → Developers → API keys</strong>. Use the <strong>Secret key</strong> — starts with <code>sk_test_</code> for testing (fake cards) or <code>sk_live_</code> for real money. Once saved, a “Pay by Card” button appears in the customer cart.</p>' +
          '<form id="stripe-form">' +
            '<label class="field"><span>Stripe Secret Key ' + (d.stripe_set ? '(saved — leave blank to keep)' : '') + '</span><input name="stripe_sk" placeholder="sk_test_..." autocomplete="off" /></label>' +
            '<div class="modal-actions" style="justify-content:flex-start">' +
              '<button type="submit" class="btn btn-solid btn-sm">Save Stripe Key</button>' +
            '</div>' +
          '</form>' +
          '<div class="setting-status">' +
            '<span class="status-pill ' + (d.stripe_set ? 's-confirmed' : 's-pending') + '">' +
              (d.stripe_set ? 'Card payments enabled' : 'Card payments off') + '</span>' +
            (!d.stripe_set ? '<span class="dim-note"> — customers can still order via WhatsApp checkout.</span>' : '') +
          '</div>' +
        '</div>';

      $('#settings-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var f = e.target;
        api('/api/admin/settings', { method: 'PUT', body: { gmail_user: f.gmail_user.value, gmail_pass: f.gmail_pass.value } })
          .then(function (d2) {
            if (d2.ok) { toast('Settings saved'); views.settings(); }
            else toast(d2.error || 'Failed', true);
          });
      });
      $('#test-email-btn').addEventListener('click', function () {
        var b = this; b.disabled = true; b.textContent = 'Sending…';
        api('/api/admin/settings/test-email', { method: 'POST' }).then(function (d2) {
          b.disabled = false; b.textContent = 'Send Test Email';
          if (d2.ok) toast('Test email sent! Check your inbox.');
          else toast(d2.error || 'Failed', true);
        });
      });
      $('#stripe-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var v = e.target.stripe_sk.value.trim();
        if (!v) { toast('Paste your Stripe secret key first', true); return; }
        api('/api/admin/settings', { method: 'PUT', body: { stripe_sk: v } }).then(function (d2) {
          if (d2.ok) { toast('Stripe key saved — card payments enabled'); views.settings(); }
          else toast(d2.error || 'Failed', true);
        });
      });
    });
  };

  (window.SITE_READY || Promise.resolve()).then(function () {
    document.title = C.brand.name + ' — Admin';
    setTab('dash');
  });
})();
