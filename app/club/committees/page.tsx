"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/firebase/config";

interface Committee {
  id: string;
  lionYear: string;
  committeeName: string;
  chairpersonCode: string;
  memberCodes: string[];
  displayOrder: number;
}

interface Member {
  id: string;
  memberCode: string;
  name: string;
}

interface CommitteeItem extends Committee {
  chairperson?: Member;
}

export default function CommitteesPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState<CommitteeItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const memberSnap = await getDocs(
        collection(db, "members")
      );

      const members: Member[] = memberSnap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Member, "id">),
      }));

      const committeeSnap = await getDocs(
        collection(db, "committees")
      );

      const data: CommitteeItem[] =
        committeeSnap.docs.map((doc) => {
          const committee = {
            id: doc.id,
            ...(doc.data() as Omit<Committee, "id">),
          };

          return {
            ...committee,
            chairperson: members.find(
              (m) =>
                m.memberCode ===
                committee.chairpersonCode
            ),
          };
        });

      data.sort((a, b) => {
        if (a.lionYear !== b.lionYear) {
          return b.lionYear.localeCompare(
            a.lionYear
          );
        }

        return a.displayOrder - b.displayOrder;
      });

      setItems(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
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
              Committees
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

        {items.length === 0 ? (

          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">

            <h2 className="text-lg font-bold text-gray-500">
              No Committees Available
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              No committee has been added yet.
            </p>

          </div>

        ) : (

          items.map((item) => (

            <div
              key={item.id}
              onClick={() =>
                router.push(
                  `/club/committees/${item.id}`
                )
              }
              className="cursor-pointer rounded-2xl border-l-4 border-[#F2A900] bg-white p-4 shadow-sm transition hover:shadow-md active:scale-[0.99]"
            >

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="text-lg font-bold text-[#003B75]">
                    {item.committeeName}
                  </h2>

                  <p className="mt-1 text-xs font-semibold text-gray-500">
                    {item.lionYear}
                  </p>

                </div>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-[11px] font-bold text-blue-700">
                  {item.memberCodes?.length || 0} Members
                </span>

              </div>

              <div className="mt-4">

                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  Chairperson
                </p>

                <p className="mt-1 text-[15px] font-bold text-[#003B75]">
                  {item.chairperson?.name || "-"}
                </p>

              </div>

            </div>

          ))

        )}

      </div>

    </main>
  );
}