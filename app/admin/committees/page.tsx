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
import MemberSelector, {
  MemberOption,
} from "@/components/MemberSelector";
import { COMMITTEE_NAME_LIST } from "@/src/constants/committeeNames";

interface Committee {
  id: string;
  lionYear: string;
  committeeName: string;
  chairpersonCode: string;
  memberCodes: string[];
  displayOrder: number;
}

export default function CommitteesAdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [members, setMembers] = useState<MemberOption[]>([]);

  const [committees, setCommittees] = useState<Committee[]>([]);

  const [editingId, setEditingId] = useState("");

  const [lionYear, setLionYear] =
    useState("2025-2026");

  const [committeeName, setCommitteeName] =
    useState("");

  const [chairpersonCode, setChairpersonCode] =
    useState("");

  const [memberCodes, setMemberCodes] =
    useState<string[]>([]);

  const [displayOrder, setDisplayOrder] =
    useState(1);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    try {
      const memberSnap = await getDocs(
        collection(db, "members")
      );

      const memberData: MemberOption[] =
        memberSnap.docs.map((doc) => ({
          memberCode:
            doc.data().memberCode || "",
          name: doc.data().name || "",
        }));

      memberData.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setMembers(memberData);

      const committeeSnap =
        await getDocs(
          collection(db, "committees")
        );

      const committeeData =
        committeeSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<
            Committee,
            "id"
          >),
        }));

      committeeData.sort(
        (a, b) =>
          a.displayOrder -
          b.displayOrder
      );

      setCommittees(committeeData);
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setEditingId("");

    setLionYear("2025-2026");

    setCommitteeName("");

    setChairpersonCode("");

    setMemberCodes([]);

    setDisplayOrder(1);
  }

  async function handleSave() {
    if (
      !lionYear ||
      !committeeName ||
      !chairpersonCode
    ) {
      alert(
        "Please fill all required fields."
      );
      return;
    }

    const data = {
      lionYear,
      committeeName,
      chairpersonCode,
      memberCodes,
      displayOrder,
    };

    try {
      if (editingId) {
        await updateDoc(
          doc(
            db,
            "committees",
            editingId
          ),
          data
        );

        alert(
          "Updated Successfully ✅"
        );
      } else {
        await addDoc(
          collection(
            db,
            "committees"
          ),
          data
        );

        alert(
          "Added Successfully ✅"
        );
      }

      clearForm();

      loadData();
    } catch (error) {
      console.error(error);

      alert("Unable to Save");
    }
  }
    function handleEdit(item: Committee) {
    setEditingId(item.id);

    setLionYear(item.lionYear);

    setCommitteeName(item.committeeName);

    setChairpersonCode(item.chairpersonCode);

    setMemberCodes(item.memberCodes || []);

    setDisplayOrder(item.displayOrder);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: string) {
    const ok = confirm(
      "Delete this Committee?"
    );

    if (!ok) return;

    await deleteDoc(
      doc(db, "committees", id)
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

      <div className="sticky top-0 z-20 border-b-4 border-[#F2A900] bg-[#003B75] shadow-md">

        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">

          <div>

            <h1 className="text-xl font-bold text-white">
              Committees Admin
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

      <div className="mx-auto mt-5 max-w-md space-y-4 px-4">

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="mb-4 text-lg font-bold text-[#003B75]">

            {editingId
              ? "Edit Committee"
              : "Add Committee"}

          </h2>

          <div className="space-y-4">

            <input
              value={lionYear}
              onChange={(e) =>
                setLionYear(e.target.value)
              }
              placeholder="Lionistic Year"
              className="w-full rounded-xl border p-3"
            />

            <select
              value={committeeName}
              onChange={(e) =>
                setCommitteeName(
                  e.target.value
                )
              }
              className="w-full rounded-xl border p-3"
            >

              <option value="">
                Select Committee
              </option>

              {COMMITTEE_NAME_LIST.map(
                (committee) => (
                  <option
                    key={committee}
                    value={committee}
                  >
                    {committee}
                  </option>
                )
              )}

            </select>

            <div>

              <p className="mb-2 text-sm font-bold text-[#003B75]">
                Chairperson
              </p>

              <MemberSelector
                members={members}
                selected={
                  chairpersonCode
                    ? [chairpersonCode]
                    : []
                }
                onChange={(codes) =>
                  setChairpersonCode(
                    codes[0] || ""
                  )
                }
                multiple={false}
              />

            </div>

            <div>

              <p className="mb-2 text-sm font-bold text-[#003B75]">
                Committee Members
              </p>

              <MemberSelector
                members={members}
                selected={memberCodes}
                onChange={setMemberCodes}
              />

            </div>

            <input
              type="number"
              value={displayOrder}
              onChange={(e) =>
                setDisplayOrder(
                  Number(e.target.value)
                )
              }
              placeholder="Display Order"
              className="w-full rounded-xl border p-3"
            />

            <div className="flex gap-3">

              <button
                onClick={handleSave}
                className="flex-1 rounded-xl bg-[#003B75] py-3 font-bold text-white"
              >
                {editingId
                  ? "Update"
                  : "Save"}
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
                {/* Committees List */}

        <div className="space-y-3">

          {committees.length === 0 ? (

            <div className="rounded-xl bg-white p-6 text-center shadow-sm">

              <p className="font-semibold text-gray-500">
                No Committees Added
              </p>

            </div>

          ) : (

            committees.map((item) => {

              const chairperson = members.find(
                (m) =>
                  m.memberCode ===
                  item.chairpersonCode
              );

              return (

                <div
                  key={item.id}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <h3 className="text-lg font-bold text-[#003B75]">
                        {item.committeeName}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {item.lionYear}
                      </p>

                    </div>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      #{item.displayOrder}
                    </span>

                  </div>

                  <div className="mt-4 space-y-2">

                    <p className="text-sm">
                      <span className="font-bold">
                        Chairperson :
                      </span>{" "}
                      {chairperson?.name ||
                        "-"}
                    </p>

                    <p className="text-sm">
                      <span className="font-bold">
                        Members :
                      </span>{" "}
                      {item.memberCodes
                        ?.length || 0}
                    </p>

                  </div>

                  <div className="mt-5 flex gap-3">

                    <button
                      onClick={() =>
                        handleEdit(item)
                      }
                      className="flex-1 rounded-xl bg-amber-500 py-2 text-sm font-bold text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(item.id)
                      }
                      className="flex-1 rounded-xl bg-red-600 py-2 text-sm font-bold text-white"
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