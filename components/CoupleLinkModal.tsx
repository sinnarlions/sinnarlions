"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/src/firebase/config";

interface Member {
  id: string;
  memberCode: string;
  name: string;
  spouseMemberId?: string;
}

interface Props {
  member: Member;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CoupleLinkModal({
  member,
  onClose,
  onSuccess,
}: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const snap = await getDocs(collection(db, "members"));

    const list: Member[] = [];

    snap.forEach((d) => {
      const data = d.data();

      if (
        d.id !== member.memberCode &&
        !data.spouseMemberId
      ) {
        list.push({
          id: d.id,
          memberCode: data.memberCode,
          name: data.name,
          spouseMemberId: data.spouseMemberId,
        });
      }
    });

    list.sort((a, b) => a.name.localeCompare(b.name));

    setMembers(list);
  };

  const handleSave = async () => {
  if (!selected) {
    alert("Please select spouse.");
    return;
  }

  try {
    const spouse = members.find(
      (m) => m.memberCode === selected
    );

    if (!spouse) {
      alert("Spouse not found.");
      return;
    }

    const batch = writeBatch(db);

    const memberRef = doc(db, "members", member.memberCode);
    const spouseRef = doc(db, "members", spouse.memberCode);

    batch.update(memberRef, {
      spouseMemberId: spouse.memberCode,
      spouseName: spouse.name,
    });

    batch.update(spouseRef, {
      spouseMemberId: member.memberCode,
      spouseName: member.name,
    });

    await batch.commit();

    alert("Couple linked successfully.");

    onSuccess();
  } catch (err) {
    console.error(err);
    alert("Unable to link couple.");
  }
};
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">

        <h2 className="text-xl font-bold mb-5">
          Link Couple
        </h2>

        <p className="mb-4">
          <strong>{member.name}</strong>
        </p>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full border rounded-xl p-3"
        >
          <option value="">
            Select Spouse
          </option>

          {members.map((m) => (
            <option
              key={m.memberCode}
              value={m.memberCode}
            >
              {m.memberCode} - {m.name}
            </option>
          ))}
        </select>
                <div className="flex gap-3 mt-6">

          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-300 font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-[#003B75] text-white font-semibold"
          >
            Link Couple
          </button>

        </div>

      </div>
    </div>
  );
}