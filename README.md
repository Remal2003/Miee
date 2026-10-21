# Miee — متجر الأزياء النسائية (Miee Fashion Store)

تمت إعادة بناء هذا الموقع بالكامل باستخدام أحدث تقنيات الويب مع الحفاظ الدقيق على التصميم الأصلي (1:1 Design Fidelity)، مع دعم متعدد اللغات (العربية، الإنجليزية، الفرنسية)، سلة مشتريات ديناميكية، وحساب أسعار الشحن لكافة الـ 58 ولاية جزائرية.

---

## 🛠 التقنيات المستخدمة (Tech Stack)

- **Frontend**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool & Bundler**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Backend / API Server**: [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) (TypeScript via `tsx`)

---

## 🚀 طريقة التشغيل (Quick Start)

### 1. تشغيل بيئة التطوير (Development Mode)
يقوم هذا الأمر بتشغيل كل من سيرفر الـ API (Express على المنفذ 5000) وواجهة المستخدم (Vite على المنفذ 3000) بالتوازي:
```bash
npm run dev
```
- واجهة المتجر: `http://localhost:3000`
- الـ API: `http://localhost:5000/api`

### 2. البناء للإنتاج (Production Build)
```bash
npm run build
```

### 3. تشغيل خادم الإنتاج (Start Production Server)
```bash
npm start
```

---

## 📁 هيكلية المشروع (Project Architecture)

```
├── server/
│   ├── index.ts             # Express server entry point
│   ├── routes.ts            # API routes (/api/products, /api/wilayas, /api/orders)
│   ├── data.ts              # Data models and 58 Algerian wilayas shipping rules
│   └── tsconfig.json        # Server TypeScript configuration
├── src/
│   ├── components/
│   │   ├── Header.tsx       # Sticky brand header & language switcher
│   │   ├── Ticker.tsx       # Top announcement marquee bar
│   │   ├── Hero.tsx         # Split hero typography & photography banner
│   │   ├── Collections.tsx  # Editorial categories grid
│   │   ├── Products.tsx     # Filterable products catalogue with quick add & like button
│   │   ├── Manifesto.tsx    # Philosophy section with moss-green palette
│   │   ├── Reviews.tsx      # Customer reviews track
│   │   ├── Newsletter.tsx   # Newsletter subscription box
│   │   ├── Footer.tsx       # Minimalist brand footer
│   │   ├── SideMenu.tsx     # Framer Motion animated drawer menu
│   │   ├── CartView.tsx     # Full checkout & shopping bag with 58 wilayas pricing
│   │   ├── SuccessModal.tsx # Animated concentric orbit rings order confirmation
│   │   └── Toast.tsx        # Framer Motion animated toasts
│   ├── context/
│   │   ├── LanguageContext.tsx # AR / EN / FR multilingual & RTL/LTR context
│   │   └── CartContext.tsx     # Shopping cart state management & LocalStorage sync
│   ├── data/
│   │   ├── products.ts      # Product list
│   │   └── wilayas.ts       # 58 Wilayas with home & office rates
│   ├── translations.ts      # Dictionary for Arabic, English, and French
│   ├── types.ts             # TypeScript interfaces
│   ├── index.css            # Tailwind base + custom typography & animations
│   ├── App.tsx              # Root React component
│   └── main.tsx             # Entry point
├── public/                  # Static assets & brand logos
└── _legacy_static_backup/   # Backup of the original HTML/CSS/JS files
```
