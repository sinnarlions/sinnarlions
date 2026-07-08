"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { collection, getDocs, query, where, limit, doc, getDoc } from "firebase/firestore";
import { db } from "@/src/firebase/config";

// तारीख फॉरमॅट फंक्शन
const formatWithoutYear = (dateString: string) => {
  if (!dateString || dateString === "-") return "-";

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const parts = dateString.split(".");

  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);

    if (!isNaN(day) && month >= 1 && month <= 12) {
      return `${day} ${months[month - 1]}`;
    }
  }

  return dateString;
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
      const docRef = doc(db, "members", targetId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setMember({ id: docSnap.id, ...docSnap.data() });
        return;
      }

      const q = query(collection(db, "members"), where("memberCode", "==", targetId), limit(1));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const foundDoc = querySnapshot.docs[0];
        setMember({ id: foundDoc.id, ...foundDoc.data() });
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
          <p className="text-[#00529B] font-bold tracking-wide text-sm">Loading Profile...</p>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
        <div className="bg-white border-l-4 border-red-500 rounded-2xl p-6 shadow-sm max-w-sm w-full text-center">
          <p className="text-red-600 font-bold text-base">Member Profile Not Found</p>
          <button onClick={() => router.push("/members")} className="mt-4 bg-[#00529B] text-white text-xs px-4 py-2 rounded-xl font-bold">
            Go Back to Directory
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-12 font-sans antialiased">
      <div className="border-b-4 border-[#F2A900] bg-[#003B75] shadow-md sticky top-0 z-20 text-white">
        <div className="max-w-md mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight text-white">LIONS CONNECT</h1>
          <button onClick={() => router.push("/members")} className="bg-[#00529B] border border-[#F2A900]/30 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs hover:bg-[#F2A900] hover:text-[#003B75] active:scale-95 transition-all shadow-sm">
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-4">
        {/* Header Card with Photo */}
        <div className="bg-[#003B75] rounded-3xl shadow-md p-6 border border-[#002D62]/30 text-white">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-20 h-20 rounded-full border-4 border-[#F2A900] overflow-hidden shadow-lg bg-white flex items-center justify-center flex-shrink-0">
              {member.photoUrl ? (
                <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#003B75] font-black text-3xl">{member.name?.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight">{member.name}</h2>
              {member.memberCode && <p className="mt-1 text-[#F2A900] text-xs font-bold tracking-wider uppercase">ID: {member.memberCode}</p>}
            </div>
          </div>
          <div className="flex gap-2.5">
            {member.mobile && (
              <a href={`tel:${member.mobile}`} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-green-700 active:scale-95 transition-all flex items-center gap-1.5">📞 Call</a>
            )}
            {member.mobile && (
              <a href={`https://wa.me/91${member.mobile.replace(/\D/g, '')}`} target="_blank" className="bg-white text-[#003B75] px-4 py-2 rounded-xl font-bold text-xs shadow-md hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-1.5">💬 WhatsApp</a>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border border-l-4 border-l-[#00529B] border-gray-100">
          <h3 className="mb-4 text-xs font-bold text-[#00529B] uppercase tracking-wider">Lions Club Information</h3>
          <div className="space-y-4">
            <div><p className="text-[11px] font-bold text-gray-400 uppercase">Role</p><p className="font-bold text-sm text-[#003B75]">{member.currentLionsRole || "-"}</p></div>
            <div><p className="text-[11px] font-bold text-gray-400 uppercase">Year Joined</p><p className="font-semibold text-sm text-gray-800">{member.yearJoinedLions || "-"}</p></div>
            <div><p className="text-[11px] font-bold text-gray-400 uppercase">Past Positions</p><p className="font-semibold text-sm text-gray-800">{member.pastPositions || "-"}</p></div>
            <div><p className="text-[11px] font-bold text-gray-400 uppercase">Awards</p><p className="font-semibold text-sm text-gray-800">{member.awardsAchievements || "-"}</p></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h3 className="mb-4 text-xs font-bold text-[#00529B] uppercase tracking-wider">Personal Information</h3>
          <div className="space-y-4">
            <div><p className="text-[11px] font-bold text-gray-400 uppercase">Mobile</p><p className="font-semibold text-sm text-gray-800">{member.mobile || "-"}</p></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
  <p className="text-[11px] font-bold text-gray-400 uppercase">
    Email
  </p>
  <p className="font-semibold text-sm text-gray-800 break-all">
    {member.email || "-"}
  </p>
</div>

<div>
  <p className="text-[11px] font-bold text-gray-400 uppercase">
    Birthday
  </p>
  <p className="font-semibold text-sm text-gray-800">
    {formatWithoutYear(member.dob || "-")}
  </p>
</div>
            </div>
            <div><p className="text-[11px] font-bold text-gray-400 uppercase">Address</p><p className="font-semibold text-sm text-gray-800">{member.address || "-"}</p></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
          <h3 className="mb-4 text-xs font-bold text-[#00529B] uppercase tracking-wider">Professional Information</h3>
          <div className="space-y-4">
            <div><p className="text-[11px] font-bold text-gray-400 uppercase">Profession</p><p className="font-semibold text-sm text-gray-800">{member.profession || "-"}</p></div>
            <div><p className="text-[11px] font-bold text-gray-400 uppercase">Company</p><p className="font-semibold text-sm text-gray-800">{member.companyName || "-"}</p></div>
            <div><p className="text-[11px] font-bold text-gray-400 uppercase">Title</p><p className="font-semibold text-sm text-gray-800">{member.jobTitle || "-"}</p></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
  <h3 className="mb-4 text-xs font-bold text-[#00529B] uppercase tracking-wider">
    Family Information
  </h3>

  <div className="space-y-4">

    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase">
        Spouse Name
      </p>
      <p className="font-semibold text-sm text-gray-800">
        {member.spouseName || "-"}
      </p>
    </div>

    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase">
        Children
      </p>
      <p className="font-semibold text-sm text-gray-800 whitespace-pre-wrap">
    {member.childrenNames || "-"}
      </p>
    </div>

    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase">
        Anniversary
      </p>
      <p className="font-semibold text-sm text-gray-800">
        {formatWithoutYear(member.anniversary || "-")}
      </p>
    </div>

  </div>
</div>
      </div>
    </main>
  );
}