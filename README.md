# Still Becoming™ — Digital Letter Vault

> *Capture who you are today. Meet who you become tomorrow.*

A Chrome Extension that lets you write letters to your future self, seal them until a chosen date, and receive them when the time is right.

---

## ✦ Features

- **Future Letters** — Write to your future self, future partner, future child, future business self
- **Timed Vault** — Letters stay sealed until the unlock date you choose (30 days → 5 years)
- **Unlock Notifications** — Browser notification when a letter arrives
- **Daily Reflection Prompts** — Rotating prompts to spark meaningful writing
- **Growth Stats** — See how many letters you've written, sealed, and opened
- **Offline-first** — All data stored locally in your browser via `chrome.storage`

---

## 📸 Preview

| Vault | Write | Prompts |
|-------|-------|---------|
| See all your sealed and opened letters | Compose and seal a new letter | Daily prompts to inspire reflection |

---

## 🚀 Installation (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/still-becoming.git
   ```

2. Open Chrome and go to `chrome://extensions`

3. Enable **Developer mode** (toggle in the top right)

4. Click **Load unpacked** and select the cloned folder

5. The Still Becoming™ icon will appear in your Chrome toolbar

---

## 🗂 Project Structure

```
still-becoming/
├── manifest.json       # Chrome Extension Manifest V3
├── popup.html          # Main UI (400px popup)
├── popup.js            # All UI logic, storage, and state
├── background.js       # Service worker: alarms + unlock notifications
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

---

## 🛠 Tech Stack

- **Manifest V3** Chrome Extension
- **Vanilla JS** — no build step required
- **chrome.storage.local** — persistent letter storage
- **chrome.alarms** — scheduled unlock notifications
- **Google Fonts** — Cormorant Garamond + Inter
- **CSS custom properties** — fully themeable

---

## 🗺 Roadmap

- [ ] Voice letters (Web Audio API recording)
- [ ] Growth Capsules (group multiple letters + goals)
- [ ] Becoming Timeline (visual life timeline)
- [ ] PIN / vault lock screen
- [ ] Export letters as PDF
- [ ] Sync across devices (optional cloud backend)
- [ ] AI reflection summaries (Premium)
- [ ] Full web app version (React + Supabase)

---

## 💡 Brand

**Still Becoming™** is a personal growth platform centered on reflection, identity, and transformation.  
Long-term vision: a *digital archive of personal transformation* — not just a journaling app.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built by [Amiisukyok Creatives](https://payhip.com/AmiisukyokCreatives)*
