async function getRules() {
  const result = await chrome.storage.local.get('rules');
  return Array.isArray(result.rules) ? result.rules : [];
}

function findMatchingRule(url, rules) {
  try {
    const urlObj = new URL(url);
    return rules.find(rule => urlObj.hostname === rule.sourceHost) ?? null;
  } catch {
    return null;
  }
}

function buildNewUrl(originalUrl, rule) {
  try {
    const urlObj = new URL(originalUrl);
    if (urlObj.hostname !== rule.sourceHost) return null;
    urlObj.hostname = rule.targetHost;
    return urlObj.toString();
  } catch {
    return null;
  }
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete' || !tab.url) return;

  if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://')) return;

  const rules = await getRules();
  const matched = findMatchingRule(tab.url, rules);
  if (!matched) return;

  const newUrl = buildNewUrl(tab.url, matched);
  if (!newUrl || newUrl === tab.url) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });
    await chrome.tabs.sendMessage(tabId, {
      type: 'SHOW_SUGGESTION',
      newUrl,
      sourceHost: matched.sourceHost,
      targetHost: matched.targetHost,
    });
  } catch {
    // Tab may have navigated away or been closed before injection completed
  }
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'REWRITE_URL' && sender.tab?.id != null) {
    const url = message.url;
    if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
      chrome.tabs.update(sender.tab.id, { url });
    }
  }
});
