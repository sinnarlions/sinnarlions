const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function cleanupRandomMembers() {
  console.log("🧹 Cleaning old random member documents...");

  const snapshot = await db.collection("members").get();

  let deleted = 0;
  let skipped = 0;

  const batch = db.batch();

  snapshot.forEach((doc) => {
    const id = doc.id;

    // Keep LC001, LC002... documents
    if (/^LC\d{3}$/.test(id)) {
      skipped++;
      return;
    }

    batch.delete(doc.ref);
    deleted++;
  });

  await batch.commit();

  console.log("");
  console.log("================================");
  console.log(" Cleanup Completed");
  console.log("================================");
  console.log(`Deleted : ${deleted}`);
  console.log(`Kept     : ${skipped}`);
}

cleanupRandomMembers().catch(console.error);