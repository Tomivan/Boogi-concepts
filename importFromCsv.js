const admin = require('firebase-admin');
const csv = require('csvtojson');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importProducts() {
  const productsArray = await csv().fromFile('perfumes.csv');
  const batch = db.batch();
  
  productsArray.forEach(product => {
    const docRef = db.collection('products').doc();
    batch.set(docRef, {
      ...product,
      price: Number(product.price), // Convert string to number
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  await batch.commit();
  console.log(`Successfully imported ${productsArray.length} products!`);
}

importProducts().catch(console.error);