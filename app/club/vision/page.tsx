"use client";

import { useRouter } from "next/navigation";
import { Target, TrendingUp, ShieldCheck } from "lucide-react";

export default function VisionPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b-4 border-[#F2A900] bg-[#003B75] shadow-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-white">Our Vision</h1>
            <p className="text-[11px] text-white/80">Lions Club of Sinnar City</p>
          </div>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#003B75] shadow"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-md space-y-6 px-4">
        
        {/* Intro */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border-l-4 border-[#003B75]">
          <h2 className="text-lg font-bold text-[#003B75] mb-2">Empowering Lives</h2>
          <p className="text-sm leading-7 text-gray-700">
            Our vision is to be the catalyst for positive change, creating a community where everyone has access to education, healthcare, and a supportive environment to thrive.
          </p>
        </section>

        {/* Unified Strategy Card */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Our Core Pillars</h3>
          <div className="space-y-5">
            <div>
              <h4 className="text-sm font-bold text-[#003B75] flex items-center gap-2">
                <ShieldCheck size={16} /> Service with Integrity
              </h4>
              <p className="text-xs text-gray-600 mt-1 pl-6">Transparency in every humanitarian effort.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#003B75] flex items-center gap-2">
                <Target size={16} /> Empowering Potential
              </h4>
              <p className="text-xs text-gray-600 mt-1 pl-6">Resources for dignified living.</p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#003B75] flex items-center gap-2">
                <Target size={16} /> Fostering Unity
              </h4>
              <p className="text-xs text-gray-600 mt-1 pl-6">Expertise-led community development.</p>
            </div>
          </div>
        </section>

        {/* Future Roadmap */}
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Future Roadmap</h3>
          <div className="space-y-3 text-xs text-gray-600">
            <p>• <b>Education:</b> Model school for underprivileged children.</p>
            <p>• <b>Healthcare:</b> Specialized hospital for affordable care.</p>
            <p>• <b>Community:</b> Vocational training & skill-building hubs.</p>
          </div>
        </section>

        {/* Footer */}
        <section className="text-center pt-2">
          <p className="text-xs italic text-gray-500">
            “Together, we don’t just change lives; we change the world.”
          </p>
        </section>
      </div>
    </main>
  );
}