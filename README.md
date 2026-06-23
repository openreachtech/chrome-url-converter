# ORT URL Converter

A Chrome extension that suggests URL domain rewrites based on user-defined rules.

When you visit a URL matching a registered source domain, a banner appears at the top of the page. Click **Rewrite URL** to reload with the target domain — path, query, and hash are preserved exactly.

---

## Features

- Register any number of source → target domain pairs
- Banner appears only when a match is found (no background noise)
- One click to rewrite; one click to dismiss
- All rules stored locally — no data leaves your device

---

## Installation

### From Chrome Web Store (recommended)

> Private release — install via the link shared by your administrator.

### Developer mode (local)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select this folder
5. The extension icon appears in the Chrome toolbar

To regenerate icons after modifying `generate-icons.js`:

```bash
node generate-icons.js
```

---

## Usage

1. Click the extension icon in the toolbar to open the popup
2. Enter a **Source Domain** (e.g. `staging.example.com`)
3. Enter a **Target Domain** (e.g. `production.example.com`)
4. Click **Add**
5. Navigate to any URL on the source domain — a banner will appear
6. Click **Rewrite URL** to switch domains, or **✕** to dismiss

Rules can be deleted at any time from the popup.

---

## File Structure

```
chrome-url-converter/
├── manifest.json        # Extension manifest (MV3)
├── background.js        # Service worker — tab monitoring & URL rewriting
├── content.js           # Suggestion banner (Shadow DOM isolated)
├── popup.html           # Extension popup UI
├── popup.js             # Popup logic & rule management
├── popup.css            # Popup styles
├── generate-icons.js    # Icon generation script (requires `canvas` package)
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── PRIVACY_POLICY.md
└── PUBLISH.md           # Publishing guide
```

---

## Permissions

| Permission | Purpose |
|---|---|
| `tabs` | Detect when the active tab URL matches a registered rule |
| `storage` | Save user-defined rules to local browser storage |
| `scripting` | Inject the suggestion banner into matching pages |
| `<all_urls>` | Required because rules can target any user-defined domain |

No data is sent to any external server. See [PRIVACY_POLICY.md](PRIVACY_POLICY.md).

---

## Development

```bash
# Install dependencies (icon generation only)
npm install

# Regenerate icons
node generate-icons.js

# Package for Chrome Web Store submission
zip -r ../url-domain-converter.zip \
  manifest.json background.js content.js \
  popup.html popup.js popup.css \
  icons/
```

See [PUBLISH.md](PUBLISH.md) for the full publishing guide.

---

## License

ISC
