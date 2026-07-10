"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/src/firebase/config";

interface Member {
  id: string;
  name: string;
  memberCode: string;
}

interface PastPresident {
  id: string;
  year: string;
  memberCode: string;
  displayOrder: number;
}

function generateLionYears() {
  const startYear = 1999;
  const currentYear = new Date().getFullYear();

  const years: string[] = [];

  for (let year = startYear; year <= currentYear + 1; year++) {
    years.push(`${year}-${year + 1}`);
  }

  return years.reverse();
}

const YEARS = generateLionYears();

export default function PastPresidentsAdminPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [pastPresidents, setPastPresidents] = useState<PastPresident[]>([]);
  const [loading, setLoading] = useState(true);
const [editingId, setEditingId] = useState<string | null>(null);
  const [year, setYear] = useState(YEARS[0]);
  const [memberCode, setMemberCode] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const memberSnap = await getDocs(collection(db, "members"));

      const memberData: Member[] = memberSnap.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Member, "id">),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setMembers(memberData);

      const ppSnap = await getDocs(
        query(
          collection(db, "pastPresidents"),
          orderBy("displayOrder")
        )
      );

      const ppData: PastPresident[] = ppSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<PastPresident, "id">),
      }));

      setPastPresidents(ppData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

 async function savePastPresident() {
  if (!memberCode) {
    alert("Please select a member.");
    return;
  }

  const exists = pastPresidents.find(
    (p) =>
      p.year === year &&
      p.id !== editingId
  );

  if (exists) {
    alert("This year already exists.");
    return;
  }

  if (editingId) {
    await updateDoc(
      doc(db, "pastPresidents", editingId),
      {
        year,
        memberCode,
        displayOrder: YEARS.indexOf(year) + 1,
      }
    );
  } else {
    await addDoc(
      collection(db, "pastPresidents"),
      {
        year,
        memberCode,
        displayOrder: YEARS.indexOf(year) + 1,
      }
    );
  }

  setEditingId(null);
  setYear(YEARS[0]);
  setMemberCode("");

  loadData();
}

  async function removePastPresident(id: string) {
    if (!confirm("Delete this record?")) return;

    await deleteDoc(doc(db, "pastPresidents", id));

    loadData();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
    return (
    <main className="min-h-screen bg-slate-100 p-4">

      <div className="mx-auto max-w-3xl">

      <div className="mb-6 flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold text-[#003B75]">
      👑 Past Presidents
    </h1>

    <p className="text-sm text-gray-500">
      Lions Club of Sinnar City
    </p>
  </div>

  <button
    onClick={() => router.push("/admin")}
    className="cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-[#003B75] shadow-sm transition hover:bg-gray-50"
  >
    ← Back
  </button>
</div>

        <p className="text-sm text-gray-500 mt-1">
          Add or remove Past Presidents
        </p>

        {/* Add Card */}

        <div className="mt-6 rounded-xl bg-white p-5 shadow">

          <div className="grid gap-4 md:grid-cols-2">

            <div>
              <label className="text-sm font-semibold">
                Year
              </label>

              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

            </div>

            <div>

              <label className="text-sm font-semibold">
                Member
              </label>

              <select
                value={memberCode}
                onChange={(e) =>
                  setMemberCode(e.target.value)
                }
                className="mt-1 w-full rounded-lg border px-3 py-2"
              >
                <option value="">
                  Select Member
                </option>

                {members.map((m) => (
                  <option
                    key={m.id}
                    value={m.memberCode}
                  >
                    {m.memberCode} — {m.name}
                  </option>
                ))}

              </select>

            </div>

          </div>

          <button
            onClick={savePastPresident}
            className="mt-5 rounded-lg bg-[#003B75] px-5 py-2 font-semibold text-white hover:bg-blue-900"
          >
            {editingId ? "Save Changes" : "Add Past President"}
          </button>
{editingId && (
  <button
    onClick={() => {
      setEditingId(null);
      setYear(YEARS[0]);
      setMemberCode("");
    }}
    className="ml-3 mt-5 rounded-lg bg-gray-300 px-5 py-2 font-semibold text-gray-800 hover:bg-gray-400"
  >
    Cancel
  </button>
)}
        </div>

        {/* Existing */}

        <div className="mt-8 space-y-3">

          {pastPresidents.map((pp) => {

            const member = members.find(
              (m) => m.memberCode === pp.memberCode
            );

            return (

              <div
                key={pp.id}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow"
              >

                <div>

                  <p className="text-xs font-bold uppercase text-gray-500">
                    {pp.year}
                  </p>

                  <h2 className="text-lg font-bold text-[#003B75]">
                    {member?.name || "Unknown Member"}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {pp.memberCode}
                  </p>

                </div>

<button
  onClick={() => {
    setEditingId(pp.id);
    setYear(pp.year);
    setMemberCode(pp.memberCode);
  }}
  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 mr-2"
>
  Edit
</button>

                <button
                  onClick={() =>
                    removePastPresident(pp.id)
                  }
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>

              </div>

            );

          })}

          {pastPresidents.length === 0 && (
            <div className="rounded-xl bg-white p-6 text-center text-gray-500 shadow">
              No Past Presidents Added
            </div>
          )}

        </div>

      </div>

    </main>
  );
}