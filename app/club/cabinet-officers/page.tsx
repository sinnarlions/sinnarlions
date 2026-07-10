"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/src/firebase/config";

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

interface CabinetOfficerView {
  id: string;
  lionYear: string;
  role: string;
  memberCode: string;
  memberId: string;
  memberName: string;
}

export default function CabinetOfficersPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [officers, setOfficers] = useState<
    CabinetOfficerView[]
  >([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Members

      const memberSnap = await getDocs(
        collection(db, "members")
      );

      const members: Member[] = memberSnap.docs.map(
        (doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Member, "id">),
        })
      );

      // Cabinet Officers

      const officerSnap = await getDocs(
        collection(db, "cabinetOfficers")
      );

      const cabinet: CabinetOfficer[] =
        officerSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<
            CabinetOfficer,
            "id"
          >),
        }));

      const data: CabinetOfficerView[] =
        cabinet.map((item) => {
          const member = members.find(
            (m) =>
              m.memberCode === item.memberCode
          );

          return {
            id: item.id,
            lionYear: item.lionYear,
            role: item.role,
            memberCode: item.memberCode,
            memberId: member?.id || "",
            memberName:
              member?.name || item.memberCode,
          };
        });

      data.sort((a, b) => {
        if (a.lionYear !== b.lionYear) {
          return b.lionYear.localeCompare(
            a.lionYear
          );
        }

        return a.role.localeCompare(b.role);
      });

      setOfficers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
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
              Lions Club of Sinnar City
            </p>
          </div>

          <button
            onClick={() => router.push("/club")}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#003B75]"
          >
            ← Back
          </button>

        </div>

      </div>

      <div className="mx-auto mt-5 max-w-md space-y-3 px-4">

        {officers.length === 0 ? (

          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-bold text-gray-500">
              No Cabinet Officers Found
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Please add Cabinet Officers from Super Admin.
            </p>
          </div>

        ) : (

          officers.map((item) => (

            <div
              key={item.id}
              onClick={() =>
                item.memberId &&
                router.push(`/member/${item.memberId}`)
              }
              className="cursor-pointer rounded-xl border-l-4 border-cyan-500 bg-white px-4 py-3 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between">

                <div>

                  <p className="text-[11px] font-bold uppercase tracking-wide text-cyan-700">
                    {item.role}
                  </p>

                  <h2 className="mt-1 text-[17px] font-bold text-[#003B75]">
                    {item.memberName}
                  </h2>

                  <p className="text-xs text-gray-500">
                    {item.memberCode}
                  </p>

                </div>

                <div className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-bold text-cyan-800">
                  {item.lionYear}
                </div>

              </div>

            </div>

          ))

        )}

      </div>

    </main>
  );
}