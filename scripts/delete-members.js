const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

const db = getFirestore();

async function deleteMembers() {
  try {
    const snapshot = await db.collection("members").get();

    if (snapshot.empty) {
      console.log("⚠️ No members found.");
      return;
    }

    const batch = db.batch();

    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`✅ Deleted ${snapshot.size} members successfully.`);
  } catch (error) {
    console.error("❌ Delete failed:", error);
  }
}

deleteMembers();