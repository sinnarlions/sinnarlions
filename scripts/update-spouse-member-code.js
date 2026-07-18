const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function updateSpouseMemberCodes() {
  console.log("Updating spouseMemberCode...");

  const snapshot = await db.collection("members").get();

  const members = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  let updated = 0;

  for (const member of members) {
    let spouseMemberCode = "";

    if (member.spouseName && member.spouseName.trim() !== "") {
      const spouse = members.find(
        (m) =>
          m.name &&
          m.name.trim().toLowerCase() ===
            member.spouseName.trim().toLowerCase()
      );

      if (spouse) {
        spouseMemberCode = spouse.memberCode;
      }
    }

    await db
      .collection("members")
      .doc(member.id)
      .update({
        spouseMemberCode,
      });

    updated++;

    console.log(
      `${member.memberCode} -> ${spouseMemberCode || "Single"}`
    );
  }

  console.log("");
  console.log("==================================");
  console.log("Completed");
  console.log("Updated :", updated);
  console.log("==================================");
}

updateSpouseMemberCodes().catch(console.error);