const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

const db = admin.firestore();

const collections = [
  "members",
  "meetings",
  "meetingAgendas",
  "announcements",
];

async function backupCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();

  const data = [];

  snapshot.forEach((doc) => {
    data.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  return data;
}

async function runBackup() {
  console.log("\n================================");
  console.log(" FIRESTORE BACKUP");
  console.log("================================\n");

  const backupDir = path.join(__dirname, "backup");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  for (const collection of collections) {
    console.log(`Backing up ${collection}...`);

    const data = await backupCollection(collection);

    fs.writeFileSync(
      path.join(backupDir, `${collection}.json`),
      JSON.stringify(data, null, 2)
    );

    console.log(`✔ ${collection}: ${data.length} documents`);
  }

  console.log("\n================================");
  console.log("BACKUP COMPLETED");
  console.log("================================");
}

runBackup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });