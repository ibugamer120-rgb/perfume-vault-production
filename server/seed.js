require('dotenv').config();
const connectDB = require('./config/db');
const Product = require('./models/Product');

const products = [
  {
    name: 'Midnight Essence',
    description: 'A captivating journey into the deepest hours of night. Opens with dark bergamot and black pepper, evolving into a heart of Damascus rose and aged oud wood. The dry-down reveals ambergris, vetiver, and dark musk that lingers for hours. Crafted by master perfumers from Assam oud aged 12 years and Damascene rose absolute steam-distilled at dawn.',
    shortDescription: 'Dark, enigmatic, and deeply sensual — a journey into the night.',
    price: 120, comparePrice: 160, category: 'Men',
    notes: { top: ['Dark Bergamot', 'Black Pepper', 'Saffron'], middle: ['Damascus Rose', 'Oud Wood', 'Jasmine'], base: ['Ambergris', 'Vetiver', 'Dark Musk'] },
    size: '100ml EDP', stock: 50,
    images: [
      { url: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80', alt: 'Midnight Essence' },
      { url: 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80', alt: 'Midnight Essence Detail' },
    ],
    featured: true, isNew: true, tags: ['oud', 'dark', 'oriental', 'luxury', 'night'], rating: 4.8, numReviews: 124, sold: 312,
  },
  {
    name: 'Rose Imperiale',
    description: 'The queen of all roses, distilled into a single breathtaking fragrance. Rose Imperiale opens with lychee and pink pepper before revealing the most precious rose absolute from Grasse at its heart. A trail of white musk and sandalwood leaves an unforgettable impression wherever you go.',
    shortDescription: 'The ultimate rose — delicate, powerful, imperial.',
    price: 185, comparePrice: 220, category: 'Women',
    notes: { top: ['Lychee', 'Pink Pepper', 'Bergamot'], middle: ['Grasse Rose', 'Peony', 'Jasmine Sambac'], base: ['White Musk', 'Sandalwood', 'Cashmeran'] },
    size: '100ml EDP', stock: 30,
    images: [
      { url: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80', alt: 'Rose Imperiale' },
      { url: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80', alt: 'Rose Imperiale Detail' },
    ],
    featured: true, isNew: true, tags: ['rose', 'floral', 'feminine', 'grasse'], rating: 4.9, numReviews: 87, sold: 203,
  },
  {
    name: 'Vault No. 1',
    description: 'The crown jewel of The Perfume Vault collection. A rare masterpiece blending the finest aged oud, Iranian saffron, and Mysore sandalwood. Only 500 bottles produced annually. This is not merely a fragrance — it is a statement of absolute luxury and uncompromising taste.',
    shortDescription: 'Our rarest creation — the crown jewel of the vault.',
    price: 380, comparePrice: null, category: 'Luxury',
    notes: { top: ['Iranian Saffron', 'Oud', 'Cardamom'], middle: ['Mysore Sandalwood', 'Bulgarian Rose', 'Amber'], base: ['Agarwood', 'Labdanum', 'Civet'] },
    size: '50ml Parfum', stock: 12,
    images: [
      { url: 'https://images.unsplash.com/photo-1563170352-fda26c16f6ca?w=800&q=80', alt: 'Vault No. 1' },
    ],
    featured: true, isNew: false, tags: ['oud', 'luxury', 'saffron', 'rare', 'exclusive'], rating: 5.0, numReviews: 34, sold: 89,
  },
  {
    name: 'Noir Absolu',
    description: 'Bold, mysterious, and intensely masculine. Noir Absolu opens with a burst of black cardamom and leather before settling into a smoky, woody heart of vetiver and cedarwood. The base of black amber and musk creates a powerful silage that commands every room.',
    shortDescription: 'Bold and smoky — for the man who commands attention.',
    price: 145, comparePrice: 175, category: 'Men',
    notes: { top: ['Black Cardamom', 'Leather', 'Bergamot'], middle: ['Vetiver', 'Cedarwood', 'Birch Tar'], base: ['Black Amber', 'Musk', 'Patchouli'] },
    size: '100ml EDP', stock: 40,
    images: [
      { url: 'https://images.unsplash.com/photo-1619994403073-2cec844b8e63?w=800&q=80', alt: 'Noir Absolu' },
    ],
    featured: true, isNew: false, tags: ['woody', 'smoky', 'masculine', 'leather'], rating: 4.7, numReviews: 62, sold: 178,
  },
  {
    name: 'Fleur Céleste',
    description: 'A heavenly bouquet of the most precious white flowers, captured at the height of their bloom. Fleur Céleste is a masterclass in floral perfumery — luminous, ethereal, and impossibly beautiful. The perfect signature scent for the discerning woman who appreciates timeless elegance.',
    shortDescription: 'Ethereal white florals — luminous and timeless.',
    price: 210, comparePrice: null, category: 'Women',
    notes: { top: ['Neroli', 'Aldehyde', 'Pear'], middle: ['Gardenia', 'Tuberose', 'White Lily'], base: ['Musk', 'Benzoin', 'Cedarwood'] },
    size: '75ml EDP', stock: 25,
    images: [
      { url: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80', alt: 'Fleur Céleste' },
    ],
    featured: true, isNew: true, tags: ['white floral', 'feminine', 'ethereal', 'elegant'], rating: 4.8, numReviews: 45, sold: 112,
  },
  {
    name: 'Gold Reserve',
    description: 'The ultimate statement in luxury perfumery. Gold Reserve is a limited edition masterpiece blending 24-karat gold-infused amber with Cambodian oud and aged cognac. Each bottle is hand-numbered and presented in a gold-leafed box. A collector\'s treasure and an olfactory marvel.',
    shortDescription: 'Limited edition gold-infused luxury — a collector\'s masterpiece.',
    price: 550, comparePrice: null, category: 'Luxury',
    notes: { top: ['Cognac', 'Gold Amber', 'Saffron'], middle: ['Cambodian Oud', 'Tobacco', 'Rose Absolute'], base: ['Vanilla', 'Dark Musk', 'Benzoin'] },
    size: '50ml Parfum', stock: 8,
    images: [
      { url: 'https://images.unsplash.com/photo-1563170352-fda26c16f6ca?w=800&q=80', alt: 'Gold Reserve' },
    ],
    featured: true, isNew: false, tags: ['oud', 'gold', 'luxury', 'limited', 'collector'], rating: 5.0, numReviews: 18, sold: 42,
  },
];

const seed = async () => {
  try {
    await connectDB();
    let created = 0, skipped = 0;
    for (const p of products) {
      const exists = await Product.findOne({ name: p.name });
      if (exists) { skipped++; continue; }
      await Product.create(p);
      created++;
      console.log(`  ✅ Created: ${p.name}`);
    }
    console.log(`\n💎 Seed complete! Created: ${created}, Skipped: ${skipped}`);
    console.log('🚀 Run: npm run dev  → http://localhost:5000\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
