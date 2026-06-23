// Hostname validation per RFC 1123 — no protocol, path, or port allowed
const HOSTNAME_RE = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

function isValidHostname(value) {
  const v = value.trim();
  if (!v || v.length > 253) return false;
  return HOSTNAME_RE.test(v);
}

async function loadRules() {
  const result = await chrome.storage.local.get('rules');
  return Array.isArray(result.rules) ? result.rules : [];
}

async function saveRules(rules) {
  await chrome.storage.local.set({ rules });
}

function renderRules(rules) {
  const list = document.getElementById('rules-list');
  const emptyMsg = document.getElementById('empty-message');

  // Remove existing rule items before re-rendering
  list.querySelectorAll('.rule-item').forEach(el => el.remove());

  if (rules.length === 0) {
    emptyMsg.hidden = false;
    return;
  }
  emptyMsg.hidden = true;

  rules.forEach((rule, index) => {
    const item = document.createElement('div');
    item.className = 'rule-item';

    const hosts = document.createElement('div');
    hosts.className = 'rule-hosts';

    const src = document.createElement('span');
    src.className = 'rule-host';
    src.title = rule.sourceHost;
    src.textContent = rule.sourceHost;

    const arrow = document.createElement('span');
    arrow.className = 'rule-arrow';
    arrow.textContent = '→';

    const tgt = document.createElement('span');
    tgt.className = 'rule-host';
    tgt.title = rule.targetHost;
    tgt.textContent = rule.targetHost;

    hosts.appendChild(src);
    hosts.appendChild(arrow);
    hosts.appendChild(tgt);

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-delete';
    delBtn.setAttribute('aria-label', `Delete rule: ${rule.sourceHost} → ${rule.targetHost}`);
    delBtn.textContent = '✕';
    delBtn.addEventListener('click', async () => {
      const current = await loadRules();
      const updated = current.filter((_, i) => i !== index);
      await saveRules(updated);
      renderRules(updated);
    });

    item.appendChild(hosts);
    item.appendChild(delBtn);
    list.appendChild(item);
  });
}

function showError(message) {
  const el = document.getElementById('error-message');
  el.textContent = message;
  el.hidden = false;
}

function clearError() {
  const el = document.getElementById('error-message');
  el.textContent = '';
  el.hidden = true;
}

document.getElementById('add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const sourceInput = document.getElementById('source-host');
  const targetInput = document.getElementById('target-host');
  const sourceHost = sourceInput.value.trim().toLowerCase();
  const targetHost = targetInput.value.trim().toLowerCase();

  sourceInput.classList.remove('invalid');
  targetInput.classList.remove('invalid');

  if (!isValidHostname(sourceHost)) {
    sourceInput.classList.add('invalid');
    showError('Invalid source domain. Enter a hostname only (e.g. example.com).');
    sourceInput.focus();
    return;
  }

  if (!isValidHostname(targetHost)) {
    targetInput.classList.add('invalid');
    showError('Invalid target domain. Enter a hostname only (e.g. example.com).');
    targetInput.focus();
    return;
  }

  if (sourceHost === targetHost) {
    showError('Source and target domains must be different.');
    return;
  }

  const rules = await loadRules();

  const duplicate = rules.some(r => r.sourceHost === sourceHost);
  if (duplicate) {
    showError(`A rule for "${sourceHost}" already exists.`);
    return;
  }

  const MAX_RULES = 100;
  if (rules.length >= MAX_RULES) {
    showError(`You can register up to ${MAX_RULES} rules.`);
    return;
  }

  rules.push({ sourceHost, targetHost });
  await saveRules(rules);
  renderRules(rules);

  sourceInput.value = '';
  targetInput.value = '';
  sourceInput.focus();
});

// Initial render
(async () => {
  const rules = await loadRules();
  renderRules(rules);
})();
