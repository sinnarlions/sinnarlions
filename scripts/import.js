// लेटेस्ट पद्धत: 'initializeApp' आणि 'cert' स्वतंत्रपणे इम्पोर्ट करा
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const csv = require('csv-parser');

// १. तुमच्या serviceAccountKey चा पाथ
const serviceAccount = require("./serviceAccountKey.json");

// २. थेट 'cert(serviceAccount)' चा वापर करा
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// ३. तुमच्या Firestore मधील कलेक्शनचे नाव
const collectionName = "members"; 

console.log("प्रक्रिया सुरू होत आहे...");

// ४. CSV फाईल वाचून अपलोड करणे
fs.createReadStream('data.csv') 
  .pipe(csv())
  .on('data', async (row) => {
    try {
      await db.collection(collectionName).add(row);
      console.log(`अपलोड झाला:`, row);
    } catch (error) {
      console.error('एरर आली: ', error);
    }
  })
  .on('end', () => {
    console.log('सर्व डेटा यशस्वीरित्या Firestore मध्ये इम्पोर्ट झाला आहे!');
  });