"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/src/firebase/config";

interface ClubAward {
  id: string;
  title: string;
  year: string;
  level: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
}

export default function ClubAwardsPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [awards, setAwards] = useState<ClubAward[]>([]);

  useEffect(() => {
    loadAwards();
  }, []);

  async function loadAwards() {
    try {
      const snap = await getDocs(
        collection(db, "clubAwards")
      );

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ClubAward, "id">),
      }));

      data.sort(
        (a, b) =>
          (b.displayOrder || 0) -
          (a.displayOrder || 0)
      );

      setAwards(data);
    } catch (err) {
      console.error(err);
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
              Club Awards
            </h1>

            <p className="text-[11px] text-white/80">
              Lions Club of Sinnar City
            </p>

          </div>

          <button
            onClick={() => router.back()}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#003B75]"
          >
            ← Back
          </button>

        </div>

      </div>

      <div className="mx-auto mt-5 max-w-md space-y-4 px-4">
              {awards.length === 0 ? (

        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">

          <div className="text-5xl mb-3">
            🏆
          </div>

          <h2 className="text-lg font-bold text-[#003B75]">
            No Awards Yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Club awards will appear here.
          </p>

        </div>

      ) : (

        awards.map((item) => (

          <div
            key={item.id}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >

            <div className="flex items-start justify-between">

              <div>

                <h2 className="text-lg font-extrabold text-[#003B75]">
                  🏆 {item.title}
                </h2>

                <p className="mt-1 text-sm font-semibold text-gray-500">
                  {item.year}
                </p>

              </div>

              <span className="rounded-full bg-[#F2A900]/20 px-3 py-1 text-xs font-bold text-[#003B75]">
                {item.level}
              </span>

            </div>

            {item.description && (

              <div className="mt-4 border-t pt-4">

                <p className="text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                  {item.description}
                </p>

              </div>

            )}

          </div>

        ))

      )}
            </div>

    </main>
  );
}