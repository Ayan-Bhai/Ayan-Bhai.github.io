/* ============================================================
   API CONFIG — the ONLY file you must edit after deploying.

   Set API_BASE to your Railway backend URL (no trailing slash).
   ⚠ MUST be https:// — browsers block http:// requests from an
     https:// page (Mixed Content error). Railway supports https.

   For local development it automatically uses localhost.
   ============================================================ */
window.API_BASE = 'https://tech-nova-backend-production.up.railway.app';

/* ---------- safety nets (no need to edit below) ---------- */
(function () {
  // local dev: when the page itself runs on localhost, talk to the local backend
  if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    window.API_BASE = 'http://localhost:8080';
    return;
  }
  // auto-fix Mixed Content: if this page is https, the API must be https too
  if (location.protocol === 'https:' && /^http:\/\//i.test(window.API_BASE)) {
    window.API_BASE = window.API_BASE.replace(/^http:\/\//i, 'https://');
  }
  // strip trailing slash(es)
  window.API_BASE = window.API_BASE.replace(/\/+$/, '');
})();
