// patch-image-urls.js
// Replaces all Unsplash URLs in the project source files with Supabase Storage URLs

const fs = require('fs');
const path = require('path');

const SB = 'https://rafxxtiuagdmvvkoauuw.supabase.co/storage/v1/object/public';

// Complete URL replacement map: exact Unsplash URL → Supabase URL
const URL_MAP = {
  // Wheat
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800':  `${SB}/crop-images/wheat-main.jpg`,
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=400':  `${SB}/crop-images/wheat-main.jpg`,
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=1200': `${SB}/site-assets/hero-wheat-field.jpg`,
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600':  `${SB}/crop-images/wheat-main.jpg`,
  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=200':  `${SB}/crop-images/wheat-main.jpg`,
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800':  `${SB}/crop-images/wheat-alt1.jpg`,
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800':     `${SB}/crop-images/wheat-alt2.jpg`,
  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400':     `${SB}/crop-images/organic-main.jpg`,
  // Tomato / Rice
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800':  `${SB}/crop-images/tomato-main.jpg`,
  'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=800':  `${SB}/crop-images/tomato-alt1.jpg`,
  // Onion / Mango
  'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800':     `${SB}/crop-images/onion-main.jpg`,
  // Soybean / Pulses
  'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=800':  `${SB}/crop-images/soybean-main.jpg`,
  'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=400':  `${SB}/crop-images/soybean-main.jpg`,
  // Chilli / Onion
  'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=800':  `${SB}/crop-images/chilli-main.jpg`,
  // Spice
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800':  `${SB}/crop-images/spice-main.jpg`,
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400':  `${SB}/crop-images/spice-main.jpg`,
  // Oilseed
  'https://images.unsplash.com/photo-1471193945509-9ad0617afabf?auto=format&fit=crop&q=80&w=400':  `${SB}/crop-images/oilseed-main.jpg`,
  // Fruits / Vegetables
  'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=400':  `${SB}/crop-images/fruit-main.jpg`,
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=400':  `${SB}/crop-images/vegetable-main.jpg`,
  // Hero / Site assets
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=1200': `${SB}/site-assets/hero-farmer.jpg`,
  'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=1200': `${SB}/site-assets/hero-harvest.jpg`,
  // Resources / Community thumbnails
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800':  `${SB}/community-uploads/resource-soil.jpg`,
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800': `${SB}/community-uploads/resource-spice.jpg`,
};

// Files to patch
const FILES = [
  'lib/mock-data.ts',
  'context/CropContext.tsx',
  'app/page.tsx',
  'app/farmer/listings/new/page.tsx',
  'components/marketplace/CropCard.tsx',
  'components/marketplace/CartDrawer.tsx',
];

const ROOT = path.join(__dirname, '..');
let totalReplaced = 0;

FILES.forEach((relPath) => {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Not found: ${relPath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileReplaced = 0;

  Object.entries(URL_MAP).forEach(([oldUrl, newUrl]) => {
    // Escape for string matching (not regex)
    const escaped = oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const before = content;
    content = content.replace(regex, newUrl);
    const count = (before.match(regex) || []).length;
    fileReplaced += count;
  });

  if (fileReplaced > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${relPath} — ${fileReplaced} URL(s) replaced`);
    totalReplaced += fileReplaced;
  } else {
    console.log(`⚪ ${relPath} — no changes needed`);
  }
});

console.log(`\n🎉 Done! Total: ${totalReplaced} Unsplash URLs → Supabase Storage URLs`);
