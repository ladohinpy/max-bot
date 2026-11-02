// MAX identity is separate from a Foxford account. Never persist initData.
const SDK_URL = 'https://st.max.ru/js/max-web-app.js';

function hasMaxLaunch() {
  try {
    const url = new URL(window.location.href);
    return new URLSearchParams(url.hash.slice(1)).has('WebAppData') || url.searchParams.has('WebAppData');
  } catch { return false; }
}

function loadSdk() {
  if (window.WebApp) return Promise.resolve(window.WebApp);
  return new Promise((resolve, reject) => {
    let script = document.querySelector('script[data-foxel-max-sdk]');
    const timeout = window.setTimeout(() => reject(new Error('sdk_timeout')), 6500);
    const finish = () => {
      window.clearTimeout(timeout);
      window.WebApp ? resolve(window.WebApp) : reject(new Error('sdk_unavailable'));
    };
    if (!script) {
      script = document.createElement('script');
      script.src = SDK_URL;
      script.async = true;
      script.dataset.foxelMaxSdk = 'true';
      script.addEventListener('load', finish, { once: true });
      script.addEventListener('error', () => { window.clearTimeout(timeout); reject(new Error('sdk_load_failed')); }, { once: true });
      document.head.append(script);
    } else if (window.WebApp) finish();
    else script.addEventListener('load', finish, { once: true });
  });
}

export async function initMaxBridge(onUpdate = () => {}) {
  const context = { mode: 'browser', launchDetected: hasMaxLaunch(), bridgeReady: false, identityVerified: false, sessionState: 'demo', identity: null, foxfordLinked: false };
  if (!context.launchDetected) return context;
  context.mode = 'max';
  context.sessionState = 'checking';
  onUpdate({ ...context });
  try {
    const api = await loadSdk();
    context.bridgeReady = true;
    // A missing native host must not prevent server-side identity validation.
    try { if (typeof api.ready === 'function') api.ready(); } catch { /* Browser demo stays usable. */ }
    if (typeof api.initData !== 'string' || !api.initData) {
      context.sessionState = 'unavailable';
      return context;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('/api/max/session', {
        method: 'POST', credentials: 'same-origin', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData: api.initData }),
      });
      if (!response.ok) {
        context.sessionState = response.status === 503 ? 'unconfigured' : response.status === 401 ? 'invalid' : 'unavailable';
        return context;
      }
      const result = await response.json();
      context.identityVerified = result.authenticated === true && result.identityVerified === true;
      context.identity = context.identityVerified && result.identity ? {
        firstName: String(result.identity.firstName || ''), maxUserId: String(result.identity.maxUserId || ''),
      } : null;
      context.sessionState = context.identityVerified ? 'verified' : 'unavailable';
    } finally { window.clearTimeout(timeout); }
  } catch { context.sessionState = 'unavailable'; }
  return context;
}
