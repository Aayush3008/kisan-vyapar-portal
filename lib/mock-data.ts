const SB = 'https://rafxxtiuagdmvvkoauuw.supabase.co/storage/v1/object/public';

export const MOCK_CROPS = [
  {
    id: "crop-1", farmer_id: "farmer-1", farmer_name: "Rameshwar Patel", farm_name: "Patel Organic Agro Farms",
    farmer_rating: 4.9, farmer_verified: true, category_id: "cat-grains", category_name: "Grains & Cereals",
    title: "Premium Sharbati Wheat (Sehore Golden Grain)", slug: "premium-sharbati-wheat-sehore",
    variety: "Sharbati C-306", grade: "Grade A" as const,
    description: "Naturally sweet, golden-amber whole grain wheat cultivated in fertile black loamy soil of Sehore, MP. Multi-stage air classified, zero adulteration.",
    unit: "quintal" as const, price_per_unit: 3450, market_price_per_unit: 3600, distance_km: 18,
    min_order_quantity: 2, stock_quantity: 120, reserved_quantity: 8,
    harvest_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Sehore", state: "Madhya Pradesh", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 140, status: "active" as const,
    primary_image: `${SB}/crop-images/wheat-main.jpg`,
    images: [`${SB}/crop-images/wheat-main.jpg`, `${SB}/crop-images/wheat-alt1.jpg`, `${SB}/crop-images/wheat-alt2.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-2", farmer_id: "farmer-2", farmer_name: "Gurpreet Singh Dhillon", farm_name: "Dhillon Agro Greenacres",
    farmer_rating: 4.8, farmer_verified: true, category_id: "cat-grains", category_name: "Grains & Cereals",
    title: "Authentic 1121 Traditional Basmati Paddy", slug: "traditional-1121-basmati-paddy",
    variety: "Pusa Basmati 1121", grade: "Grade A" as const,
    description: "Extra long grain basmati rice paddy freshly harvested from Karnal. Elongation ratio 2.5x, low moisture content (<12%).",
    unit: "quintal" as const, price_per_unit: 4200, market_price_per_unit: 4450, distance_km: 42,
    min_order_quantity: 5, stock_quantity: 240, reserved_quantity: 20,
    harvest_date: new Date().toISOString().split('T')[0],
    district: "Karnal", state: "Haryana", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 180, status: "active" as const,
    primary_image: `${SB}/crop-images/tomato-main.jpg`,
    images: [`${SB}/crop-images/tomato-main.jpg`, `${SB}/crop-images/tomato-alt1.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-3", farmer_id: "farmer-3", farmer_name: "Anand Jagtap", farm_name: "Sahyadri Bio-Produce",
    farmer_rating: 4.95, farmer_verified: true, category_id: "cat-fruits", category_name: "Fresh Fruits",
    title: "GI-Tagged Devgad Alphonso Mangoes", slug: "devgad-alphonso-mangoes-grade-a",
    variety: "Hapus / Alphonso", grade: "Organic Certified" as const,
    description: "Direct tree-ripened royal Alphonso mangoes from Devgad coastal red laterite soil. Zero carbide, 100% natural hay ripening.",
    unit: "crate" as const, price_per_unit: 1850, market_price_per_unit: 2100, distance_km: 12,
    min_order_quantity: 1, stock_quantity: 45, reserved_quantity: 3,
    harvest_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Sindhudurg", state: "Maharashtra", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 95, status: "active" as const,
    primary_image: `${SB}/crop-images/onion-main.jpg`,
    images: [`${SB}/crop-images/onion-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-4", farmer_id: "farmer-4", farmer_name: "Suresh Chandra Verma", farm_name: "Awadh Natural Farms",
    farmer_rating: 4.7, farmer_verified: true, category_id: "cat-pulses", category_name: "Pulses & Legumes",
    title: "Unpolished Desi Chana (Bengal Gram)", slug: "unpolished-desi-chana-bengal-gram",
    variety: "Desi Brown Chana", grade: "Grade A" as const,
    description: "Stone-sorted, unpolished desi chickpeas rich in protein and iron. Zero chemical polish, sun-dried to 9% optimum moisture.",
    unit: "quintal" as const, price_per_unit: 5800, market_price_per_unit: 6150, distance_km: 35,
    min_order_quantity: 1, stock_quantity: 85, reserved_quantity: 0,
    harvest_date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Barabanki", state: "Uttar Pradesh", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 150, status: "active" as const,
    primary_image: `${SB}/crop-images/soybean-main.jpg`,
    images: [`${SB}/crop-images/soybean-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-5", farmer_id: "farmer-5", farmer_name: "Mahadev Koli", farm_name: "Nashik Valley Orchards",
    farmer_rating: 4.85, farmer_verified: true, category_id: "cat-vegetables", category_name: "Vegetables",
    title: "Export Quality Nashik Red Onions (Garwa Variety)", slug: "nashik-red-onions-garwa",
    variety: "Garwa / Gavran Red", grade: "Grade A" as const,
    description: "Firm, thick-skinned winter onions with robust shelf life up to 4 months. Hand-graded 45–60mm diameter.",
    unit: "quintal" as const, price_per_unit: 2650, market_price_per_unit: 2850, distance_km: 8,
    min_order_quantity: 3, stock_quantity: 320, reserved_quantity: 15,
    harvest_date: new Date().toISOString().split('T')[0],
    district: "Nashik", state: "Maharashtra", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 120, status: "active" as const,
    primary_image: `${SB}/crop-images/chilli-main.jpg`,
    images: [`${SB}/crop-images/chilli-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-6", farmer_id: "farmer-6", farmer_name: "Venkateswara Rao", farm_name: "Krishna Delta Chilli Estate",
    farmer_rating: 4.9, farmer_verified: true, category_id: "cat-spices", category_name: "Spices",
    title: "Teja Guntur Red Chillies (Stemless Sun-Dried)", slug: "guntur-teja-red-chillies-stemless",
    variety: "Guntur S17 Teja", grade: "Grade A" as const,
    description: "High pungency (SHU 75,000+), vibrant deep red ASTA 90+. Stemless, vacuum packaged for export and spice production.",
    unit: "quintal" as const, price_per_unit: 19800, market_price_per_unit: 20500, distance_km: 26,
    min_order_quantity: 1, stock_quantity: 60, reserved_quantity: 4,
    harvest_date: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Guntur", state: "Andhra Pradesh", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 250, status: "active" as const,
    primary_image: `${SB}/crop-images/spice-main.jpg`,
    images: [`${SB}/crop-images/spice-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-7", farmer_id: "farmer-7", farmer_name: "Krishnamurthy Reddy", farm_name: "Reddy Organics Kurnool",
    farmer_rating: 4.75, farmer_verified: true, category_id: "cat-oilseeds", category_name: "Oilseeds",
    title: "Cold-Pressed Groundnut (Peanut) Grade Premium", slug: "groundnut-cold-pressed-kurnool",
    variety: "Java Bold", grade: "Grade A" as const,
    description: "Bold, shiny groundnut kernels with 50%+ oil content. Machine-cleaned, moisture checked <9%, aflatoxin tested.",
    unit: "quintal" as const, price_per_unit: 6200, market_price_per_unit: 6500, distance_km: 31,
    min_order_quantity: 2, stock_quantity: 95, reserved_quantity: 5,
    harvest_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Kurnool", state: "Andhra Pradesh", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 190, status: "active" as const,
    primary_image: `${SB}/crop-images/oilseed-main.jpg`,
    images: [`${SB}/crop-images/oilseed-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-8", farmer_id: "farmer-8", farmer_name: "Lalita Devi Sharma", farm_name: "Sharma Organic Fields",
    farmer_rating: 4.88, farmer_verified: true, category_id: "cat-organic", category_name: "Organic Produce",
    title: "Certified Organic Turmeric Fingers (Lakadong Variety)", slug: "organic-turmeric-lakadong",
    variety: "Lakadong / Meghalaya GI", grade: "Organic Certified" as const,
    description: "High curcumin content (7.5%+). Sun-dried, polished without chemical glazing. APEDA export grade with NPOP certification.",
    unit: "kg" as const, price_per_unit: 180, market_price_per_unit: 210, distance_km: 22,
    min_order_quantity: 10, stock_quantity: 400, reserved_quantity: 60,
    harvest_date: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Erode", state: "Tamil Nadu", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 12, status: "active" as const,
    primary_image: `${SB}/crop-images/organic-main.jpg`,
    images: [`${SB}/crop-images/organic-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-9", farmer_id: "farmer-2", farmer_name: "Gurpreet Singh Dhillon", farm_name: "Dhillon Agro Greenacres",
    farmer_rating: 4.8, farmer_verified: true, category_id: "cat-vegetables", category_name: "Vegetables",
    title: "Cherry Tomatoes — Greenhouse Grown (Precision Irrigation)", slug: "cherry-tomatoes-greenhouse-karnal",
    variety: "Roma / Cherry F1 Hybrid", grade: "Grade A" as const,
    description: "Sweet, brix 8.5+ cherry tomatoes from poly-house drip irrigation. Uniform size 20–25mm, 12-day shelf life guaranteed.",
    unit: "crate" as const, price_per_unit: 680, market_price_per_unit: 780, distance_km: 15,
    min_order_quantity: 5, stock_quantity: 180, reserved_quantity: 22,
    harvest_date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Karnal", state: "Haryana", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 60, status: "active" as const,
    primary_image: `${SB}/crop-images/vegetable-main.jpg`,
    images: [`${SB}/crop-images/vegetable-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-10", farmer_id: "farmer-5", farmer_name: "Mahadev Koli", farm_name: "Nashik Valley Orchards",
    farmer_rating: 4.85, farmer_verified: true, category_id: "cat-fruits", category_name: "Fresh Fruits",
    title: "Thompson Seedless Grapes — Table Variety Export", slug: "thompson-seedless-grapes-nashik",
    variety: "Thompson Seedless / Dilkush", grade: "Grade A" as const,
    description: "Crisp, elongated berries with golden-green blush. Brix 18+. Pre-cooled at 2°C within 4h of harvest for maximum freshness.",
    unit: "crate" as const, price_per_unit: 920, market_price_per_unit: 1050, distance_km: 9,
    min_order_quantity: 10, stock_quantity: 200, reserved_quantity: 35,
    harvest_date: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Nashik", state: "Maharashtra", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 75, status: "active" as const,
    primary_image: `${SB}/crop-images/fruit-main.jpg`,
    images: [`${SB}/crop-images/fruit-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-11", farmer_id: "farmer-1", farmer_name: "Rameshwar Patel", farm_name: "Patel Organic Agro Farms",
    farmer_rating: 4.9, farmer_verified: true, category_id: "cat-pulses", category_name: "Pulses & Legumes",
    title: "Organic Black Urad Dal (Whole Split-Free)", slug: "organic-black-urad-dal-sehore",
    variety: "Desi Black Urad", grade: "Organic Certified" as const,
    description: "Rich protein urad dal, whole & split-free. Zero fungicide application. Ferments ideally for idli/dosa batter. NPOP certified.",
    unit: "quintal" as const, price_per_unit: 8200, market_price_per_unit: 8800, distance_km: 20,
    min_order_quantity: 1, stock_quantity: 55, reserved_quantity: 7,
    harvest_date: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Sehore", state: "Madhya Pradesh", pickup_available: true, delivery_available: false,
    delivery_fee_per_unit: 0, status: "active" as const,
    primary_image: `${SB}/crop-images/soybean-main.jpg`,
    images: [`${SB}/crop-images/soybean-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-12", farmer_id: "farmer-6", farmer_name: "Venkateswara Rao", farm_name: "Krishna Delta Chilli Estate",
    farmer_rating: 4.9, farmer_verified: true, category_id: "cat-spices", category_name: "Spices",
    title: "Byadgi Chilli — Karnataka Sweet Deep-Red", slug: "byadgi-chilli-karnataka-deep-red",
    variety: "Byadgi Dabbi / Kaddi", grade: "Grade A" as const,
    description: "World-famous low-heat, deep crimson Byadgi chilli. ASTA colour value 100+. Used for restaurant-grade masalas and food colouring.",
    unit: "quintal" as const, price_per_unit: 24000, market_price_per_unit: 26000, distance_km: 38,
    min_order_quantity: 1, stock_quantity: 40, reserved_quantity: 10,
    harvest_date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Haveri", state: "Karnataka", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 300, status: "active" as const,
    primary_image: `${SB}/crop-images/spice-main.jpg`,
    images: [`${SB}/crop-images/spice-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-13", farmer_id: "farmer-1", farmer_name: "Chaudhary Virendra Singh", farm_name: "Meerut Ganga Valley Agro",
    farmer_rating: 4.92, farmer_verified: true, category_id: "cat-grains", category_name: "Grains & Cereals",
    title: "Co-0238 High-Brix Juicing Sugarcane (Meerut Belt)", slug: "co-0238-high-brix-sugarcane-meerut",
    variety: "Co-0238 Sugar King", grade: "Grade A" as const,
    description: "Extra-thick stalk, high sucrose recovery cane (brix 21.5°). Directly harvested from the fertile alluvial loam of Meerut basin for jaggery and fresh crushing.",
    unit: "quintal" as const, price_per_unit: 385, market_price_per_unit: 410, distance_km: 7,
    min_order_quantity: 10, stock_quantity: 650, reserved_quantity: 40,
    harvest_date: new Date().toISOString().split('T')[0],
    district: "Meerut", state: "Uttar Pradesh", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 35, status: "active" as const,
    primary_image: `${SB}/crop-images/wheat-main.jpg`,
    images: [`${SB}/crop-images/wheat-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-14", farmer_id: "farmer-4", farmer_name: "Balram Yadav", farm_name: "Braj Yellow Gold Farms",
    farmer_rating: 4.86, farmer_verified: true, category_id: "cat-oilseeds", category_name: "Oilseeds",
    title: "Pusa Bold Black Mustard (Sarson Seeds)", slug: "pusa-bold-black-mustard-seeds",
    variety: "Pusa Jai Kisan / Bold", grade: "Grade A" as const,
    description: "High oil content (42.5%), machine-screened bold black mustard seeds. Tested zero argemone adulteration, sun dried under 8% moisture.",
    unit: "quintal" as const, price_per_unit: 5650, market_price_per_unit: 5900, distance_km: 24,
    min_order_quantity: 2, stock_quantity: 110, reserved_quantity: 12,
    harvest_date: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Mathura", state: "Uttar Pradesh", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 140, status: "active" as const,
    primary_image: `${SB}/crop-images/oilseed-main.jpg`,
    images: [`${SB}/crop-images/oilseed-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-15", farmer_id: "farmer-8", farmer_name: "Tashi Wangchuk", farm_name: "Kashmir Saffron Valley Growers",
    farmer_rating: 5.0, farmer_verified: true, category_id: "cat-spices", category_name: "Spices",
    title: "GI-Certified Pure Pampore Mongra Saffron (Kesar)", slug: "gi-certified-pampore-mongra-saffron",
    variety: "Kashmiri Mongra A++", grade: "Organic Certified" as const,
    description: "Lab-tested high crocin (>240) Grade-1 Kashmiri saffron stigmas. Deep natural aroma, dark red strands with zero yellow style fibers.",
    unit: "kg" as const, price_per_unit: 185000, market_price_per_unit: 210000, distance_km: 65,
    min_order_quantity: 1, stock_quantity: 15, reserved_quantity: 2,
    harvest_date: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Pulwama", state: "Jammu & Kashmir", pickup_available: false, delivery_available: true,
    delivery_fee_per_unit: 450, status: "active" as const,
    primary_image: `${SB}/crop-images/spice-main.jpg`,
    images: [`${SB}/crop-images/spice-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-16", farmer_id: "farmer-2", farmer_name: "Kartar Singh", farm_name: "Doaba Potato Seed Estate",
    farmer_rating: 4.88, farmer_verified: true, category_id: "cat-vegetables", category_name: "Vegetables",
    title: "Kufri Chipsona Processing Potatoes (Low Sugar)", slug: "kufri-chipsona-potatoes-jalandhar",
    variety: "Kufri Chipsona-1", grade: "Grade A" as const,
    description: "High dry matter content (22%+), low reducing sugars designed specifically for crisp chips and French fry processing without browning.",
    unit: "quintal" as const, price_per_unit: 1650, market_price_per_unit: 1820, distance_km: 30,
    min_order_quantity: 10, stock_quantity: 500, reserved_quantity: 45,
    harvest_date: new Date().toISOString().split('T')[0],
    district: "Jalandhar", state: "Punjab", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 90, status: "active" as const,
    primary_image: `${SB}/crop-images/vegetable-main.jpg`,
    images: [`${SB}/crop-images/vegetable-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-17", farmer_id: "farmer-5", farmer_name: "Santosh Deshmukh", farm_name: "Marathwada Green Ginger Farm",
    farmer_rating: 4.9, farmer_verified: true, category_id: "cat-spices", category_name: "Spices",
    title: "Fresh Washed Ginger Roots (Mahim Variety)", slug: "fresh-washed-ginger-roots-mahim",
    variety: "Mahim Bold", grade: "Grade A" as const,
    description: "Plump, fibrous, low-water ginger rhizomes. Pressure-washed with mountain spring water and shade dried for maximum essential oil retention.",
    unit: "quintal" as const, price_per_unit: 8400, market_price_per_unit: 9200, distance_km: 19,
    min_order_quantity: 1, stock_quantity: 75, reserved_quantity: 6,
    harvest_date: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Satara", state: "Maharashtra", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 160, status: "active" as const,
    primary_image: `${SB}/crop-images/organic-main.jpg`,
    images: [`${SB}/crop-images/organic-main.jpg`],
    created_at: new Date().toISOString()
  },
  {
    id: "crop-18", farmer_id: "farmer-7", farmer_name: "Raghavendra Hegde", farm_name: "Malnad Spice Forest",
    farmer_rating: 4.94, farmer_verified: true, category_id: "cat-spices", category_name: "Spices",
    title: "Bold Green Cardamom (8mm+ Extra Jumbo)", slug: "bold-green-cardamom-8mm-malnad",
    variety: "Alleppey Green Extra Bold (AGEB)", grade: "Grade A" as const,
    description: "Natural jade-green whole cardamom pods, dried in wood-fired flue houses. High volatile essential oil content (8.5%).",
    unit: "kg" as const, price_per_unit: 2650, market_price_per_unit: 2900, distance_km: 45,
    min_order_quantity: 2, stock_quantity: 120, reserved_quantity: 15,
    harvest_date: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString().split('T')[0],
    district: "Idukki", state: "Kerala", pickup_available: true, delivery_available: true,
    delivery_fee_per_unit: 80, status: "active" as const,
    primary_image: `${SB}/crop-images/spice-main.jpg`,
    images: [`${SB}/crop-images/spice-main.jpg`],
    created_at: new Date().toISOString()
  },
];

export const MOCK_CATEGORIES = [
  { id: "cat-grains",     name: "Grains & Cereals",   slug: "grains-cereals",   image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80", count: "180+ Listings" },
  { id: "cat-pulses",     name: "Pulses & Legumes",   slug: "pulses-legumes",   image: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=600&q=80", count: "115 Listings" },
  { id: "cat-fruits",     name: "Fresh Fruits",        slug: "fresh-fruits",     image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80", count: "140+ Listings" },
  { id: "cat-vegetables", name: "Vegetables",          slug: "vegetables",       image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80", count: "260+ Listings" },
  { id: "cat-spices",     name: "Spices",              slug: "spices",           image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=600&q=80", count: "95 Listings" },
  { id: "cat-oilseeds",   name: "Oilseeds",            slug: "oilseeds",         image: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&w=600&q=80", count: "68 Listings" },
  { id: "cat-organic",    name: "Organic Produce",     slug: "organic-produce",  image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80", count: "110 Certified" },
];

export const MOCK_RESOURCES = [
  {
    id: "res-1", title: "Optimizing Loamy vs. Sandy Soil Fertility for High-Yield Wheat",
    slug: "soil-fertility-wheat-management", topic: "soil_types" as const, topic_label: "Soil Health & Prep",
    summary: "Discover targeted micro-nutrient balance, humic acid enrichment, and water retention techniques for North Indian soil topologies.",
    thumbnail_url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80", read_time: "6 min read", published_date: "Sep 18, 2026",
    content: "Healthy soil is the foundation of high-grade agricultural production. In loamy soils, maintaining porosity while preserving organic carbon (SOC) levels above 0.75% is vital for grain development."
  },
  {
    id: "res-2", title: "Early Warning & Organic Remediation of Yellow Rust in Basmati Paddy",
    slug: "basmati-yellow-rust-remediation", topic: "plant_diseases" as const, topic_label: "Plant Diseases",
    summary: "Recognize early foliage lesions, humidity triggers, and deploy Trichoderma viride bio-fungicides before panicle emergence.",
    thumbnail_url: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=600&q=80", read_time: "8 min read", published_date: "Sep 22, 2026",
    content: "Puccinia striiformis f. sp. tritici flourishes when night temperatures hover between 10-15°C with heavy morning dews."
  },
  {
    id: "res-3", title: "Integrated Pest Management (IPM) for Chilli & Cotton Crops",
    slug: "integrated-pest-management-chilli-cotton", topic: "pest_management" as const, topic_label: "Pest Management",
    summary: "Employ pheromone traps, yellow sticky sheets, and predatory mites to suppress whiteflies and thrips sustainably.",
    thumbnail_url: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80", read_time: "5 min read", published_date: "Sep 20, 2026",
    content: "Over-reliance on synthetic pyrethroids leads to secondary pest resurgence."
  },
  {
    id: "res-4", title: "Upper Gangetic Alluvial Soil Management: Meerut & Western UP Field Guide",
    slug: "gangetic-alluvial-soil-management-meerut", topic: "soil_types" as const, topic_label: "Soil Health & Prep",
    summary: "Strategies for managing soil organic carbon, balancing nitrogen leaching in sugarcane-wheat cycles, and subsoil aeration.",
    thumbnail_url: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80", read_time: "7 min read", published_date: "Sep 25, 2026",
    content: "Western Uttar Pradesh's Doab belt boasts exceptional natural silt deposition. In intense two-crop rotations, replenishing potassium and applying gypsum in slightly saline patches boosts root depth by up to 35%."
  },
  {
    id: "res-5", title: "Microclimate & Frost Warning Protocols for Rabi Vegetable Beds",
    slug: "frost-warning-protocols-rabi-vegetables", topic: "plant_diseases" as const, topic_label: "Plant Diseases",
    summary: "How to use light evening irrigation and straw mulching to shield tomato, potato, and chilli nurseries when temperatures dip below 4°C.",
    thumbnail_url: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80", read_time: "5 min read", published_date: "Sep 24, 2026",
    content: "Radiation frosts cause cell rupture in tender solanaceous crops. Setting up light smoke barriers and maintaining 60% soil moisture retains subterranean warmth overnight."
  },
  {
    id: "res-6", title: "Solar Cold Storage & Farm-Gate Primary Processing Economics",
    slug: "solar-cold-storage-farm-gate-processing", topic: "pest_management" as const, topic_label: "Pest Management",
    summary: "Step-by-step payback breakdown for on-farm solar pre-coolers that cut post-harvest transit losses from 28% to under 4%.",
    thumbnail_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80", read_time: "9 min read", published_date: "Sep 23, 2026",
    content: "Pre-cooling fruit within 4 hours of harvest arrests enzymatic breakdown and doubles shelf life during cross-state transit to metropolitan hubs."
  }
];

export const MOCK_COMMUNITY_POSTS = [
  {
    id: "post-1", author_id: "user-101", author_name: "Balwinder Sandhu", author_district: "Ludhiana, Punjab",
    topic: "Mandi Prices & Trends",
    title: "Paddy procurement rates surging in Khanna Mandi — What are you getting?",
    body: "Seeing private millers bidding ₹150 above MSP for clean 1509 moisture <14%. Anyone near Rajpura receiving similar premiums?",
    upvotes: 28, reply_count: 9, status: "active" as const, created_at: "3 hours ago"
  },
  {
    id: "post-2", author_id: "user-102", author_name: "Dr. K. Srinivas", author_district: "Warangal, Telangana",
    topic: "Crop Diseases",
    title: "Immediate advisory: Fall Armyworm sightings in late sown maize",
    body: "Colleagues in North Telangana are noting whorl damage. Release Trichogramma pretiosum egg parasitoids early morning.",
    upvotes: 42, reply_count: 14, status: "active" as const, created_at: "6 hours ago"
  },
  {
    id: "post-3", author_id: "user-103", author_name: "Govind Deshmukh", author_district: "Latur, Maharashtra",
    topic: "Organic Farming",
    title: "Experience with Jeevamrutha on Soybean: 25% yield increment observed",
    body: "Tested desi cow urine + jaggery + besan formulation across 4 acres this kharif. Pod filling was dense and soil micro-arthropod activity is noticeably higher.",
    upvotes: 56, reply_count: 18, status: "active" as const, created_at: "1 day ago"
  },
  {
    id: "post-4", author_id: "user-104", author_name: "Chaudhary Virendra Singh", author_district: "Meerut, Uttar Pradesh",
    topic: "Mandi Prices & Trends",
    title: "Meerut Mandi sugarcane crush rates & direct jaggery procurement prices update",
    body: "Local khandsari units in Partapur and Mawana are offering ₹390/qtl for early varieties. Direct buyers through Kisan Vyapar are paying COD immediately upon truck dispatch.",
    upvotes: 64, reply_count: 22, status: "active" as const, created_at: "5 hours ago"
  },
  {
    id: "post-5", author_id: "user-105", author_name: "Anand Jagtap", author_district: "Sindhudurg, Maharashtra",
    topic: "Soil Quality & Health",
    title: "Testing bio-char application in coastal laterite soils for mango orchards",
    body: "Incorporated 2 kg bamboo biochar per tree drip ring. Observed 40% less irrigation requirement during hot dry spells and significantly higher earthworm cast counts.",
    upvotes: 38, reply_count: 11, status: "active" as const, created_at: "18 hours ago"
  },
  {
    id: "post-6", author_id: "user-106", author_name: "Dr. Meenakshi Sundaram", author_district: "Coimbatore, Tamil Nadu",
    topic: "Organic Farming",
    title: "Biological control of root knot nematodes in turmeric and ginger",
    body: "Mix Paecilomyces lilacinus formulation with well-decomposed neem cake (1:100 ratio) during basal furrow dressing. Suppresses root galling without systemic poisons.",
    upvotes: 71, reply_count: 27, status: "active" as const, created_at: "2 days ago"
  }
];

export const MOCK_FARMERS = [
  { id: "farmer-1", name: "Rameshwar Patel",       avatar: "RP", district: "Sehore, MP",           rating: 4.9, listings: 8,  crop: "Wheat & Pulses",     verified: true  },
  { id: "farmer-2", name: "Gurpreet Singh Dhillon", avatar: "GS", district: "Karnal, Haryana",       rating: 4.8, listings: 12, crop: "Basmati Paddy",       verified: true  },
  { id: "farmer-3", name: "Anand Jagtap",           avatar: "AJ", district: "Sindhudurg, MH",        rating: 4.95, listings: 6,  crop: "Alphonso Mangoes",    verified: true  },
  { id: "farmer-4", name: "Suresh Chandra Verma",   avatar: "SV", district: "Barabanki, UP",         rating: 4.7, listings: 5,  crop: "Desi Chana & Dal",    verified: true  },
  { id: "farmer-5", name: "Mahadev Koli",            avatar: "MK", district: "Nashik, Maharashtra",   rating: 4.85, listings: 9,  crop: "Onions & Grapes",     verified: true  },
  { id: "farmer-6", name: "Venkateswara Rao",        avatar: "VR", district: "Guntur, AP",            rating: 4.9, listings: 7,  crop: "Red Chillies",        verified: true  },
  { id: "farmer-7", name: "Krishnamurthy Reddy",     avatar: "KR", district: "Kurnool, AP",           rating: 4.75, listings: 4,  crop: "Groundnut & Oilseed", verified: true  },
  { id: "farmer-8", name: "Lalita Devi Sharma",      avatar: "LS", district: "Erode, Tamil Nadu",     rating: 4.88, listings: 6,  crop: "Organic Turmeric",    verified: true  },
  { id: "farmer-9", name: "Chaudhary Virendra Singh",avatar: "VS", district: "Meerut, UP",           rating: 4.92, listings: 10, crop: "Sugarcane & Grains",  verified: true  },
  { id: "farmer-10", name: "Tashi Wangchuk",        avatar: "TW", district: "Pulwama, J&K",          rating: 5.0,  listings: 3,  crop: "Pure Mongra Saffron", verified: true  }
];

export const MOCK_TESTIMONIALS = [
  {
    name: "Rameshwar Patel", role: "Wheat Producer • Sehore, MP", stars: 5,
    quote: "Eliminated commission agents taking 6% cuts. Listed 120 quintals of Sharbati wheat and sold the entire lot to a Pune mill in 4 days. Kisan Vyapar changed my economics."
  },
  {
    name: "Priya Sundaram", role: "Spice Exports Lead • Chennai", stars: 5,
    quote: "Procured 200 bags of export-grade Guntur red chillies. Quality moisture checks and Razorpay escrow gave our procurement team complete confidence."
  },
  {
    name: "Chaudhary Virendra Singh", role: "Sugarcane & Grain Farmer • Meerut, UP", stars: 5,
    quote: "Direct connection with commercial mills and flour traders across Western UP. Zero delays in payments and live mandi rate transparency give full pricing control to the grower."
  },
  {
    name: "Gurpreet Singh Dhillon", role: "Paddy Farmer • Karnal, Haryana", stars: 5,
    quote: "The 5-day weather and spraying advisories saved our late kharif paddy from false smut infection. Kisan Vyapar is an income engine and agronomist in one."
  },
  {
    name: "Arun Mehta", role: "Wholesale Buyer • Pune, Maharashtra", stars: 5,
    quote: "Direct farm pricing reduced our procurement cost by 18% per season. The real-time APMC benchmarks keep negotiations transparent and fair for everyone."
  },
  {
    name: "Lalita Devi Sharma", role: "Organic Farmer • Erode, Tamil Nadu", stars: 5,
    quote: "Getting NPOP certified turmeric listed and sold nationwide without a middleman was unthinkable before Kisan Vyapar. Now I earn 40% more per kilogram."
  },
  {
    name: "Tashi Wangchuk", role: "Saffron Producer • Pampore, Kashmir", stars: 5,
    quote: "Sold our pure Mongra saffron directly to gourmet restaurants and spice traders in Delhi and Mumbai with full escrow protection. No fake middlemen commissions."
  },
  {
    name: "Rajan Kapoor", role: "Restaurant Chain Owner • Delhi", stars: 5,
    quote: "Our kitchen team sources fresh seasonal vegetables directly from 6 farmers across 3 states weekly. Quality improved and costs dropped by 22% in one quarter."
  },
];
