# CV Analyze (TR-ATS)

Kurumsal ve bireysel kullanıcılar için geliştirilen, CV’lerin ATS (Applicant Tracking System) uyumluluğunu analiz eden ve iş ilanı eşleşmesi çıkaran React tabanlı SPA uygulaması.

## Özellikler

- ATS uyumluluk analizi (CV format + içerik odaklı)
- İş ilanı ile CV eşleşme analizi (full mode)
- Risk tespiti ve düzeltme önerileri
- Beceri eşleşme / eksik beceri görünümü
- Rapor ekranı (KPI strip, breakdown, risks, recommendations)
- PDF/DOCX/TXT dosya yükleme ve metin çıkarımı
- Türkçe odaklı NLP/eşanlamlı beceri eşleme yaklaşımı

## Teknoloji Yığını

- **Frontend:** React 19, React Router DOM, Vite
- **Stil:** Vanilla CSS (token tabanlı dark theme)
- **Animasyon:** GSAP, Framer Motion (`motion`)
- **Dosya İşleme:** `pdfjs-dist`, `mammoth`
- **Export/Render Yardımcıları:** `jspdf`, `html2canvas`
- **İkonlar:** `lucide-react`

## Mimari Genel Bakış

Proje katmanları:

- `src/pages/` → Sayfa bileşenleri (`HomePage`, `AnalyzePage`, `ResultsPage`)
- `src/components/` → Tekrarlı UI parçaları (navbar, upload, vb.)
- `src/context/AnalysisContext.jsx` → Analiz akışı ve UI state yönetimi
- `src/services/` → Analiz/scoring/matching mantığı (iş kuralları)
- `src/styles/` → Tasarım token’ları ve global stil katmanları

Not: İş mantığı `src/services` ve `src/context` altında ayrıştırılmıştır. UI refactor çalışmaları bu katmanlara dokunmadan yalnızca görünüm tarafında yapılabilir.

## Kurulum

Gereksinimler:

- Node.js 18+
- npm 9+

Adımlar:

```bash
npm install
npm run dev
```

Uygulama varsayılan olarak Vite local server ile açılır.

## Komutlar

```bash
# Geliştirme
npm run dev

# Production build
npm run build

# Build preview
npm run preview

# Lint
npm run lint
```

## Kullanım Akışı

1. **Analyze** sayfasına gidin.
2. CV dosyasını yükleyin veya metin yapıştırın.
3. Mod seçin:
	 - **Sadece ATS Analizi**
	 - **İlan Eşleşmesi**
4. Analizi başlatın.
5. **Results** sayfasında KPI, breakdown, risk ve önerileri inceleyin.

## Proje Yapısı

```text
src/
	components/
	context/
	pages/
	services/
	styles/
	App.jsx
	main.jsx
```

## Tasarım Sistemi

- Dark mode token’ları: `src/styles/tokens.css`
- Global katmanlar: `base.css`, `layout.css`, `components.css`, `utilities.css`
- Enterprise odaklı sade rapor görünümü, düşük görsel gürültü, yüksek okunabilirlik

## Dağıtım

Production build:

```bash
npm run build
```

Build çıktısı `dist/` klasörüne alınır.

## Lisans

Bu proje özel kullanım / portföy amaçlı hazırlanmıştır. Lisans ihtiyacına göre güncellenebilir.
