const admin = require("firebase-admin");

const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

async function updateLoginStatus() {
  try {
    const snapshot = await db.collection("members").get();

    let count = 0;

    for (const member of snapshot.docs) {
      await member.ref.set(
        {
          isLoggedIn: false,
          sessionId: "",
          lastLogin: null,
        },
        { merge: true }
      );

      count++;
      console.log(`✅ Updated ${member.id}`);
    }

    console.log("--------------------------------");
    console.log(`🎉 Completed : ${count} members`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

updateLoginStatus();