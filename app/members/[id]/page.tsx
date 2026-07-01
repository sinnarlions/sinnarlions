"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { db } from "@/src/firebase/config";

// तारीखमधून वर्ष काढून '20 May' किंवा '20 Apr' असा सुंदर फॉरमॅट देणारे फंक्शन
const formatWithoutYear = (dateString: string) => {
  if (!dateString || dateString === "-") return "-";

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // जर युझरने डेटाबेसमध्ये आधीच अक्षरी तारीख लिहिली असेल (उदा. "20 May 1975" किंवा "20 May")
  // तर ते फक्त ४ अंकी वर्ष गाळून टाकेल
  let cleanString = dateString.replace(/\b\d{4}\b/g, '').trim();
  
  // जर तारीख शुद्ध अंकात असेल (उदा. 20.04.1975, 20/04/1975, 20-04-1975)
  const parts = cleanString.split(/[-./]/);
  if (parts.length >= 2) {
    const day = parseInt(parts[0].trim(), 10);
    const monthIndex = parseInt(parts[1].trim(), 10) - 1;

    // जर दिवस आणि महिना दोन्ही योग्य नंबर असतील
    if (!isNaN(day) && !isNaN(monthIndex) && monthIndex >= 0 && monthIndex < 12) {
      return `${day} ${months[monthIndex]}`;
    }
  }

  // जर फॉरमॅट वेगळा असेल तर क्लीन केलेली स्ट्रिंग तशीच दाखवा
  return cleanString || "-";
};

