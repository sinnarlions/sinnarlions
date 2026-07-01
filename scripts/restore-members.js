const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

const db = getFirestore();

async function restoreMembers() {
  try {
    const backupPath = path.join(__dirname, "members-backup.json");

    const members = JSON.parse(
      fs.readFileSync(backupPath, "utf8")
    );

    for (const member of members) {
      const { id, ...data } = member;

      await db.collection("members").doc(id).set(data);
    }

    console.log("✅ Restore completed successfully.");
    console.log(`📦 ${members.length} members restored.`);
  } catch (error) {
    console.error("❌ Restore failed:", error);
  }
}

restoreMembers();