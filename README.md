# Kisan Vyapar Portal (किसान व्यापार पोर्टल)

A production-grade, direct farm-to-buyer digital agricultural marketplace connecting Indian farmers with wholesale and retail buyers.

Built following the specification defined in [Kisan_Vyapar_Portal_Master_Prompt.pdf](file:///c:/Users/Dell/Desktop/kisan%20vyapar%20portal/Kisan_Vyapar_Portal_Master_Prompt.pdf).

---

## 🛠️ Technology Stack
- **Framework:** Next.js 14 (App Router) & TypeScript
- **Styling:** Tailwind CSS with Botanical Agricultural Design Tokens (`#FAFCFA`, `#2D7A46`, `#6FBF78`, `#B7791F`)
- **Animation & Transitions:** Framer Motion (Tactile springs, floating carts, page transitions)
- **Database & Auth:** Supabase (Auth, PostgreSQL with 18 tables, Storage Buckets, Triggers & RLS)
- **Payments:** Razorpay Escrow (Cards, UPI, NetBanking) & Cash on Delivery (COD) / Farm Inspection
- **Microclimate & Advisories:** 5-Day Agricultural Weather & Spray Window Hub

---

## 📂 Key Directory Layout
```
├── app/
│   ├── layout.tsx                # Root layout with Google Fonts, Providers & Modals
│   ├── page.tsx                  # Animated Homepage with Word Reveal & Mandi Teasers
│   ├── crops/
│   │   ├── page.tsx              # PLP with multi-filter sidebar & sorting
│   │   └── [slug]/page.tsx       # PDP with 5-image gallery, tabs & MOQ constraints
│   ├── checkout/page.tsx         # Multi-step checkout (COD & Razorpay)
│   ├── orders/[orderNumber]/     # Order confirmation & animated SVG timeline
│   ├── farmer/                   # Farmer Workspace & Order Acceptance Queue
│   │   └── listings/new/page.tsx # 5-step Crop Listing Wizard
│   ├── account/page.tsx          # Buyer Account with order history & saved addresses
│   ├── weather/page.tsx          # Agricultural weather & spraying guidance hub
│   ├── resources/page.tsx        # Agronomy Resource Knowledge Base
│   ├── community/page.tsx        # Kisan Chopal Discussion Forum
│   └── admin/page.tsx            # Admin Console with GMV charts & Listing Moderation
├── components/
│   ├── ui/                       # Button, Input, Modal, Toast, Skeleton, Badge
│   └── marketplace/              # Header, Footer, CropCard, CartDrawer, WeatherWidget, RoleModal
├── context/
│   ├── RoleContext.tsx           # Role state with first-visit modal trigger
│   └── CartContext.tsx           # Cart state with stock & MOQ constraint validation
├── lib/
│   ├── mock-data.ts              # Authentic Indian agricultural crops & categories
│   ├── utils.ts                  # Currency formatting (INR), freshness calculation
│   └── supabase/                 # Browser & Server SSR clients
└── supabase/migrations/          # Full PostgreSQL schema with 18 tables & RLS
```

---

## 🚀 Getting Started

### 1. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Supabase credentials and Razorpay / OpenWeather keys.

### 2. Run the Local Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Apply Supabase Database Schema
Run the migration file located at:
`supabase/migrations/20260925_kisan_vyapar_init.sql` in your Supabase SQL Editor.
