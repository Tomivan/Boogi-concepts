const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Admin SDK
initializeApp();
const db = getFirestore();

const popularPerfumes = [
  { id: "angham", rank: 1 },
  { id: "eclaire-lattafa", rank: 2 },
  { id: "club-de-nuit-woman", rank: 3 },
  { id: "asad-bourbon", rank: 4 },
  { id: "yves-saint-laurent", rank: 5 },
  { id: "al-dirgham-limited", rank: 6 },
  { id: "opulent-red", rank: 7 },
  { id: "oud-al-faris", rank: 8 },
  { id: "ana-abiyedh", rank: 9 },
  { id: "andaleeb-asdaaf", rank: 10 },
  { id: "eternal-oud", rank: 11 },
  { id: "khair-confection", rank: 12 }
];

async function run() {
  try {
    for (const perfume of popularPerfumes) {
      await db.collection('popularPerfumes').doc(perfume.id).set({
        perfumeRef: db.doc(`products/${perfume.id}`), // Correct reference format
        rank: perfume.rank,
        isActive: true
      });
      console.log(`✅ Added ${perfume.id}`);
    }
    console.log('🎉 All perfumes initialized!');
  } catch (error) {
    console.error('🔥 Error:', error);
  } finally {
    process.exit();
  }
}

run();