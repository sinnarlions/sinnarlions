"use client";

import { useRouter } from "next/navigation";
import { Landmark, History, Heart, Target } from "lucide-react";

export default function ClubHistoryPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b-4 border-[#F2A900] bg-[#003B75] shadow-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-white">Club History</h1>
            <p className="text-[11px] text-white/80">Lions Club of Sinnar City</p>
          </div>
          <button
            onClick={() => router.push("/club/information")}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#003B75] shadow"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-md space-y-4 px-4">
        
        {/* Sections */}
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Landmark size={20} className="text-[#003B75]" />
            <h2 className="text-lg font-bold text-[#003B75]">Founded</h2>
          </div>
          <p className="text-sm leading-7 text-gray-700">
            Lions Club of Sinnar City was officially chartered on <b>8 February 1999</b>. 
            Sponsored by <b>Lions Club of Sangamner</b>, the club began its journey under the leadership of Charter President <b>Dr. Bharat H. Gare</b>.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <History size={20} className="text-[#003B75]" />
            <h2 className="text-lg font-bold text-[#003B75]">Our Journey</h2>
          </div>
          <p className="text-sm leading-7 text-gray-700">
            Over the years, more than <b>25 Presidents</b> have led the club, each contributing to impactful service projects. Today, we stand as one of the most respected organizations in the region.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Heart size={20} className="text-[#003B75]" />
            <h2 className="text-lg font-bold text-[#003B75]">Our Strength</h2>
          </div>
          <p className="text-sm leading-7 text-gray-700">
            Our membership includes doctors, engineers, professors, and professionals united by the motto <b>Service Above Self</b>. This expertise allows us to execute projects with efficiency and sustainability.
          </p>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Target size={20} className="text-[#003B75]" />
            <h2 className="text-lg font-bold text-[#003B75]">Our Mission</h2>
          </div>
          <p className="text-sm leading-7 text-gray-700">
            Our mission is to improve lives and strengthen communities through humanitarian service, compassion, and fellowship.
          </p>
        </section>

       {/* Simplified Footer Section */}
        <section className="rounded-2xl bg-white p-4 text-center shadow-sm border border-slate-100">
          <p className="text-xl font-black text-[#003B75]">WE SERVE</p>
          <div className="mx-auto my-2 h-0.5 w-10 bg-[#F2A900]" />
          <p className="italic text-gray-600 text-xs">
            “Alone we can do so little; together we can do so much.”
          </p>
          <p className="mt-1 text-[10px] font-bold text-[#003B75]">— Helen Keller</p>
          
          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[10px] font-bold text-gray-500">LIONS CLUB OF SINNAR CITY</p>
            <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-widest">Serving since 1999</p>
          </div>
        </section>

      </div>
    </main>
  );
}