const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

const { getFirestore } = require("firebase-admin/firestore");
const db = getFirestore();

async function backupMembers() {
  try {
    const snapshot = await db.collection("members").get();

    const members = [];

    snapshot.forEach((doc) => {
      members.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    const backupPath = path.join(__dirname, "members-backup.json");

    fs.writeFileSync(
      backupPath,
      JSON.stringify(members, null, 2),
      "utf8"
    );

    console.log("✅ Backup completed successfully.");
    console.log(`📦 ${members.length} members exported.`);
    console.log(`📁 File: ${backupPath}`);
  } catch (error) {
    console.error("❌ Backup failed:", error);
  }
}

backupMembers();