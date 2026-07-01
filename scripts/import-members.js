const admin = require("firebase-admin");
const XLSX = require("xlsx");
const path = require("path");

const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

const db = admin.firestore();

const EXCEL_FILE = path.join(
  __dirname,
  "Lion_Club_members list(9).xlsx"
);

const workbook = XLSX.readFile(EXCEL_FILE);

const sheet = workbook.Sheets[workbook.SheetNames[0]];

// Header row = 4
const rows = XLSX.utils.sheet_to_json(sheet, {
  range: 3,
  defval: "",
});

function clean(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function cleanMobile(value) {
  return clean(value)
    .replace(/\.0$/, "")
    .replace(/\s+/g, "");
}

function memberCode(number) {
  return "LC" + String(number).padStart(3, "0");
}

function parseDate(value) {
  if (!value) return "";

  if (value instanceof Date) {
    return value.toISOString().substring(0, 10);
  }

  return clean(value);
}

async function importMembers() {

  console.log("\n====================================");
  console.log(" CELEBRATE TOGETHER MEMBER IMPORT");
  console.log("====================================\n");

  if (!rows.length) {
    console.log("No records found.");
    return;
  }

  console.log(`Excel Records : ${rows.length}`);

  const members = [];
  const memberMap = {};

  let serial = 1;
    const duplicateMobiles = {};
  const duplicateNames = {};
  const missingMobiles = [];

  for (const row of rows) {

    const name = clean(row.name);

    if (!name) continue;

    const code = memberCode(serial);

    const mobile = cleanMobile(row.mobile);

    if (!mobile) {
      missingMobiles.push(name);
    } else {

      if (!duplicateMobiles[mobile]) {
        duplicateMobiles[mobile] = [];
      }

      duplicateMobiles[mobile].push(name);

    }

    if (!duplicateNames[name]) {
      duplicateNames[name] = [];
    }

    duplicateNames[name].push(code);

    memberMap[name] = code;

    members.push({

      memberCode: code,

      name: name,

      dob: parseDate(row.dob),

      mobile: mobile,

      anniversary: parseDate(row.ANNIVERSARY),

      email: clean(row.email),

      address: clean(row.address),

      profession: clean(row.profession),

      companyName: clean(row.companyName),

      jobTitle: clean(row.jobTitle),

      businessDescription: clean(row.businessDescription),

      hobbies: clean(row.hobbies),

      specialSkills: clean(row.specialSkills),

      spouseName: clean(row.spouseName),

      spouseMemberId: "",

      yearJoinedLions: clean(row.yearJoinedLions),

      currentLionsRole: clean(row.currentLionsRole),

      pastPositions: clean(row.pastPositions),

      awardsAchievements: clean(row.awardsAchievements),

      loginPin: "1234",

      isPinChanged: false,

      role: "member",

      isActive: true,

    });

    serial++;

  }

  console.log(
    `Members Prepared : ${members.length}`
  );

  console.log("\nChecking duplicate mobiles...");

  Object.keys(duplicateMobiles).forEach((mobile) => {

    if (duplicateMobiles[mobile].length > 1) {

      console.log(
        `Duplicate Mobile : ${mobile}`
      );

      duplicateMobiles[mobile].forEach((n) => {
        console.log("   - " + n);
      });

    }

  });

  if (missingMobiles.length) {

    console.log("\nMembers without Mobile:");

    missingMobiles.forEach((n) => {
      console.log("   - " + n);
    });

  }

  console.log("\nLinking spouses...");
    for (const member of members) {

    if (!member.spouseName) continue;

    if (memberMap[member.spouseName]) {

      member.spouseMemberId =
        memberMap[member.spouseName];

    }

  }

  console.log("Spouse linking completed.");

  const batch = db.batch();

  let imported = 0;

  for (const member of members) {

    const docRef = db
      .collection("members")
      .doc(member.memberCode);

    batch.set(docRef, {

      ...member,

      createdAt:
        admin.firestore.FieldValue.serverTimestamp(),

      updatedAt:
        admin.firestore.FieldValue.serverTimestamp(),

    });

    imported++;

  }

  console.log(
    "\nUploading to Firestore..."
  );

  await batch.commit();

  console.log("\n====================================");

  console.log("IMPORT COMPLETED");

  console.log("====================================");

  console.log(
    "Imported :",
    imported
  );

  console.log(
    "Total Members :",
    members.length
  );

  console.log("Done.");

}

importMembers()
  .then(() => process.exit(0))
  .catch((err) => {

    console.error("\nIMPORT FAILED\n");

    console.error(err);

    process.exit(1);

  });
  