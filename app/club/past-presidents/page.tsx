"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "@/src/firebase/config";

interface PastPresident {
  id: string;
  year: string;
  memberCode: string;
  presidentName?: string;
  isCurrentMember?: boolean;
  displayOrder: number;
}

interface Member {
  id: string;
  memberCode: string;
  name: string;
}

interface PastPresidentItem {
  id: string;
  year: string;
  displayOrder: number;
  member?: Member;
  presidentName?: string;
  isCurrentMember?: boolean;
}

export default function PastPresidentsPage() {
  const router = useRouter();

  const [items, setItems] = useState<PastPresidentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPastPresidents();
  }, []);

  const loadPastPresidents = async () => {
    try {
      const ppSnapshot = await getDocs(
        collection(db, "pastPresidents")
      );

      const membersSnapshot = await getDocs(
        collection(db, "members")
      );

      const members: Member[] = membersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Member, "id">),
      }));

      const data: PastPresidentItem[] = ppSnapshot.docs.map((doc) => {
        const pp = {
          id: doc.id,
          ...(doc.data() as Omit<PastPresident, "id">),
        };

       return {
  id: pp.id,
  year: pp.year,
  displayOrder: pp.displayOrder,
  presidentName: pp.presidentName,
  isCurrentMember: pp.isCurrentMember,
  member: members.find(
    (m) => m.memberCode === pp.memberCode
  ),
};
      });

      data.sort(
        (a, b) => a.displayOrder - b.displayOrder
      );

      setItems(data);
    } catch (error) {
      console.error(
        "Error loading past presidents:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#003B75] border-t-transparent"></div>

          <p className="text-sm font-bold text-[#003B75]">
            Loading Past Presidents...
          </p>
        </div>
      </main>
    );
  }
    return (
    <main className="min-h-screen bg-[#F8F9FA] pb-10">

      {/* Header */}
      <div className="bg-[#003B75] border-b-4 border-[#F2A900] sticky top-0 z-20 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-xl font-bold text-white">
              Past Presidents
            </h1>

            <p className="text-[11px] text-white/80">
              Lions Club of Sinnar City
            </p>
          </div>

          <button
            onClick={() => router.push("/club")}
            className="bg-white text-[#003B75] px-3 py-1.5 rounded-lg text-xs font-bold shadow hover:bg-gray-100"
          >
            ← Back
          </button>

        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-3">

        {items.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <h2 className="text-lg font-bold text-gray-500">
              No Past Presidents Added
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Super Admin can add Past Presidents.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              onClick={() => {
 
                if (item.member) {
                  
                  router.push(`/members/${item.member.id}`);
                }
              }}
              className={`rounded-xl border-l-4 border-[#F2A900] bg-white px-4 py-2 shadow-sm transition ${
                item.member
                  ? "cursor-pointer hover:shadow-md active:scale-[0.99]"
                  : ""
              }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-black">
                {item.year}
              </p>

              <h2 className="mt-0.5 text-[16px] font-bold text-[#003B75] leading-tight">
  {item.member?.name || item.presidentName}
</h2>

           {item.member && (
  <p className="mt-0.5 text-[11px] font-medium text-gray-500">
    {item.member.memberCode}
  </p>
)}
            </div>
          ))
        )}

      </div>

    </main>
  );
}