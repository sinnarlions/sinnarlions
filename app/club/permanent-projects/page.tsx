"use client";

import { useRouter } from "next/navigation";
import { Trees, Stethoscope, BookOpen } from "lucide-react";

export default function PermanentProjectsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b-4 border-[#F2A900] bg-[#003B75] shadow-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-3 py-4">
          <div>
            <h1 className="text-lg font-bold text-white">Permanent Projects</h1>
            <p className="text-[10px] text-white/80">Lions Club of Sinnar City</p>
          </div>
          <button
            onClick={() => router.push("/club")}
            className="rounded-lg bg-white px-3 py-1 text-xs font-bold text-[#003B75] shadow"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto mt-4 max-w-md px-2 space-y-4">
        
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-5 text-lg font-bold text-[#003B75] text-center">Our Impact in Action</h2>

          <div className="space-y-4">
            
            {/* Education */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
              <div className="flex items-center gap-2 mb-2 text-blue-700">
                <BookOpen size={18} />
                <h3 className="font-bold text-sm">Education & Infrastructure</h3>
              </div>
              <ul className="text-xs leading-6 text-slate-700 list-disc pl-4 space-y-1">
                <li><span className="font-bold">RCC Water Tank:</span> Donated to Janata Vidyalaya, Dubere.</li>
                <li><span className="font-bold">Digital Learning:</span> TV set for Bhikusa High School.</li>
                <li><span className="font-bold">Cycle Bank:</span> Bicycles for Janata Vidyalaya, Bharvir.</li>
              </ul>
            </div>

            {/* Healthcare */}
            <div className="rounded-xl border border-red-100 bg-red-50 p-3">
              <div className="flex items-center gap-2 mb-2 text-red-700">
                <Stethoscope size={18} />
                <h3 className="font-bold text-sm">Healthcare Initiatives</h3>
              </div>
              <p className="text-xs leading-5 text-slate-700 mb-2">
                In collaboration with <span className="font-bold">SMBT Hospital</span>, we provide affordable care through:
              </p>
              <ul className="text-xs leading-5 text-slate-700 list-disc pl-4 space-y-0.5">
                <li>General & Eye Check-up Camps</li>
                <li>Dental Health Camps</li>
              </ul>
            </div>

            {/* Environment */}
            <div className="rounded-xl border border-green-100 bg-green-50 p-3">
              <div className="flex items-center gap-2 mb-2 text-green-700">
                <Trees size={18} />
                <h3 className="font-bold text-sm">Environmental Care</h3>
              </div>
              <p className="text-xs leading-5 text-slate-700">
                Working with <span className="font-bold">Vanaprasth Foundation</span> for mass tree plantation drives.
              </p>
            </div>

            {/* Recognition */}
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-3">
              <div className="flex items-center gap-2 mb-2 text-amber-700">
                <span className="text-sm">🏆</span>
                <h3 className="font-bold text-sm">Prestige Recognition</h3>
              </div>
              <p className="text-xs leading-5 text-slate-700">
                <span className="font-bold">Adarsh Shikshak Puraskar:</span> Honoring exceptional educators in Sinnar.
              </p>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}