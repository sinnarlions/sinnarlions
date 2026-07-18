"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/firebase/config";

interface Member {
  id: string;
  memberCode: string;
  name: string;
  spouseName?: string;
  spouseMemberId?: string;
}

export default function LinkSpousePage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSpouse, setSelectedSpouse] = useState<Record<string, string>>({});
  const [spouseSearch, setSpouseSearch] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState("");

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, "members"));
      const data: Member[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Member, "id">),
      }));

      const filtered = data.filter((m) => m.spouseName && m.spouseName.trim() !== "");
      filtered.sort((a, b) => a.name.localeCompare(b.name));
      setMembers(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Moved outside of loadMembers
  async function saveSpouse(member: Member) {
    const spouseCode = selectedSpouse[member.id];
    if (!spouseCode) return alert("Please select spouse.");

    const spouse = members.find((m) => m.memberCode === spouseCode);
    if (!spouse) return alert("Spouse not found.");

    try {
      setSaving(member.id);
      // Ensure you are using the correct doc ID (doc.id vs memberCode)
      await updateDoc(doc(db, "members", member.id), { spouseMemberId: spouse.memberCode });
      await updateDoc(doc(db, "members", spouse.id), { spouseMemberId: member.memberCode });

      alert("Spouse linked successfully.");
      await loadMembers();
      setSelectedSpouse({});
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    } finally {
      setSaving("");
    }
  }

  // ... (Keep your existing useMemo hooks and return statement below)
  // Ensure the return statement is clearly inside the exported function block
  const filteredMembers =
    useMemo(() => {
      return members.filter((m) => {
        const q =
          search.toLowerCase();

        return (
          m.name
            .toLowerCase()
            .includes(q) ||
          m.memberCode
            .toLowerCase()
            .includes(q)
        );
      });
    }, [members, search]);

  const stats =
    useMemo(() => {
      const total =
        members.length;

      const linked =
        members.filter(
          (m) =>
            m.spouseMemberId &&
            m.spouseMemberId !== ""
        ).length;

      return {
        total,
        linked,
        pending:
          total - linked,
      };
    }, [members]);
      return (
    <main className="min-h-screen bg-slate-100">
      <section className="mx-auto max-w-7xl p-5">

        <h1 className="text-3xl font-bold text-[#003B75]">
          Link Spouse
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Verify and link husband & wife members.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-xs text-slate-500">
              Total Members
            </p>

            <p className="mt-2 text-3xl font-bold text-[#003B75]">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-xs text-slate-500">
              Linked Couples
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats.linked}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow">
            <p className="text-xs text-slate-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {stats.pending}
            </p>
          </div>

        </div>

        <div className="mt-6">

          <input
            type="text"
            placeholder="Search member..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-[#003B75]"
          />

        </div>

        {loading ? (

          <div className="mt-8 rounded-2xl bg-white p-10 text-center">

            Loading...

          </div>

        ) : (

          <div className="mt-6 space-y-4">

            {filteredMembers.map((member) => (

              <div
                key={member.id}
                className="rounded-2xl bg-white p-5 shadow"
              >

                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-[#003B75]">
                      {member.name}
                    </h2>

                    <p className="text-sm text-slate-500">
                      {member.memberCode}
                    </p>

                    <p className="mt-3 text-sm">

                      <span className="font-semibold">
                        Spouse Name :
                      </span>

                      {" "}

                      {member.spouseName || "-"}

                    </p>

                    <p className="mt-1 text-sm">

                      <span className="font-semibold">
                        Current Link :
                      </span>

                      {" "}

                      {member.spouseMemberId || "Not Linked"}

                    </p>

                  </div>

                  <div className="w-full lg:w-80">

  <input
    type="text"
    placeholder="Search spouse..."
    value={spouseSearch[member.id] || ""}
    onChange={(e) =>
      setSpouseSearch({
        ...spouseSearch,
        [member.id]: e.target.value,
      })
    }
    className="mb-2 w-full rounded-xl border px-3 py-2"
  />

  <select
    value={selectedSpouse[member.id] || ""}
    onChange={(e) =>
      setSelectedSpouse({
        ...selectedSpouse,
        [member.id]: e.target.value,
      })
    }
    className="w-full rounded-xl border px-3 py-3"
  >
    <option value="">Select Spouse</option>

    {members
      .filter((m) => {
        if (m.memberCode === member.memberCode) return false;

        const q = (spouseSearch[member.id] || "").toLowerCase();

        return (
          m.name.toLowerCase().includes(q) ||
          m.memberCode.toLowerCase().includes(q)
        );
      })
      .map((m) => (
        <option key={m.id} value={m.memberCode}>
          {m.memberCode} - {m.name}
        </option>
      ))}
  </select>

  <button
    onClick={() => saveSpouse(member)}
    disabled={
      saving === member.id ||
      !selectedSpouse[member.id]
    }
    className="mt-3 w-full rounded-xl bg-[#003B75] px-4 py-3 font-semibold text-white hover:bg-blue-900 disabled:bg-slate-300"
  >
    {saving === member.id ? "Saving..." : "Save Link"}
  </button>

</div>

                </div>

              </div>

            ))}

            {filteredMembers.length === 0 && (

              <div className="rounded-2xl bg-white p-10 text-center text-slate-500">

                No members found.

              </div>

            )}

          </div>

        )}
              </section>
    </main>
  );
}