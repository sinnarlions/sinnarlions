"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/src/firebase/config";

import { CABINET_ROLE_NAMES } from "@/src/constants/cabinetRoles";


interface Member {
  id: string;
  memberCode: string;
  name: string;
}
interface CabinetOfficer {
  id: string;
  lionYear: string;
  role: string;
  memberCode: string;
}

export default function CabinetOfficersAdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<Member[]>([]);
  const [officers, setOfficers] = useState<CabinetOfficer[]>([]);

  const [editingId, setEditingId] = useState("");

  const [lionYear, setLionYear] = useState("2025-2026");
  const [role, setRole] = useState("");
  const [memberCode, setMemberCode] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const memberSnap = await getDocs(collection(db, "members"));

      const memberData = memberSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Member, "id">),
      }));
memberData.sort((a, b) =>
  (a.name || "").localeCompare(b.name || "")
);
     
      setMembers(memberData);

      const officerSnap = await getDocs(
        collection(db, "cabinetOfficers")
      );

      const officerData = officerSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<CabinetOfficer, "id">),
      }));

      setOfficers(officerData);
    } finally {
      setLoading(false);
    }
  }
    function clearForm() {
    setEditingId("");
    setLionYear("2025-2026");
    setRole("");
    setMemberCode("");
  }

  async function handleSave() {
    if (!lionYear || !role || !memberCode) {
      alert("Please fill all fields.");
      return;
    }

    try {
      if (editingId) {
        await updateDoc(
          doc(db, "cabinetOfficers", editingId),
          {
            lionYear,
            role,
            memberCode,
          }
        );

        alert("Updated Successfully ✅");
      } else {
        const docRef = await addDoc(
  collection(db, "cabinetOfficers"),
  {
    lionYear,
    role,
    memberCode,
  }
);




alert("Added Successfully ✅");
      }

      clearForm();
      loadData();
    } catch (err) {
      console.error(err);
      alert("Unable to save.");
    }
  }

  function handleEdit(item: CabinetOfficer) {
    setEditingId(item.id);
    setLionYear(item.lionYear);
    setRole(item.role);
    setMemberCode(item.memberCode);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: string) {
    const ok = confirm(
      "Delete this officer?"
    );

    if (!ok) return;

    await deleteDoc(
      doc(db, "cabinetOfficers", id)
    );

    loadData();
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-10">

      {/* Header */}

      <div className="sticky top-0 z-20 border-b-4 border-[#F2A900] bg-[#003B75] shadow-md">

        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">

          <div>
            <h1 className="text-xl font-bold text-white">
              Cabinet Officers
            </h1>

            <p className="text-[11px] text-white/80">
              Super Admin
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#003B75]"
          >
            ← Back
          </button>

        </div>

      </div>

      <div className="mx-auto mt-5 max-w-md space-y-4 px-4">{/* Form */}

<div className="rounded-2xl bg-white p-5 shadow-sm">

  <h2 className="mb-4 text-lg font-bold text-[#003B75]">
    {editingId ? "Edit Cabinet Officer" : "Add Cabinet Officer"}
  </h2>

  <div className="space-y-4">

    {/* Lionistic Year */}

    <div>
      <label className="mb-1 block text-xs font-bold uppercase text-gray-700">
        Lionistic Year
      </label>

      <input
        value={lionYear}
        onChange={(e) => setLionYear(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900"
        placeholder="2025-2026"
      />
    </div>

    {/* Role */}

    <div>
      <label className="mb-1 block text-xs font-bold uppercase text-gray-700">
        Cabinet Position
      </label>

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900"
      >
        <option value="">Select Position</option>

        {CABINET_ROLE_NAMES.map((item) => (
  <option key={item} value={item}>
    {item}
  </option>
))}

      </select>
    </div>

    {/* Member */}

    <div>
      <label className="mb-1 block text-xs font-bold uppercase text-gray-700">
        Member
      </label>

      <select
        value={memberCode}
        onChange={(e) => setMemberCode(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900"
      >
        <option value="">Select Member</option>

        {members.map((m) => (
          <option
            key={m.memberCode}
            value={m.memberCode}
          >
            {m.name}
          </option>
        ))}

      </select>
    </div>

    <div className="flex gap-3">

      <button
        onClick={handleSave}
        className="flex-1 rounded-xl bg-[#003B75] py-3 font-bold text-white"
      >
        {editingId ? "Update" : "Save"}
      </button>

      {editingId && (
        <button
          onClick={clearForm}
          className="rounded-xl bg-gray-200 px-5 font-bold"
        >
          Cancel
        </button>
      )}

    </div>
</div>
  </div>
{/* Cabinet Officers List */}

<div className="space-y-3">

  {officers.length === 0 ? (

    <div className="rounded-xl bg-white p-5 text-center text-gray-500 shadow-sm">
      No Cabinet Officers Added Yet
    </div>

  ) : (

    officers
      .sort((a, b) => {
        if (a.lionYear !== b.lionYear) {
          return b.lionYear.localeCompare(a.lionYear);
        }
        return a.role.localeCompare(b.role);
      })
      .map((item) => {

        const member = members.find(
          (m) => m.memberCode === item.memberCode
        );

        return (
          <div
            key={item.id}
            className="rounded-2xl bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">

              <div>

                <h3 className="text-lg font-bold text-[#003B75]">
                  {item.role}
                </h3>

                <p className="mt-1 text-sm font-semibold text-gray-700">
                  {member?.name || item.memberCode}
                </p>

                <p className="mt-2 inline-block rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                  {item.lionYear}
                </p>

              </div>

            </div>

            <div className="mt-4 flex gap-2">

              <button
                onClick={() => handleEdit(item)}
                className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(item.id)}
                className="rounded-lg bg-red-100 px-4 py-2 text-sm font-bold text-red-700"
              >
                Delete
              </button>

            </div>

          </div>
        );
      })

  )}

</div>

      </div>

    </main>
  );
}

