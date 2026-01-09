// Seed Products to Firebase Firestore
// Run: node scripts/seed-products.js

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyDwECc2OJR6V5lFv2lCRdsVhgbenGW35gc',
  authDomain: 'elight-sofa.firebaseapp.com',
  projectId: 'elight-sofa',
  storageBucket: 'elight-sofa.firebasestorage.app',
  messagingSenderId: '700236647248',
  appId: '1:700236647248:web:274b32f4529da1d6257a55',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Calculate status based on stock
function calculateStatus(stockQty, minStock) {
  if (stockQty === 0) return 'Out of Stock';
  if (stockQty > 0 && stockQty <= minStock) return 'Low Stock';
  return 'In Stock';
}

// Sample products data
const sampleProducts = [
  // Sofas
  {
    name: 'Royal Chesterfield Sofa',
    category: 'Sofas',
    price: 85000,
    stockQty: 5,
    minStock: 3,
    material: 'Leather',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    rating: 4.8,
    reviewsCount: 124,
    sofaType: '3 Seater',
    seatingCapacity: '3 Persons',
    dimensions: '84" W x 38" D x 36" H',
    description: 'Luxurious Chesterfield sofa with premium leather upholstery and hand-tufted details.',
  },
  {
    name: 'Modern L-Shape Sectional',
    category: 'Sofas',
    price: 125000,
    stockQty: 2,
    minStock: 2,
    material: 'Velvet',
    imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800',
    rating: 4.6,
    reviewsCount: 89,
    sofaType: 'L-Shape Sofa',
    seatingCapacity: '4+ Persons',
    dimensions: '120" W x 90" D x 34" H',
    description: 'Contemporary L-shaped sectional with plush velvet fabric and modular design.',
  },
  {
    name: 'Compact 2-Seater Loveseat',
    category: 'Sofas',
    price: 45000,
    stockQty: 8,
    minStock: 4,
    material: 'Cotton Fabric',
    imageUrl: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800',
    rating: 4.5,
    reviewsCount: 67,
    sofaType: '2 Seater',
    seatingCapacity: '2 Persons',
    dimensions: '60" W x 34" D x 32" H',
    description: 'Perfect for small spaces, this loveseat combines comfort with style.',
  },
  // Chairs
  {
    name: 'Executive Office Chair',
    category: 'Chairs',
    price: 28000,
    stockQty: 12,
    minStock: 5,
    material: 'Leather / Leatherette',
    imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800',
    rating: 4.7,
    reviewsCount: 156,
    chairType: 'Office Chair',
    dimensions: '26" W x 28" D x 48" H',
    description: 'Ergonomic executive chair with lumbar support and adjustable armrests.',
  },
  {
    name: 'Velvet Accent Chair',
    category: 'Chairs',
    price: 18500,
    stockQty: 6,
    minStock: 3,
    material: 'Fabric Upholstered',
    imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
    rating: 4.4,
    reviewsCount: 78,
    chairType: 'Accent Chair',
    dimensions: '28" W x 30" D x 34" H',
    description: 'Elegant accent chair with velvet upholstery and gold-finished legs.',
  },
  {
    name: 'Classic Dining Chair Set',
    category: 'Chairs',
    price: 8500,
    stockQty: 0,
    minStock: 10,
    material: 'Wooden',
    imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800',
    rating: 4.3,
    reviewsCount: 234,
    chairType: 'Dining Chair',
    dimensions: '18" W x 20" D x 38" H',
    description: 'Solid wood dining chair with comfortable cushioned seat.',
  },
  // Tables
  {
    name: 'Marble Top Coffee Table',
    category: 'Tables',
    price: 35000,
    stockQty: 4,
    minStock: 2,
    material: 'Marble Top',
    imageUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800',
    rating: 4.9,
    reviewsCount: 92,
    tableType: 'Coffee Table',
    dimensions: '48" W x 24" D x 18" H',
    description: 'Stunning marble top coffee table with brass-finished metal base.',
  },
  {
    name: '6-Seater Dining Table',
    category: 'Tables',
    price: 65000,
    stockQty: 3,
    minStock: 2,
    material: 'Solid Wood',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
    rating: 4.7,
    reviewsCount: 145,
    tableType: 'Dining Table',
    dimensions: '72" W x 36" D x 30" H',
    description: 'Elegant solid wood dining table with natural grain finish.',
  },
  // Bedroom
  {
    name: 'King Size Platform Bed',
    category: 'Bedroom',
    price: 78000,
    stockQty: 2,
    minStock: 2,
    material: 'Upholstered',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
    rating: 4.8,
    reviewsCount: 167,
    bedroomType: 'Bed Frame',
    dimensions: '80" W x 84" D x 48" H',
    description: 'Luxurious upholstered platform bed with integrated headboard.',
  },
  {
    name: 'Modern Wardrobe',
    category: 'Bedroom',
    price: 55000,
    stockQty: 1,
    minStock: 2,
    material: 'Engineered Wood',
    imageUrl: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800',
    rating: 4.5,
    reviewsCount: 89,
    bedroomType: 'Wardrobe',
    dimensions: '72" W x 24" D x 84" H',
    description: 'Spacious wardrobe with sliding doors and internal organizers.',
  },
  // Curtains
  {
    name: 'Blackout Velvet Curtains',
    category: 'Curtains',
    price: 4500,
    stockQty: 25,
    minStock: 10,
    material: 'Velvet',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
    rating: 4.6,
    reviewsCount: 312,
    curtainType: 'Blackout Curtains',
    curtainFabric: 'Velvet',
    curtainSize: '7 ft',
    description: 'Premium blackout curtains with thermal insulation properties.',
  },
  {
    name: 'Sheer Linen Curtains',
    category: 'Curtains',
    price: 2800,
    stockQty: 40,
    minStock: 15,
    material: 'Linen',
    imageUrl: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800',
    rating: 4.4,
    reviewsCount: 198,
    curtainType: 'Sheer Curtains',
    curtainFabric: 'Linen',
    curtainSize: '9 ft',
    description: 'Light and airy sheer curtains perfect for living rooms.',
  },
];

async function seedProducts() {
  console.log('🚀 Starting product seeding to Firebase...\n');

  for (const product of sampleProducts) {
    try {
      const productData = {
        ...product,
        status: calculateStatus(product.stockQty, product.minStock),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      console.log(`✅ Added: ${product.name} (${product.category}) - ID: ${docRef.id}`);
      console.log(`   Status: ${productData.status} | Stock: ${product.stockQty} | Min: ${product.minStock}`);
    } catch (error) {
      console.error(`❌ Error adding ${product.name}:`, error.message);
    }
  }

  console.log('\n✨ Product seeding completed!');
  console.log(`📦 Total products added: ${sampleProducts.length}`);
  console.log('\nCategory breakdown:');
  console.log('  - Sofas: 3');
  console.log('  - Chairs: 3');
  console.log('  - Tables: 2');
  console.log('  - Bedroom: 2');
  console.log('  - Curtains: 2');
  
  process.exit(0);
}

seedProducts().catch(console.error);
