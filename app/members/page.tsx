"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/firebase/config";

export default function MembersPage() {
  const router = useRouter();

  const [members, setMembers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const member = localStorage.getItem("member");

  if (!member) {
    router.replace("/login");
    return;
  }

  try {
    JSON.parse(member);
    loadMembers();
  } catch {
    localStorage.removeItem("member");
    router.replace("/login");
  }
}, [router]);

  const loadMembers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "members"));

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Name sort
      data.sort((a: any, b: any) =>
        (a.name || "").localeCompare(b.name || "")
      );

      setMembers(data);
    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const searchTerm = search.toLowerCase().trim();

    return (
      (member.name || "").toLowerCase().includes(searchTerm) ||
      (member.spouseName || "").toLowerCase().includes(searchTerm) ||
      (member.profession || "").toLowerCase().includes(searchTerm) ||
      (member.companyName || "").toLowerCase().includes(searchTerm) ||
      (member.jobTitle || "").toLowerCase().includes(searchTerm) ||
      (member.specialSkills || "").toLowerCase().includes(searchTerm) ||
      (member.memberCode || "").toLowerCase().includes(searchTerm) ||
      (member.currentLionsRole || "").toLowerCase().includes(searchTerm) ||
      (member.pastPositions || "").toLowerCase().includes(searchTerm) ||
      (member.mobile || "").toLowerCase().includes(searchTerm)
    );
  });

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-12 font-sans antialiased">
      {/* Official Lions Club Header Section */}
      <div className="bg-[#003B75] text-white border-b-4 border-[#F2A900] shadow-md sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>🦁</span> Members Directory
            </h1>
            <button
              onClick={() => router.push("/")}
              className="bg-[#00529B] border border-[#F2A900]/40 text-white px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-[#F2A900] hover:text-[#003B75] active:scale-95 transition-all shadow-sm"
            >
              Home
            </button>
          </div>
          
          {/* Reactive Badge Count Summary */}
          <div className="mt-1 text-xs font-medium text-white/80">
            {search.trim() ? (
              <span className="bg-[#00529B] text-[#F2A900] px-2.5 py-0.5 rounded-full border border-[#F2A900]/20">
                Showing {filteredMembers.length} Results
              </span>
            ) : (
              <span className="bg-[#00529B] text-white px-2.5 py-0.5 rounded-full">
                Total Members: {members.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Directory Content Body */}
      <div className="max-w-md mx-auto px-4 mt-5">
        
        {/* Modern Clean Search input */}
        <div className="mb-4">
          <div className="relative shadow-sm rounded-2xl">
            <input
              type="text"
              placeholder="Search Name, ID, Post, Profession, Skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white p-3.5 pl-11 text-sm text-[#003B75] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00529B] focus:border-transparent placeholder:text-gray-400 font-medium transition-all"
            />
            <div className="absolute left-4 top-3.5 text-gray-400 text-sm pointer-events-none">
              🔍
            </div>
          </div>
        </div>

        {/* Dynamic State Layout Rendering */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#00529B] border-t-transparent"></div>
            <p className="text-[#00529B] font-bold text-sm tracking-wide">Loading Directory...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <p className="text-gray-400 font-bold text-base">No Members Found</p>
          </div>
        ) : (
          /* Professional Modern Lions List View Stack */
          <div className="space-y-2.5">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => router.push(`/members/${member.id}`)}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-[#00529B]/20 active:scale-[0.99] transition-all flex flex-col justify-center gap-1 group"
              >
                {/* Top Row: Name and Member Code Side by Side */}
                <div className="flex items-center justify-between gap-3">
                  {/* Clean Bold Member Name */}
                  <h2 className="text-base font-bold text-[#003B75] truncate tracking-tight group-hover:text-[#00529B] transition-colors flex-1">
                    {member.name}
                  </h2>

                  {/* Member Code positioned perfectly at the right corner */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {member.memberCode && (
                      <span className="text-xs font-bold tracking-wide text-[#00529B] bg-[#00529B]/5 border border-[#00529B]/10 px-2 py-0.5 rounded-lg uppercase">
                        {member.memberCode}
                      </span>
                    )}
                    
                    {/* Compact Arrow Indicator */}
                    <div className="text-gray-300 text-base font-black group-hover:text-[#00529B] group-hover:translate-x-0.5 transition-all">
                      ➔
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Clean text-only Role Context Footer */}
                <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  <span>👑</span> 
                  <span className={member.currentLionsRole?.trim() ? "text-[#00529B] font-semibold" : "text-gray-400"}>
                    {member.currentLionsRole?.trim() ? member.currentLionsRole : "Member"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}