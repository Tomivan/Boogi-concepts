const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addIdsToProducts() {
  try {
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    
    const batch = db.batch();
    let count = 0;

    snapshot.forEach(doc => {
      // Only update if id field doesn't exist
      if (!doc.data().id) {
        batch.update(doc.ref, { id: doc.id });
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
      console.log(`Successfully added IDs to ${count} products`);
    } else {
      console.log('All products already have IDs');
    }
  } catch (error) {
    console.error('Error adding IDs:', error);
  } finally {
    process.exit();
  }
}

addIdsToProducts();