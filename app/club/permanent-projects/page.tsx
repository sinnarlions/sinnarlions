"use client";

import { useRouter } from "next/navigation";
import { Trees, Stethoscope, BookOpen, Bike, Tv, Droplets } from "lucide-react";

export default function PermanentProjectsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b-4 border-[#F2A900] bg-[#003B75] shadow-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-white">Permanent Projects</h1>
            <p className="text-[11px] text-white/80">Lions Club of Sinnar City</p>
          </div>
          <button
            onClick={() => router.push("/club")}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#003B75] shadow"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="mx-auto mt-5 max-w-md space-y-4 px-4">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-[#003B75]">Our Impact in Action</h2>

          <div className="space-y-6">
            {/* Education & Infrastructure */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-3 text-blue-700">
                <BookOpen size={22} />
                <h3 className="font-bold text-lg">Education & Infrastructure</h3>
              </div>
              <ul className="text-sm leading-7 text-slate-700 list-disc pl-4 space-y-2">
                <li><span className="font-bold">RCC Water Tank:</span> Donated 1000L tank to Janata Vidyalaya, Dubere.</li>
                <li><span className="font-bold">Digital Learning:</span> TV set donated to Bhikusa High School, Sinnar.</li>
                <li><span className="font-bold">Cycle Bank:</span> Donation of bicycles to Janata Vidyalaya, Bharvir.</li>
              </ul>
            </div>

            {/* Healthcare */}
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <div className="flex items-center gap-2 mb-3 text-red-700">
                <Stethoscope size={22} />
                <h3 className="font-bold text-lg">Healthcare Initiatives</h3>
              </div>
              <p className="text-sm leading-7 text-slate-700 mb-2">
                In collaboration with <span className="font-bold">SMBT Hospital</span>, we treat needy patients at affordable costs.
              </p>
              <ul className="text-sm leading-7 text-slate-700 list-disc pl-4 space-y-1">
                <li>General Health Check-up Camps</li>
                <li>Eye Check-up Camps</li>
                <li>Dental Check-up Camps</li>
              </ul>
            </div>

            {/* Environment */}
            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-3 text-green-700">
                <Trees size={22} />
                <h3 className="font-bold text-lg">Environmental Care</h3>
              </div>
              <p className="text-sm leading-7 text-slate-700">
                Continuously working with <span className="font-bold">Vanaprasth Foundation</span> for mass tree plantation drives and supporting their environmental goals.
              </p>
            </div>

            {/* Recognition */}
            <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-center gap-2 mb-3 text-amber-700">
                <span className="text-xl">🏆</span>
                <h3 className="font-bold text-lg">Prestige Recognition</h3>
              </div>
              <p className="text-sm leading-7 text-slate-700">
                <span className="font-bold">Adarsh Shikshak Puraskar:</span> A highly prestigious award in Sinnar taluka to honor exceptional educators.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}