"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/firebase/config";

interface Member {
  id: string;
  name: string;
  memberCode?: string;
  currentLionsRole?: string;
}

export default function DirectorsPage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "members"));

      const data: Member[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Member, "id">),
      }));

      const cleanName = (name: string = "") =>
  name
    .replace(
      /^(Dr\.|Er\.|Prof\.|CA|Adv\.|Mr\.|Mrs\.|Ms\.|Lion)\s+/i,
      ""
    )
    .trim();

data.sort((a, b) =>
  cleanName(a.name).localeCompare(cleanName(b.name), "en", {
    sensitivity: "base",
  })
);

      setMembers(data);
    } catch (error) {
      console.error("Error loading directors:", error);
    } finally {
      setLoading(false);
    }
  };

  const directors = members.filter(
    (member) => member.currentLionsRole === "Director"
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#003B75] border-t-transparent"></div>
          <p className="text-sm font-bold text-[#003B75]">
            Loading Directors...
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
              Board of Directors
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
        {directors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center">
            <h2 className="text-lg font-bold text-gray-500">
              No Directors Assigned
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Super Admin can assign Directors later.
            </p>
          </div>
        ) : (
          directors.map((member) => (
            <div
              key={member.id}
              onClick={() => router.push(`/members/${member.id}`)}
              className="rounded-xl border-l-4 border-[#F2A900] bg-white px-4 py-2.5 shadow-sm cursor-pointer hover:shadow-md active:scale-[0.99] transition"
            >
              <p className="text-sm font-semibold text-black">
                Director
              </p>

              <h2 className="mt-0.5 text-[17px] font-bold text-[#003B75] leading-tight">
                {member.name}
              </h2>

              <p className="text-xs font-semibold text-gray-500 mt-0.5">
                {member.memberCode || "-"}
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}