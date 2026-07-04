"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/src/firebase/config";

export default function DigitalIDCardPage() {
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [presidentName, setPresidentName] = useState<string>("Club President");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCardData();
  }, []);

  const loadCardData = async () => {
    try {
      const memberString = localStorage.getItem("member");
      if (!memberString) {
        router.replace("/login");
        return;
      }

      const loggedInMember = JSON.parse(memberString);
      
      // 1. मेंबरचा डेटा लोड करणे
      const memberRef = doc(db, "members", loggedInMember.id);
      const memberSnap = await getDoc(memberRef);

      if (memberSnap.exists()) {
        const memberData = { id: memberSnap.id, ...memberSnap.data() };
        setMember(memberData);

        // 2. डेटाबेसमधून प्रेसिडेंटचे नाव डायनॅमिकली शोधणे
        // (तुमच्या 'members' कलेक्शनमध्ये ज्यांचा रोल President किंवा Club President असेल त्यांना शोधणे)
        const membersRef = collection(db, "members");
        const presidentQuery = query(
          membersRef, 
          where("currentLionsRole", "in", ["President", "Club President", "PRESIDENT"])
        );
        const presidentSnap = await getDocs(presidentQuery);
        
        if (!presidentSnap.empty) {
          // पहिला सापडलेला प्रेसिडेंट सेट करणे
          setPresidentName(presidentSnap.docs[0].data().name);
        }
      }
    } catch (error) {
      console.error("Error loading ID card data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0F172A] border-t-[#EAB308]"></div>
          <p className="text-[#0F172A] font-bold">Generating Digital ID Card...</p>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border-l-4 border-red-500 rounded-2xl p-6 shadow-md text-center max-w-sm w-full">
          <p className="text-red-600 font-bold">Member profile data not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 pb-12 select-none print:bg-white print:pb-0">
      
      {/* HEADER (PDF Print करताना लपेल) */}
      <div className="border-b border-slate-200 bg-[#0F172A] sticky top-0 z-10 shadow-sm print:hidden">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push("/my-profile")}
            className="text-[#EAB308] font-bold hover:text-white transition-colors flex items-center gap-1 text-sm cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="text-sm font-black text-white tracking-tight">Digital ID Card</h1>
          <button
            onClick={handleDownloadPDF}
            className="bg-[#EAB308] text-[#0F172A] px-3 py-1 rounded-md text-xs font-black hover:bg-white transition-colors cursor-pointer shadow-sm"
          >
            📥 PDF
          </button>
        </div>
      </div>

      {/* Container */}
      <div className="max-w-sm mx-auto px-4 mt-6 print:mt-0 print:px-0">
        
        {/* ================= MODERN CLEAN ID CARD ================= */}
{/* ✅ ही नवीन ओळ टाका: */}
<div className="relative w-full min-h-[540px] pb-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col justify-between text-center print:shadow-none print:border-slate-300">          
          {/* 1. TOP HEADER: Dark Navy Blue Background */}
          <div className="bg-[#0F172A] pt-6 pb-4 px-4 relative z-10">
            <div className="text-white font-black text-sm tracking-wider uppercase">
              LIONS CLUBS INTERNATIONAL
            </div>
            <div className="text-[#EAB308] font-bold text-[10px] tracking-widest uppercase mt-0.5">
              District 3234-D2 • LY 2026-2027
            </div>
            
            {/* Gold Wave SVG Effect at bottom of header */}
            <div className="absolute left-0 right-0 bottom-0 transform translate-y-[98%] overflow-hidden leading-[0] z-0">
              <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-7">
                <path d="M0.00,49.98 C150.00,150.00 349.20,-50.00 500.00,49.98 L500.00,0.00 L0.00,0.00 Z" className="fill-[#0F172A]"></path>
                <path d="M0.00,55.98 C150.00,156.00 349.20,-44.00 500.00,55.98" className="stroke-[#EAB308] stroke-[4] fill-none"></path>
              </svg>
            </div>
          </div>

          {/* 2. MIDDLE SECTION: Profile Photo (Thick Gold Border) */}
          <div className="flex flex-col items-center justify-center pt-4 z-10">
            <div className="relative">
              <div className="h-28 w-28 rounded-full border-4 border-[#EAB308] bg-slate-100 overflow-hidden shadow-md flex items-center justify-center">
                {member.photoUrl ? (
                  <img src={member.photoUrl} alt="ID Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-5xl">🦁</span>
                )}
              </div>
            </div>

            {/* Identity Text */}
            <div className="mt-3 space-y-0.5">
              <h2 className="text-[#0F172A] text-[15px] font-black tracking-tight leading-tight">
                {member.name}
              </h2>
              <div className="text-[#EAB308] text-xs font-extrabold tracking-widest uppercase">
                {member.currentLionsRole || "Club Member"}
              </div>
            </div>
          </div>

          {/* 3. DETAILS SECTION: Grid Info on White Background */}
          <div className="px-6 py-1.5 text-left space-y-1.5 z-10 max-w-[320px] mx-auto w-full">
            <div className="grid grid-cols-3 border-b border-slate-100 pb-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Member ID</span>
              <span className="col-span-2 text-[11px] font-bold text-slate-800 tracking-wide">: {member.memberCode || "-"}</span>
            </div>
            {member.profession && (
              <div className="grid grid-cols-3 border-b border-slate-100 pb-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Profession</span>
                <span className="col-span-2 text-[11px] font-semibold text-slate-700 truncate">: {member.profession}</span>
              </div>
            )}
            <div className="grid grid-cols-3 border-b border-slate-100 pb-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Email</span>
              <span className="col-span-2 text-[11px] font-semibold text-slate-700 truncate">: {member.email || "-"}</span>
            </div>
            <div className="grid grid-cols-3 items-start">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Address</span>
              <span className="col-span-2 text-[10px] font-medium text-slate-600 leading-tight">: {member.address || "-"}</span>
            </div>
            {/* ✅ हा नवीन बदल जोडा: */}
<div className="grid grid-cols-3 border-b border-slate-100 pb-1">
  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Valid Until</span>
  <span className="col-span-2 text-[11px] font-bold text-emerald-600 tracking-wide">: June 30, 2027</span>
</div>
          </div>

          {/* 4. FOOTER SECTION: Club Name & President Signature */}
          <div className="relative bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-end justify-between text-left">
            
            {/* Bottom Wave Effect decoration */}
            <div className="absolute left-0 right-0 top-0 transform -translate-y-[98%] overflow-hidden leading-[0] z-0">
              <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-5">
                <path d="M0.00,49.98 C150.00,-50.00 349.20,150.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" className="fill-slate-50"></path>
                <path d="M0.00,43.98 C150.00,-56.00 349.20,144.00 500.00,43.98" className="stroke-[#EAB308] stroke-[3] fill-none"></path>
              </svg>
            </div>

            <div className="z-10">
              <div className="text-slate-400 text-[8px] font-bold uppercase tracking-wider">Lions Club of</div>
              <div className="text-[#0F172A] text-xs font-black tracking-wide">Sinnar City</div>
              <div className="text-emerald-600 text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                ● Active Member
              </div>
            </div>
            
            {/* Dynamic Script President Signature */}
            <div className="text-center shrink-0 flex flex-col items-center z-10">
              <span 
                className="text-[#EAB308] text-base font-medium tracking-wide block leading-none pb-0.5 select-none"
                style={{ fontFamily: "'Brush Script MT', 'cursive', 'Bickham Script Pro'" }}
              >
                {presidentName}
              </span>
              <div className="w-20 border-b border-slate-300 my-1"></div>
              <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider block">
                Club President
              </span>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}