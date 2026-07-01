import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "./config";

import { Member } from "../types/members";

export async function getMembers() {
  const snapshot = await getDocs(
    collection(db, "members")
  );

  const members: Member[] =
    snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Member),
    }));

  return members;
}