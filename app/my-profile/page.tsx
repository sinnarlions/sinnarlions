"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/src/firebase/config";
import { QRCodeSVG } from "qrcode.react";

export default function MyProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    loadMyProfile();
  }, []);

  useEffect(() => {
    const handlePageShow = () => {
      const memberString = localStorage.getItem("member");
      if (!memberString) {
        router.replace("/login");
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [router]);

  // प्रोफाइल कम्प्लिशन (%) कॅल्क्युलेट करण्याचे लॉजिक
  useEffect(() => {
    if (member) {
      const fieldsToTrack = [
        "email",
        "address",
        "profession",
        "companyName",
        "jobTitle",
        "businessDescription",
        "hobbies",
        "specialSkills",
        "childrenNames"
      ];
      
      // कंपल्सरी ऍडमिन फील्ड्स आधीच भरलेले असतात म्हणून बेस २५% पासून सुरुवात करू
      let filledCount = 2; 
      let totalFields = fieldsToTrack.length + 2;

      fieldsToTrack.forEach((field) => {
        if (member[field] && member[field].trim() !== "") {
          filledCount++;
        }
      });

      const percentage = Math.round((filledCount / totalFields) * 100);
      setCompletionPercentage(percentage);
    }
  }, [member]);

  const loadMyProfile = async () => {
    try {
      const memberString = localStorage.getItem("member");
      if (!memberString) {
        router.replace("/login");
        return;
      }

      const loggedInMember = JSON.parse(memberString);
      const memberRef = doc(db, "members", loggedInMember.id);
      const memberSnap = await getDoc(memberRef);

      if (!memberSnap.exists()) {
        setLoading(false);
        return;
      }

      setMember({
        id: memberSnap.id,
        ...memberSnap.data(),
      });
    } catch (error) {
      console.error(error);
      localStorage.removeItem("member");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      if (!member?.id) return;

      await updateDoc(doc(db, "members", member.id), {
        email: member.email || "",
        address: member.address || "",
        profession: member.profession || "",
        companyName: member.companyName || "",
        jobTitle: member.jobTitle || "",
        businessDescription: member.businessDescription || "",
        hobbies: member.hobbies || "",
        specialSkills: member.specialSkills || "",
        childrenNames: member.childrenNames || "",
      });

      setIsEditing(false);
      alert("Profile updated successfully 🎉");
    } catch (error) {
      console.error(error);
      alert("Error saving profile");
    }
  };

  // vCard QR कोड डेटा तयार करणे (स्कॅन केल्यावर थेट कॉंटॅक्ट सेव्ह होईल)
  const getVCardData = () => {
    if (!member) return "";
    return `BEGIN:VCARD\nVERSION:3.0\nN:${member.name || ""};;;\nFN:${member.name || ""}\nORG:${member.companyName || "Lions Club"}\nTITLE:${member.currentLionsRole || "Member"}\nTEL;TYPE=CELL:${member.mobile || ""}\nEMAIL;TYPE=PREF,INTERNET:${member.email || ""}\nADR;TYPE=HOME:;;${member.address || ""};;;;\nNOTE:Lions Member Code: ${member.memberCode || ""}\nEND:VCARD`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A192F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent"></div>
          <p className="text-[#D4AF37] font-bold tracking-wide">Loading Profile...</p>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="min-h-screen bg-[#0A192F] flex items-center justify-center p-4">
        <div className="bg-white border-l-4 border-red-500 rounded-2xl p-6 shadow-md max-w-sm w-full text-center">
          <p className="text-red-600 font-bold text-lg">Member not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A192F] text-white pb-12">
      {/* --- HEADER --- */}
      <div className="border-b border-[#172A45] bg-[#0A192F]/90 backdrop-blur-md sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-[#D4AF37] font-bold hover:text-white transition-colors flex items-center gap-1 text-sm md:text-base cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">Lions Connect</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold tracking-wide shadow-md transition-all active:scale-95 cursor-pointer ${
              isEditing ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-[#D4AF37] text-[#0A192F] hover:bg-[#F3E5AB]"
            }`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        {/* --- MAIN PROFILE HERO CARD (Lions Theme) --- */}
        <div className="bg-[#112240] rounded-3xl p-6 md:p-8 border border-[#172A45] shadow-xl relative overflow-hidden">
          <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] font-black text-8xl uppercase tracking-wider pointer-events-none select-none">
            LIONS
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <span className="bg-[#D4AF37] text-[#0A192F] text-xs font-black px-3 py-1 rounded-md tracking-wider uppercase">
                {member.memberCode || "LIONS CLUB"}
              </span>
              <h2 className="text-2xl md:text-4xl font-black tracking-tight mt-3 text-white">{member.name}</h2>
              <p className="text-sm md:text-base text-gray-300 mt-1 font-medium">
                🦁 {member.currentLionsRole || "Club Member"}
              </p>
            </div>
            
            {/* डिजिटल बिझनेस कार्ड QR बटण */}
            <button
              onClick={() => setShowQRModal(true)}
              className="bg-[#172A45] hover:bg-[#233554] border border-[#D4AF37]/40 text-[#D4AF37] px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer w-full md:w-auto shadow-sm"
            >
              📇 Share Business QR
            </button>
          </div>

          {/* --- PROGRESS BAR (Profile Completion) --- */}
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <div className="flex justify-between items-center text-xs md:text-sm mb-2">
              <span className="text-gray-300 font-semibold">Profile Completion</span>
              <span className="text-[#D4AF37] font-bold">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-[#0A192F] rounded-full h-3 overflow-hidden border border-gray-800">
              <div
                className="bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            {completionPercentage === 100 && (
              <p className="text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1">🎉 Verified Profile</p>
            )}
          </div>
        </div>

        {/* --- FORM SECTIONS --- */}
        <div className="space-y-6 mt-6">
          {/* Section: Basic Info */}
          <div className="bg-[#112240] rounded-3xl p-6 md:p-8 border border-[#172A45] shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
              <h2 className="text-lg font-bold text-[#D4AF37]">🔒 Personal & Admin Info (Locked)</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Full Name</label>
                <div className="w-full rounded-xl bg-[#0A192F] border border-gray-800 p-3 text-sm text-gray-300 font-semibold">{member.name || "-"}</div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Mobile Number</label>
                <div className="w-full rounded-xl bg-[#0A192F] border border-gray-800 p-3 text-sm text-gray-300 font-semibold">{member.mobile || "-"}</div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Date of Birth</label>
                <div className="w-full rounded-xl bg-[#0A192F] border border-gray-800 p-3 text-sm text-gray-300 font-semibold">{member.dob || "-"}</div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Spouse Name</label>
                <div className="w-full rounded-xl bg-[#0A192F] border border-gray-800 p-3 text-sm text-gray-300 font-semibold">{member.spouseName || "-"}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Wedding Anniversary</label>
                <div className="w-full rounded-xl bg-[#0A192F] border border-gray-800 p-3 text-sm text-gray-300 font-semibold">{member.anniversary || "-"}</div>
              </div>
            </div>
          </div>

          {/* Section: Contact & Editable Info */}
          <div className="bg-[#112240] rounded-3xl p-6 md:p-8 border border-[#172A45] shadow-lg">
            <h2 className="text-lg font-bold text-[#D4AF37] mb-4 border-b border-gray-800 pb-3">Contact Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={member.email || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, email: e.target.value })}
                  className={`w-full rounded-xl border p-3 text-sm transition-all focus:outline-none focus:border-[#D4AF37] ${
                    isEditing ? "bg-[#0A192F] border-[#D4AF37] text-white" : "bg-[#0A192F]/50 border-gray-800 text-gray-400"
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Home Address</label>
                <textarea
                  rows={2}
                  value={member.address || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, address: e.target.value })}
                  className={`w-full rounded-xl border p-3 text-sm transition-all focus:outline-none focus:border-[#D4AF37] resize-none ${
                    isEditing ? "bg-[#0A192F] border-[#D4AF37] text-white" : "bg-[#0A192F]/50 border-gray-800 text-gray-400"
                  }`}
                  placeholder="Enter home address"
                />
              </div>
            </div>
          </div>

          {/* Section: Professional Info */}
          <div className="bg-[#112240] rounded-3xl p-6 md:p-8 border border-[#172A45] shadow-lg">
            <h2 className="text-lg font-bold text-[#D4AF37] mb-4 border-b border-gray-800 pb-3">Professional Information</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Profession</label>
                <input
                  type="text"
                  value={member.profession || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, profession: e.target.value })}
                  className={`w-full rounded-xl border p-3 text-sm transition-all focus:outline-none focus:border-[#D4AF37] ${
                    isEditing ? "bg-[#0A192F] border-[#D4AF37] text-white" : "bg-[#0A192F]/50 border-gray-800 text-gray-400"
                  }`}
                  placeholder="e.g. Business Owner, Engineer"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Company Name</label>
                <input
                  type="text"
                  value={member.companyName || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, companyName: e.target.value })}
                  className={`w-full rounded-xl border p-3 text-sm transition-all focus:outline-none focus:border-[#D4AF37] ${
                    isEditing ? "bg-[#0A192F] border-[#D4AF37] text-white" : "bg-[#0A192F]/50 border-gray-800 text-gray-400"
                  }`}
                  placeholder="Enter company name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Job Title / Designation</label>
                <input
                  type="text"
                  value={member.jobTitle || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, jobTitle: e.target.value })}
                  className={`w-full rounded-xl border p-3 text-sm transition-all focus:outline-none focus:border-[#D4AF37] ${
                    isEditing ? "bg-[#0A192F] border-[#D4AF37] text-white" : "bg-[#0A192F]/50 border-gray-800 text-gray-400"
                  }`}
                  placeholder="e.g. Director, Proprietor"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Business Description</label>
                <textarea
                  rows={3}
                  value={member.businessDescription || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, businessDescription: e.target.value })}
                  className={`w-full rounded-xl border p-3 text-sm transition-all focus:outline-none focus:border-[#D4AF37] resize-none ${
                    isEditing ? "bg-[#0A192F] border-[#D4AF37] text-white" : "bg-[#0A192F]/50 border-gray-800 text-gray-400"
                  }`}
                  placeholder="Describe your business operations..."
                />
              </div>
            </div>
          </div>

          {/* Section: Extra Info */}
          <div className="bg-[#112240] rounded-3xl p-6 md:p-8 border border-[#172A45] shadow-lg">
            <h2 className="text-lg font-bold text-[#D4AF37] mb-4 border-b border-gray-800 pb-3">Interests & Family</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Hobbies</label>
                <input
                  type="text"
                  value={member.hobbies || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, hobbies: e.target.value })}
                  className={`w-full rounded-xl border p-3 text-sm transition-all focus:outline-none focus:border-[#D4AF37] ${
                    isEditing ? "bg-[#0A192F] border-[#D4AF37] text-white" : "bg-[#0A192F]/50 border-gray-800 text-gray-400"
                  }`}
                  placeholder="e.g. Reading, Music, Traveling"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Special Skills</label>
                <input
                  type="text"
                  value={member.specialSkills || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, specialSkills: e.target.value })}
                  className={`w-full rounded-xl border p-3 text-sm transition-all focus:outline-none focus:border-[#D4AF37] ${
                    isEditing ? "bg-[#0A192F] border-[#D4AF37] text-white" : "bg-[#0A192F]/50 border-gray-800 text-gray-400"
                  }`}
                  placeholder="e.g. Public Speaking, Management"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-300 mb-1">Children Names</label>
                <input
                  type="text"
                  value={member.childrenNames || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, childrenNames: e.target.value })}
                  className={`w-full rounded-xl border p-3 text-sm transition-all focus:outline-none focus:border-[#D4AF37] ${
                    isEditing ? "bg-[#0A192F] border-[#D4AF37] text-white" : "bg-[#0A192F]/50 border-gray-800 text-gray-400"
                  }`}
                  placeholder="Enter children names"
                />
              </div>
            </div>
          </div>

          {/* Section: Lions Info (Locked) */}
          <div className="bg-[#112240] rounded-3xl p-6 md:p-8 border border-[#172A45] shadow-lg">
            <h2 className="text-lg font-bold text-[#D4AF37] mb-4 border-b border-gray-800 pb-3">🦁 Lions Club History (Locked)</h2>
            <div className="space-y-4 text-sm text-gray-300 font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Year Joined</label>
                  <div className="bg-[#0A192F] p-3 border border-gray-800 rounded-xl">{member.yearJoinedLions || "-"}</div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Current Role</label>
                  <div className="bg-[#0A192F] p-3 border border-gray-800 rounded-xl text-[#D4AF37] font-bold">{member.currentLionsRole || "-"}</div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Past Positions Held</label>
                <div className="bg-[#0A192F] p-3 border border-gray-800 rounded-xl whitespace-pre-wrap font-medium">{member.pastPositions || "None"}</div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Awards & Achievements</label>
                <div className="bg-[#0A192F] p-3 border border-gray-800 rounded-xl whitespace-pre-wrap font-medium">{member.awardsAchievements || "None"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SAVE BUTTON (Sticky Bottom Style) --- */}
        {isEditing && (
          <div className="mt-8">
            <button
              onClick={saveProfile}
              className="bg-[#D4AF37] text-[#0A192F] w-full py-4 rounded-xl font-bold tracking-wide shadow-lg hover:bg-[#F3E5AB] transition-all duration-200 transform active:scale-[0.98] text-base cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        )}
      </div>

      {/* --- QR CODE POPUP MODAL (Mobile First) --- */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#112240] border border-[#172A45] rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl relative">
            <h3 className="text-xl font-black text-white mb-2">Digital Business Card</h3>
            <p className="text-xs text-gray-300 mb-6">Scan this QR code to automatically save my contact info into your phone book!</p>
            
            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl inline-block shadow-md border-2 border-[#D4AF37] mx-auto mb-6">
              <QRCodeSVG value={getVCardData()} size={200} level="M" includeMargin={true} />
            </div>

            <div className="text-sm font-bold text-[#D4AF37] mb-2">{member.name}</div>
            <div className="text-xs text-gray-400 mb-6">{member.currentLionsRole}</div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}