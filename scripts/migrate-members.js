const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// ==========================================
// 1. INITIALIZATION
// ==========================================
// Replace 'serviceAccountKey.json' with the path to your actual service account file.
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const COLLECTION_NAME = 'members';

async function migrateMembers() {
  console.log('🚀 Starting member migration process...');

  try {
    // ==========================================
    // 2. READ ALL EXISTING MEMBERS
    // ==========================================
    const membersSnapshot = await db.collection(COLLECTION_NAME).get();
    
    if (membersSnapshot.empty) {
      console.log('⚠️ No members found in the collection to migrate.');
      return;
    }

    console.log(`📦 Found ${membersSnapshot.size} members. Fetching data...`);

    const originalDocs = [];
    membersSnapshot.forEach(doc => {
      originalDocs.push({
        oldId: doc.id,
        data: doc.data()
      });
    });

    // ==========================================
    // 3. SORT BY NAME
    // ==========================================
    // Sorting alphabetically by name case-insensitive, falling back to ID if names are identical
    originalDocs.sort((a, b) => {
      const nameA = (a.data.name || '').trim().toLowerCase();
      const nameB = (b.data.name || '').trim().toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return a.oldId.localeCompare(b.oldId);
    });

    // ==========================================
    // 4. GENERATE NEW IDs AND MAP NAMES FOR SPOUSE MATCHING
    // ==========================================
    const nameToNewIdMap = new Map();
    const migratedMembers = originalDocs.map((member, index) => {
      const sequenceNumber = String(index + 1).padStart(3, '0');
      const newId = `LC${sequenceNumber}`;
      
      const name = (member.data.name || '').trim();
      if (name) {
        // Mapping lower-case name to newId for flexible matching
        nameToNewIdMap.set(name.toLowerCase(), newId);
      }

      return {
        ...member,
        newId
      };
    });

    // ==========================================
    // 5. BULK WRITER INITIALIZATION
    // ==========================================
    const bulkWriter = db.bulkWriter();

    // Setup success/error logging for the BulkWriter
    let countCreated = 0;
    let countDeleted = 0;
    let countErrors = 0;

    bulkWriter.onWriteResult((ref, result) => {
      // Intentionally quiet during bulk operations to prevent console flooding in production,
      // but tracker variables can be checked at the end.
    });

    bulkWriter.onWriteError((error) => {
      console.error(`❌ BulkWriter error on operational path [${error.element.ref.path}]:`, error.message);
      countErrors++;
      // Return true to retry up to default limits, false to fail immediately.
      return false; 
    });

    // ==========================================
    // 6. PASS 1: CREATE NEW DOCUMENTS
    // ==========================================
    console.log('🔄 Step 1: Writing new sequential LC documents...');

    for (const member of migratedMembers) {
      const { newId, data } = member;

      const existing = await db.collection(COLLECTION_NAME).doc(newId).get();

if (existing.exists) {
  throw new Error(`${newId} already exists. Migration aborted.`);
}

      const docRef = db.collection(COLLECTION_NAME).doc(newId);

      // Handle ANNIVERSARY rename
      const { ANNIVERSARY, ...restOfData } = data;
      const anniversary = ANNIVERSARY ?? data.anniversary ?? "";

      // Determine spouseMemberId by searching the map
      let spouseMemberId = null;
      const spouseNameNormalized = (data.spouseName || '').trim().toLowerCase();
      if (spouseNameNormalized && nameToNewIdMap.has(spouseNameNormalized)) {
        spouseMemberId = nameToNewIdMap.get(spouseNameNormalized);
      }

      // Build the upgraded production schema
      const migratedData = {
        ...restOfData,
        anniversary,
        spouseMemberId,
        memberCode: newId,
        loginPin: "1234",
        isPinChanged: false,
        role: "member",
        isActive: true,
        createdAt: data.createdAt || FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

     bulkWriter.set(docRef, migratedData);
      countCreated++;
    }

    // Wait for all creation writes to fully commit to Firestore
    await bulkWriter.flush();
    console.log(`✅ Step 1 complete. Created ${countCreated} new sequential documents.`);

    // ==========================================
    // 7. PASS 2: DELETE OLD RANDOM ID DOCUMENTS
    // ==========================================
    if (countErrors > 0) {
      console.error('🛑 Migration halted before deletion phase due to write errors. Old documents preserved.');
      return;
    }

    console.log('🔄 Step 2: Cleaning up old random-ID documents...');

    for (const member of migratedMembers) {
      const oldDocRef = db.collection(COLLECTION_NAME).doc(member.oldId);
      if (member.oldId !== member.newId) {
      bulkWriter.delete(oldDocRef);
      }
      countDeleted++;
    }

    // Wait for all deletions to fully commit
    await bulkWriter.close();

    // ==========================================
    // 8. PRINT MIGRATION SUMMARY
    // ==========================================
    console.log('\n--- 📊 MIGRATION SUMMARY ---');
    console.log(`Total Members Processed:  ${migratedMembers.length}`);
    console.log(`New 'LCXXX' Docs Created: ${countCreated}`);
    console.log(`Old Random-ID Docs Deleted: ${countDeleted}`);
    console.log(`Execution Errors:         ${countErrors}`);
    console.log('----------------------------');
    console.log('🎉 Migration finished successfully!');

  } catch (globalError) {
    console.error('💥 Critical failure during migration execution:', globalError);
  }
}

// Execute migration
migrateMembers();