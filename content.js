// Renders a suggestion banner isolated from the host page via Shadow DOM
const BANNER_HOST_ID = '__url_converter_host__';

function createBanner(newUrl, sourceHost, targetHost) {
  const existing = document.getElementById(BANNER_HOST_ID);
  if (existing) existing.remove();

  const host = document.createElement('div');
  host.id = BANNER_HOST_ID;
  host.style.cssText = 'position:fixed;top:0;left:0;width:100%;z-index:2147483647;';

  const shadow = host.attachShadow({ mode: 'closed' });

  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    .banner {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      padding: 10px 16px;
      background: linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%);
      color: #fff;
      font: 14px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: slideDown 0.2s ease;
    }
    @keyframes slideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .icon { font-size: 18px; flex-shrink: 0; }
    .text { flex: 1; min-width: 0; }
    .label { font-weight: 600; white-space: nowrap; }
    .url {
      display: block;
      font-size: 12px;
      opacity: 0.85;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 600px;
    }
    .actions { display: flex; gap: 8px; flex-shrink: 0; }
    button {
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font: 13px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 7px 14px;
      transition: opacity 0.15s;
    }
    button:hover { opacity: 0.85; }
    .btn-primary { background: #fff; color: #1a73e8; font-weight: 600; }
    .btn-dismiss { background: rgba(255,255,255,0.2); color: #fff; }
  `;

  const banner = document.createElement('div');
  banner.className = 'banner';
  banner.setAttribute('role', 'alert');

  const icon = document.createElement('span');
  icon.className = 'icon';
  icon.textContent = '🔄';

  const textEl = document.createElement('div');
  textEl.className = 'text';

  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = `Rewrite available: ${sourceHost} → ${targetHost}`;

  const urlEl = document.createElement('span');
  urlEl.className = 'url';
  urlEl.title = newUrl;
  urlEl.textContent = newUrl;

  textEl.appendChild(label);
  textEl.appendChild(urlEl);

  const actions = document.createElement('div');
  actions.className = 'actions';

  const rewriteBtn = document.createElement('button');
  rewriteBtn.className = 'btn-primary';
  rewriteBtn.textContent = 'Rewrite URL';
  rewriteBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'REWRITE_URL', url: newUrl });
  });

  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'btn-dismiss';
  dismissBtn.setAttribute('aria-label', 'Dismiss');
  dismissBtn.textContent = '✕';
  dismissBtn.addEventListener('click', () => host.remove());

  actions.appendChild(rewriteBtn);
  actions.appendChild(dismissBtn);

  banner.appendChild(icon);
  banner.appendChild(textEl);
  banner.appendChild(actions);

  shadow.appendChild(style);
  shadow.appendChild(banner);

  document.documentElement.appendChild(host);
}

// Guard against duplicate injection
if (!window.__urlConverterLoaded) {
  window.__urlConverterLoaded = true;
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SHOW_SUGGESTION') {
      createBanner(message.newUrl, message.sourceHost, message.targetHost);
    }
  });
}