export default function MemberProfilePage() {
  const router = useRouter();
  const params = useParams();

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const memberSession = localStorage.getItem("member");

    if (!memberSession) {
      router.push("/");
      return;
    }

    loadMember();
  }, []);

  const loadMember = async () => {
    try {
      const targetId = params.id as string;

      const { doc, getDoc } = await import("firebase/firestore");
      const docRef = doc(db, "members", targetId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setMember({
          id: docSnap.id,
          ...docSnap.data(),
        });
        return;
      }

      const q = query(
        collection(db, "members"),
        where("memberCode", "==", targetId),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const foundDoc = querySnapshot.docs[0];
        setMember({
          id: foundDoc.id,
          ...foundDoc.data(),
        });
      }
    } catch (error) {
      console.error("Error loading member profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#00529B] border-t-transparent"></div>
          <p className="text-[#00529B] font-bold tracking-wide text-sm">
            Loading Profile...
          </p>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="bg-white border-l-4 border-red-500 rounded-2xl p-6 shadow-sm max-w-sm w-full text-center">
          <p className="text-red-600 font-bold text-base">
            Member Profile Not Found
          </p>
          <button 
            onClick={() => router.push("/members")}
            className="mt-4 bg-[#00529B] text-white text-xs px-4 py-2 rounded-xl font-bold"
          >
            Go Back to Directory
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-12 font-sans antialiased">
      {/* Header - Official Lions Blue Theme */}
      <div className="border-b-4 border-[#F2A900] bg-[#003B75] shadow-md sticky top-0 z-20 text-white">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-white">
            LIONS CONNECT
          </h1>
          <button
            onClick={() => router.push("/members")}
            className="bg-[#00529B] border border-[#F2A900]/30 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs hover:bg-[#F2A900] hover:text-[#003B75] active:scale-95 transition-all shadow-sm"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-4">
        
        {/* Premium Official Lions Navy Blue Card Patch */}
        <div className="bg-[#003B75] rounded-3xl shadow-md p-6 border border-[#002D62]/30 text-white">
          <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">
            {member.name}
          </h2>

          {member.memberCode && (
            <p className="mt-2 text-[#F2A900] text-xs font-bold tracking-wider flex items-center gap-1.5 uppercase">
              <span>🦁</span> MEMBER ID: {member.memberCode}
            </p>
          )}

          {/* Quick Actions */}
          <div className="mt-5 flex gap-2.5">
            {member.mobile && (
              <a
                href={`tel:${member.mobile}`}
                className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-green-700 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span>📞</span> Call
              </a>
            )}

            {member.mobile && (
              <a
                href={`https://wa.me/91${member.mobile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#003B75] px-4 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <span className="text-green-600">💬</span> WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Box 1: Lions Information */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-l-4 border-l-[#00529B] border-gray-100">
          <h3 className="mb-4 text-xs font-bold text-[#00529B] uppercase tracking-wider flex items-center gap-2">
            <span>⚜️</span> Lions Club Information
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Current Role</p>
              <p className="font-bold text-sm text-[#003B75] mt-0.5">{member.currentLionsRole || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Year Joined</p>
              <p className="font-semibold text-sm text-gray-800 mt-0.5">{member.yearJoinedLions || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Past Positions</p>
              <p className="font-semibold text-sm text-gray-800 leading-relaxed mt-0.5">{member.pastPositions || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Awards & Achievements</p>
              <p className="font-semibold text-sm text-gray-800 leading-relaxed mt-0.5">{member.awardsAchievements || "-"}</p>
            </div>
          </div>
        </div>

        {/* Box 2: Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h3 className="mb-4 text-xs font-bold text-[#00529B] uppercase tracking-wider flex items-center gap-2">
            <span>👤</span> Personal Information
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Mobile</p>
              <p className="font-semibold text-sm text-gray-800 mt-0.5">{member.mobile || "-"}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Email</p>
                <p className="font-semibold text-sm text-gray-800 break-all mt-0.5">{member.email || "-"}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Birthday</p>
                <p className="font-semibold text-sm text-gray-800 mt-0.5">{formatWithoutYear(member.dob)}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Address</p>
              <p className="font-semibold text-sm text-gray-800 leading-relaxed mt-0.5">{member.address || "-"}</p>
            </div>
          </div>
        </div>

        {/* Box 3: Professional Information */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h3 className="mb-4 text-xs font-bold text-[#00529B] uppercase tracking-wider flex items-center gap-2">
            <span>💼</span> Professional Information
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Profession</p>
              <p className="font-semibold text-sm text-gray-800 mt-0.5">{member.profession || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Company Name</p>
              <p className="font-semibold text-sm text-gray-800 mt-0.5">{member.companyName || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Job Title</p>
              <p className="font-semibold text-sm text-gray-800 mt-0.5">{member.jobTitle || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Business Description</p>
              <p className="font-semibold text-sm text-gray-800 leading-relaxed mt-0.5">{member.businessDescription || "-"}</p>
            </div>
          </div>
        </div>

        {/* Box 4: Interests & Skills */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h3 className="mb-4 text-xs font-bold text-[#00529B] uppercase tracking-wider flex items-center gap-2">
            <span>🎨</span> Interests & Skills
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Hobbies</p>
              <p className="font-semibold text-sm text-gray-800 mt-0.5">{member.hobbies || "-"}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Special Skills</p>
              <p className="font-semibold text-sm text-gray-800 mt-0.5">{member.specialSkills || "-"}</p>
            </div>
          </div>
        </div>

        {/* Box 5: Family Information */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h3 className="mb-4 text-xs font-bold text-[#00529B] uppercase tracking-wider flex items-center gap-2">
            <span>👨‍👩‍👦</span> Family Information
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Spouse Name</p>
              <p className="font-semibold text-sm text-gray-800 mt-0.5">{member.spouseName || "-"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Spouse Birthday</p>
                <p className="font-semibold text-sm text-gray-800 mt-0.5">{formatWithoutYear(member.spouseDob)}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Anniversary</p>
                <p className="font-semibold text-sm text-gray-800 mt-0.5">{formatWithoutYear(member.anniversary)}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Children Names</p>
              <p className="font-semibold text-sm text-gray-800 mt-0.5">{member.childrenNames || "-"}</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}