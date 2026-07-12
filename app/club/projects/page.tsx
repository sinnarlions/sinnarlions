"use client";

import { useRouter } from "next/navigation";

export default function ProjectsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b-4 border-[#F2A900] bg-[#003B75] shadow-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-white">
              Permanent Projects
            </h1>

            <p className="text-[11px] text-white/80">
              Lions Club of Sinnar City
            </p>
          </div>

          <button
            onClick={() => router.push("/club")}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#003B75] hover:bg-gray-100"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto mt-10 max-w-md px-4">
        <div className="rounded-2xl border-l-4 border-[#F2A900] bg-white p-8 text-center shadow-sm">
          <div className="mb-4 text-5xl">🚧</div>

          <h2 className="text-xl font-bold text-[#003B75]">
            Permanent Projects
          </h2>

          <p className="mt-4 text-sm leading-6 text-gray-600">
            This section is currently under development.
          </p>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Permanent Projects will be available in a future update.
          </p>

          <div className="mt-6 inline-block rounded-full bg-[#003B75]/10 px-4 py-2 text-xs font-bold text-[#003B75]">
            Coming Soon
          </div>
        </div>
      </div>
    </main>
  );
}