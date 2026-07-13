const admin = require("firebase-admin");

console.log("Admin keys:", Object.keys(admin));
console.log("Firestore:", typeof admin.firestore);