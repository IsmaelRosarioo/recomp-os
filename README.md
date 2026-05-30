# Recomp OS 2.0 — Ismael Physique Operating System

## 🚀 Live Deployment
**Current Version**: https://recomp-os-eta.vercel.app

## 📋 Project Overview

Recomp OS 2.0 is a comprehensive physique optimization tracking system designed for bodybuilding cycles, PCT, and health monitoring. Built with React and deployed on Vercel.

## ✅ Current Features (v2.0)

### Core Functionality
- **Dashboard**: Mission statement, body comp stats, target scenarios
- **Today Tab**: Daily tracking for injections, meals, training, supplements, skin care
- **Protocol Timeline**: Cycle and PCT date management
- **Stack Overview**: Compound roles and dosing information
- **Training System**: Weekly split planning
- **Nutrition Engine**: Macro calculator with visual wheel
- **Forecast**: Progress scenarios
- **Labs**: Bloodwork marker tracking
- **Checklist**: Pre-cycle preparation

### Current Protocol
- Test E: 200mg/week (daily pinning)
- Primobolone: 200mg/week
- HGH: 4 IU daily
- Glow Stack: 20 units daily
- hCG: 500 IU 3x/week
- Arimidex: As needed (monitor E2)
- Dutasteride: 6-7mg/week
- Minoxidil: 5-6mg daily (oral + topical 2x daily)

## 🔥 PRO Version Features (In Development)

The `index-pro.html` file will include all advanced features:

### 1. 🧪 Labs Tab (Rythmn Health Integration)
- Import bloodwork from Rythmn Health tests
- Track Total T, Free T, Estradiol, SHBG
- Monitor CBC, hematocrit, liver/kidney function
- Lipid panel and glucose markers
- IGF-1 for HGH context
- Thyroid panel (TSH, Free T3/T4)
- Visual charts showing trends over time

### 2. 📅 Calendar & Schedule View  
- Visual calendar showing injection days
- Color-coded by compound (Test E, HGH, hCG, Primo)
- Weekly overview with reminders
- Integration with protocol timeline
- Export to .ics for phone calendar

### 3. 📸 Progress Photos
- Upload front/side/back photos
- Base64 encoding for localStorage
- Date-stamped comparisons
- Side-by-side before/after views
- Export photo timeline

### 4. 🧮 Dosage Calculator
- Test E daily split calculator (200mg/week → ~28.5mg/day)
- HGH IU to mg converter
- Peptide reconstitution calculator
- AI dosing recommendations based on E2 levels

### 5. 💊 E2 Symptom Tracker
- High E2 symptoms checklist (bloat, sensitive nipples, mood swings)
- Low E2 symptoms checklist (joint pain, low libido, dry skin)
- Arimidex response logging
- Recommendation engine for adjustments

### 6. 💇 Hair Health Metrics
- Daily hair shedding count
- Scalp density photos
- Dutasteride/Minoxidil effectiveness tracking
- Side effect monitoring

### 7. ☁️ Cloud Sync
- localStorage + IndexedDB for local storage
- Optional cloud backup to external API
- Cross-device synchronization
- Export/import functionality

### 8. 📊 CSV Export
- Export daily logs to CSV
- Export bloodwork history
- Export all data for analysis in Excel/Google Sheets

### 9. 🔔 Browser Notifications
- Daily injection reminders
- Supplement timing alerts
- Bloodwork scheduling reminders
- Customizable notification times

### 10. 📱 Mobile Optimization
- Fully responsive design
- Touch-optimized UI
- PWA capabilities
- Offline functionality

## 🛠️ Tech Stack

- **Frontend**: React 18 (CDN)
- **Styling**: Inline CSS with custom design system
- **Storage**: localStorage + IndexedDB (Pro)
- **Deployment**: Vercel
- **Version Control**: GitHub

## 🎨 Design System

### Color Palette
```javascript
C = {
  bg: "#080C10",          // Background
  panel: "#0D1117",        // Card background  
  border: "#1A2332",       // Borders
  accent: "#00E5FF",       // Primary (cyan)
  accent2: "#FF6B35",      // Secondary (orange)
  accent3: "#7CFC00",      // Tertiary (lime)
  gold: "#FFD700",         // Highlights
  danger: "#FF4136",       // Critical items
  success: "#39FF14",      // Completed items
  purple: "#BF5FFF"        // Special features
}
```

## 📦 File Structure

```
recomp-os/
├── index.html         # Main production version
├── index-pro.html     # Pro version (in development)
└── README.md          # This file
```

## 🚀 Deployment

The project is automatically deployed to Vercel when changes are pushed to the `main` branch.

**Production URL**: https://recomp-os-eta.vercel.app

## 📝 Usage

1. Visit the live site
2. Navigate using the tab system
3. Set your protocol in the "Protocol" tab
4. Track daily metrics in the "Today" tab
5. Monitor progress in "Dashboard" and "Forecast"

## 🔐 Data Privacy

All data is stored locally in your browser using localStorage. No data is sent to external servers (unless you enable cloud sync in Pro version).

## 🤝 Contributing

This is a personal project for Ismael's physique journey. Suggestions welcome via GitHub issues.

## 📄 License

Personal use only.

## 🎯 Roadmap

- [x] Core tracking system
- [x] Protocol timeline
- [x] Daily logging
- [x] Updated dosing (Test E 200mg, Primo 200mg, etc.)
- [ ] Complete Pro version with all advanced features
- [ ] Mobile app version
- [ ] Integration with fitness trackers
- [ ] AI-powered recommendations

---

**Built with** ⚡ **by Ismael Rosario**

*Maximum recomp. Minimum compromise.*
