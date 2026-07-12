"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/src/firebase/config";

interface Committee {
  id: string;
  lionYear: string;
  committeeName: string;
  chairpersonCode: string;
  memberCodes: string[];
}

interface Member {
  id: string;
  memberCode: string;
  name: string;
}

export default function CommitteeDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const [loading, setLoading] = useState(true);

  const [committee, setCommittee] =
    useState<Committee | null>(null);

  const [chairperson, setChairperson] =
    useState<Member | null>(null);

  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    loadCommittee();
  }, []);

  async function loadCommittee() {
    try {
      const committeeId = params.id as string;

      const committeeRef = doc(
        db,
        "committees",
        committeeId
      );

      const committeeSnap =
        await getDoc(committeeRef);

      if (!committeeSnap.exists()) {
        setLoading(false);
        return;
      }

      const committeeData = {
        id: committeeSnap.id,
        ...(committeeSnap.data() as Omit<
          Committee,
          "id"
        >),
      };

      setCommittee(committeeData);

      const memberSnap = await getDocs(
        collection(db, "members")
      );

      const memberData: Member[] =
        memberSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Member, "id">),
        }));

      setChairperson(
        memberData.find(
          (m) =>
            m.memberCode ===
            committeeData.chairpersonCode
        ) || null
      );

      setMembers(
        memberData.filter((m) =>
          committeeData.memberCodes.includes(
            m.memberCode
          )
        )
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#003B75] border-t-transparent"></div>

          <p className="font-bold text-[#003B75]">
            Loading Committee...
          </p>
        </div>
      </main>
    );
  }

  if (!committee) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        Committee not found.
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
              Committee
            </h1>

            <p className="text-[11px] text-white/80">
              Lions Club of Sinnar City
            </p>

          </div>

          <button
            onClick={() =>
              router.push("/club/committees")
            }
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#003B75]"
          >
            ← Back
          </button>

        </div>

      </div>

      <div className="mx-auto mt-5 max-w-md space-y-4 px-4">

        {/* Committee */}

        <div className="rounded-2xl border-l-4 border-[#F2A900] bg-white p-5 shadow-sm">

          <h2 className="text-xl font-bold text-[#003B75]">
            {committee.committeeName}
          </h2>

          <p className="mt-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
            {committee.lionYear}
          </p>

        </div>

        {/* Chairperson */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">
            Chairperson
          </p>

          {chairperson ? (

            <div
              onClick={() =>
                router.push(
                  `/members/${chairperson.id}`
                )
              }
              className="cursor-pointer rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50"
            >

              <h3 className="text-lg font-bold text-[#003B75]">
                {chairperson.name}
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                {chairperson.memberCode}
              </p>

            </div>

          ) : (

            <p className="text-sm text-gray-500">
              Chairperson not assigned
            </p>

          )}

        </div>

        {/* Members */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center justify-between">

            <h3 className="text-sm font-bold uppercase tracking-wide text-[#003B75]">
              Committee Members
            </h3>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">
              {members.length}
            </span>

          </div>

          <div className="space-y-2">

            {members.length === 0 ? (

              <p className="text-sm text-gray-500">
                No Members Assigned
              </p>

            ) : (

              members.map((member) => (

                <div
                  key={member.id}
                  onClick={() =>
                    router.push(
                      `/members/${member.id}`
                    )
                  }
                  className="cursor-pointer rounded-xl border border-gray-200 px-4 py-3 transition hover:bg-gray-50"
                >

                  <p className="font-semibold text-[#003B75]">
                    {member.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {member.memberCode}
                  </p>

                </div>

              ))

            )}

          </div>

        </div>

      </div>

    </main>
  );
}