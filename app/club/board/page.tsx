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
  photoUrl?: string;
}

const BOARD_ROLES = [
  "President",
  "Secretary",
  "Treasurer",
  "Immediate Past President",
  "First Vice President",
  "Second Vice President",
  "Third Vice President",
  "Joint Secretary",
  "Joint Treasurer",
  "PRO",
  "GMT Chairperson",
  "GLT Chairperson",
  "GST Chairperson",
  "Tail Tamer",
  "Tail Twister",
];

export default function BoardPage() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "members"));

        const list: Member[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Member, "id">),
        }));

        setMembers(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, []);

  const getMember = (role: string) =>
    members.find((m) => m.currentLionsRole === role);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto animate-spin rounded-full border-4 border-[#003B75] border-t-transparent" />
          <p className="mt-3 font-bold text-[#003B75]">
            Loading Board...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-10">
      <header className="sticky top-0 z-20 bg-[#003B75] border-b-4 border-[#F2A900] shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-white">
              Office Bearers
            </h1>

            <p className="text-xs text-[#F2A900]">
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
      </header>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-3">
        {BOARD_ROLES.map((role) => {
          const member = getMember(role);

          return (
            <div
              key={role}
              onClick={() => {
                if (member) {
                  router.push(`/members/${member.memberCode}`);
                }
              }}
              className={`rounded-xl border-l-4 border-[#F2A900] bg-white px-4 py-2 shadow-sm transition ${
                member
                  ? "cursor-pointer hover:shadow-md active:scale-[0.99]"
                  : ""
              }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-black">
                {role}
              </p>

              {member ? (
                <>
                  <h2 className="mt-1 text-[16px] font-bold text-[#003B75]">
                    {member.name}
                  </h2>

                  <p className="text-[11px] text-gray-500 font-medium">
                    {member.memberCode || "-"}
                  </p>
                </>
              ) : (
               <>
  <h2 className="mt-1 text-[12px] font-bold text-gray-400">
    Not Assigned
  </h2>

  <p className="mt-0.5 text-[11px] text-gray-300">
    Position Available
  </p>
</>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}