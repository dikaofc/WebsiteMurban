# WebsiteMurban — Murban Migavel

> Open murban WhatsApp only — peradaban baru, suki liar. Landing page penuh untuk
> jasa **murban** (ban WhatsApp): Rp 10.000 sekali bayar, metode up tiap hari,
> tembus semua negara, full pengajaran 0–100 sampai bisa buka jasa sendiri.

Dibangun dengan **Vite** (HTML + CSS + JS vanilla, tanpa framework), bergaya
**editorial monochrome** (hitam · putih · abu-abu, tipografi serif + sans),
mendukung **dark/light mode**, dan siap deploy ke **Vercel**.

---

## ✨ Fitur

- **Hero** — judul serif besar + kartu membership monokrom (adaptif light/dark)
- **Stats band** — angka serif animasi (counter on-scroll)
- **Fitur** — 8 kartu lengkap (nokos, anti trick pasaran, anti mental, up harian, tembus semua negara, pengajaran 0–100, anti ampas, anti kebakar)
- **Cara Kerja** — 3 langkah dari join sampai buka jasa sendiri
- **Benefits** — 2 baris berselang-seling + preview foto grup private
- **Harga** — kartu tunggal **Rp 10.000** sekali bayar + tombol salin harga
- **Testimoni** — carousel (auto-play, dots, prev/next)
- **FAQ** — accordion 7 pertanyaan
- **CTA + Footer** — band hitam + 4 kolom + sosmed
- **Halaman `/developer`** — profil developer (DikaCode) + tim + poster jasa
- **Dark/Light mode** — toggle, tersimpan di `localStorage`, mengikuti OS
- **Header hide-on-scroll** — muncul lagi saat scroll ke atas
- **Reveal on scroll**, back-to-top, FAB chat Telegram, aksesibilitas (skip-link, aria, focus-visible)

## 🗺️ Halaman (clean URL)

| URL | Halaman |
|---|---|
| `/` | Beranda — landing page lengkap (semua section) |
| `/fitur` | Detail fitur |
| `/benefits` | Kenapa kami / benefits |
| `/harga` | Harga join |
| `/cara` | Cara kerja |
| `/testimoni` | Testimoni member |
| `/faq` | FAQ |
| `/developer` | Profil developer |

Semua halaman memakai `/path` bersih (tanpa `.html`) — di dev server lewat
plugin Vite, di produksi lewat rewrite `vercel.json`.

## 🛠️ Tech Stack

- **Vite** 6 — build tool & dev server (HMR)
- **HTML5** semantik + **CSS3** (custom properties, grid, flexbox)
- **Vanilla JS** (ES module, tanpa dependency runtime)
- **Font**: system stack (`Segoe UI` → SF Pro, Roboto) + **Georgia serif** untuk headline — nol request font eksternal
- **Ikon**: SVG stroke inline (`currentColor`)

## 🎨 Design System

Editorial monochrome — flat, hairline-driven, tanpa aksen warna:

- **Warna**: hitam `#0A0A0A` · putih `#FFFFFF` · abu netral; light & dark theme
  lewat custom properties di `:root` / `[data-theme="dark"]` (`src/style.css`)
- **Tipografi**: headline serif (Georgia), body sans; eyebrow & tombol uppercase
  dengan letter-spacing lebar
- **Bentuk**: radius minimal (2–6px), kartu flat dengan hairline 1px, band
  hitam untuk stats/CTA/footer, band putih inversi di dark mode

## 🚀 Setup & Run

```bash
npm install        # install dependencies (sekali saja)
npm run dev        # dev server + HMR → http://localhost:5173
npm run build      # build produksi ke dist/
npm run preview    # preview hasil build secara lokal
```

## ☁️ Deploy ke Vercel

Proyek sudah berisi `vercel.json` (framework `vite`, output `dist`), jadi
Vercel auto-detect. Dua cara:

**Lewat CLI:**

```bash
npm i -g vercel
vercel            # preview deploy
vercel --prod     # production deploy
```

**Lewat GitHub (disarankan):**

1. Push repo ini ke GitHub (public/private bebas)
2. Buka https://vercel.com/new → import repo
3. Vercel otomatis mendeteksi Vite: build `npm run build`, output `dist`

> ⚠️ **Sebelum publish**: ganti `og:url` / `og:image` / `canonical` di
> `<head>` semua halaman (masih mengarah ke `https://obitoglory.tech`) ke
> domain Vercel/GitHub Pages Anda.

## 📁 Struktur Proyek

```
├── index.html          # Halaman utama (semua konten + meta OG + JSON-LD)
├── fitur.html          # Halaman section (detail per topik)
├── benefits.html
├── harga.html
├── cara.html
├── testimoni.html
├── faq.html
├── developer.html      # Halaman profil developer
├── src/
│   ├── style.css       # Design system editorial monochrome (light + dark)
│   ├── developer.css   # Style khusus halaman /developer
│   └── main.js         # Theme, menu, hide-on-scroll, reveal, stats,
│                       #   copy harga, carousel testimoni
├── public/
│   └── assets/         # favicon.svg + og-image.png + preview-grup.png
├── vercel.json         # Deploy config (vite, output dist, rewrites /path)
├── vite.config.js      # Multi-page input + clean URL di dev
└── package.json        # Scripts: dev / build / preview
```

## ✏️ Kustomisasi

- **Harga**: cari `Rp 10.000` / section `Harga` di `index.html` (dan
  `harga.html`) — satu kartu, sekali bayar, tanpa biaya bulanan.
- **Kontak**: semua CTA & FAB mengarah ke `https://t.me/nawazh`. Ganti di
  semua file `.html` jika handle berubah.
- **Sosmed footer**: Instagram `@xxcdicka`, YouTube `@obitotenzu`, TikTok
  `@dikasecx` (di tiap halaman, blok `.footer-social`).
- **Tema warna**: edit design tokens di `src/style.css` (`:root` untuk light,
  `[data-theme="dark"]` untuk dark).
- **Testimoni**: isi carousel di `index.html` / `testimoni.html` (masih
  placeholder).
- **Foto**: `public/assets/` — `og-image.png` (hero & social preview),
  `preview-grup.png` (benefits), `favicon.svg`.

## 👨‍💻 Developer

Dibuat oleh **DikaCode** — developer web & digital creator.

- **Halaman profil**: https://github.com/dikaofc/WebsiteMurban → buka `/developer` setelah deploy, atau lokal: `http://localhost:5173/developer`
- **Skills**: Frontend (HTML/CSS/JS · Vite), UI/UX, Landing Page, Automation
- **Kontak**:
  - Telegram: [@nawazh](https://t.me/nawazh)
  - Instagram: [@xxcdicka](https://instagram.com/xxcdicka)
  - YouTube: [@obitotenzu](https://youtube.com/@obitotenzu)
  - TikTok: [@dikasecx](https://tiktok.com/@dikasecx)

---

© 2025 Murban Migavel. All rights reserved.
