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

  // प्रोफाइल कम्प्लिशन (%) लॉजिक
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
      
      let filledCount = 2; // नाव (locked) आणि मोबाईल (locked) हे आधीच भरलेले असतात.
      let totalFields = fieldsToTrack.length + 2;

      fieldsToTrack.forEach((field) => {
        if (member[field] && typeof member[field] === 'string' && member[field].trim() !== "") {
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

      // नाव लॉक असल्यामुळे ते अपडेट पेलोडमधून वगळले आहे
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

  const getVCardData = () => {
    if (!member) return "";
    return `BEGIN:VCARD\nVERSION:3.0\nN:${member.name || ""};;;\nFN:${member.name || ""}\nORG:${member.companyName || "Lions Club"}\nTITLE:${member.currentLionsRole || "Member"}\nTEL;TYPE=CELL:${member.mobile || ""}\nEMAIL;TYPE=PREF,INTERNET:${member.email || ""}\nADR;TYPE=HOME:;;${member.address || ""};;;;\nNOTE:Lions Member Code: ${member.memberCode || ""}\nEND:VCARD`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0A192F] border-t-[#D4AF37]"></div>
          <p className="text-[#0A192F] font-bold tracking-wide">Loading Profile...</p>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border-l-4 border-red-500 rounded-2xl p-6 shadow-md max-w-sm w-full text-center">
          <p className="text-red-600 font-bold text-lg">Member not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-8">
      {/* --- १. COMPACT HEADER (कमी उंची आणि स्पष्ट बटण) --- */}
      <div className="border-b border-slate-200 bg-[#0A192F] sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-[#D4AF37] font-bold hover:text-white transition-colors flex items-center gap-1 text-xs md:text-sm cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="text-sm md:text-base font-black text-white tracking-tight">Lions Connect</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide shadow-md transition-all active:scale-95 cursor-pointer ${
              isEditing ? "bg-slate-600 text-white hover:bg-slate-500" : "bg-[#D4AF37] text-[#0A192F] hover:bg-[#F3E5AB]"
            }`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 mt-3">
        {/* --- २. SLIM HERO CARD (नाव आणि QR शेजारी-शेजारी) --- */}
        <div className="bg-[#0A192F] rounded-xl p-3.5 shadow-md relative overflow-hidden text-white">
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="space-y-0.5 min-w-0">
              <span className="bg-[#D4AF37] text-[#0A192F] text-[9px] font-black px-1.5 py-0.2 rounded tracking-wider uppercase inline-block">
                {member.memberCode || "LIONS"}
              </span>
              <h2 className="text-lg md:text-2xl font-black tracking-tight text-white leading-tight truncate">{member.name}</h2>
              <p className="text-[11px] md:text-xs text-slate-300 font-medium truncate">
                🦁 {member.currentLionsRole || "Club Member"}
              </p>
            </div>
            
            {/* डिजिटल बिझनेस कार्ड ओळखण्यासाठी स्पष्ट नाव असलेले बटण */}
            <button
              onClick={() => setShowQRModal(true)}
              className="bg-[#112240] hover:bg-[#172A45] border border-[#D4AF37]/30 text-[#D4AF37] p-2 rounded-lg font-bold text-[10px] md:text-[11px] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm shrink-0"
            >
              📇 Business QR
            </button>
          </div>
        </div>

        {/* --- ३. स्वतंत्र प्रोग्रेस बार (स्वतंत्र पांढरे कार्ड आणि स्पष्ट नाव) --- */}
        <div className="bg-white rounded-xl p-3.5 mt-2.5 shadow-xs border border-slate-200">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] md:text-xs font-bold text-slate-500 tracking-wide uppercase">📈 Profile Completion Status</span>
            <span className="text-[#0A192F] font-black text-xs bg-slate-100 px-2 py-0.5 rounded">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-r from-[#0A192F] to-[#D4AF37] h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* --- FORM SECTIONS --- */}
        <div className="space-y-3.5 mt-3">
          {/* Section: Locked Info (नाव इथे लॉकड स्वरूपात सुरक्षित आहे) */}
          <div className="bg-white rounded-xl p-3.5 md:p-5 shadow-xs border border-slate-200">
            <h2 className="text-xs font-bold text-[#0A192F] mb-2.5 border-b border-slate-100 pb-1">🔒 Personal & Admin Info (Locked)</h2>
            <div className="grid gap-2.5 md:grid-cols-2">
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Full Name (पूर्ण नाव)</label>
                <div className="w-full rounded-lg bg-slate-50 border border-slate-200 p-2 text-xs text-slate-700 font-semibold">{member.name || "-"}</div>
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Mobile Number</label>
                <div className="w-full rounded-lg bg-slate-50 border border-slate-200 p-2 text-xs text-slate-700 font-semibold">{member.mobile || "-"}</div>
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Date of Birth</label>
                <div className="w-full rounded-lg bg-slate-50 border border-slate-200 p-2 text-xs text-slate-700 font-semibold">{member.dob || "-"}</div>
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Spouse Name</label>
                <div className="w-full rounded-lg bg-slate-50 border border-slate-200 p-2 text-xs text-slate-700 font-semibold">{member.spouseName || "-"}</div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Wedding Anniversary</label>
                <div className="w-full rounded-lg bg-slate-50 border border-slate-200 p-2 text-xs text-slate-700 font-semibold">{member.anniversary || "-"}</div>
              </div>
            </div>
          </div>

          {/* Section: Contact Info (एडिटेबल) */}
          <div className="bg-white rounded-xl p-3.5 md:p-5 shadow-xs border border-slate-200">
            <h2 className="text-xs font-bold text-[#0A192F] mb-2.5 border-b border-slate-100 pb-1">Contact Information</h2>
            <div className="space-y-2.5">
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">Email Address</label>
                <input
                  type="email"
                  value={member.email || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, email: e.target.value })}
                  className={`w-full rounded-lg border p-2 text-xs transition-all focus:outline-none ${
                    isEditing ? "bg-white border-[#0A192F] text-slate-800" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">Home Address</label>
                <textarea
                  rows={2}
                  value={member.address || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, address: e.target.value })}
                  className={`w-full rounded-lg border p-2 text-xs transition-all focus:outline-none resize-none ${
                    isEditing ? "bg-white border-[#0A192F] text-slate-800" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                  placeholder="Enter home address"
                />
              </div>
            </div>
          </div>

          {/* Section: Professional Info */}
          <div className="bg-white rounded-xl p-3.5 md:p-5 shadow-xs border border-slate-200">
            <h2 className="text-xs font-bold text-[#0A192F] mb-2.5 border-b border-slate-100 pb-1">Professional Information</h2>
            <div className="grid gap-2.5 md:grid-cols-2">
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">Profession</label>
                <input
                  type="text"
                  value={member.profession || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, profession: e.target.value })}
                  className={`w-full rounded-lg border p-2 text-xs transition-all focus:outline-none ${
                    isEditing ? "bg-white border-[#0A192F] text-slate-800" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                  placeholder="e.g. Business Owner"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">Company Name</label>
                <input
                  type="text"
                  value={member.companyName || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, companyName: e.target.value })}
                  className={`w-full rounded-lg border p-2 text-xs transition-all focus:outline-none ${
                    isEditing ? "bg-white border-[#0A192F] text-slate-800" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                  placeholder="Enter company name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">Job Title / Designation</label>
                <input
                  type="text"
                  value={member.jobTitle || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, jobTitle: e.target.value })}
                  className={`w-full rounded-lg border p-2 text-xs transition-all focus:outline-none ${
                    isEditing ? "bg-white border-[#0A192F] text-slate-800" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                  placeholder="e.g. Proprietor"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">Business Description</label>
                <textarea
                  rows={2}
                  value={member.businessDescription || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, businessDescription: e.target.value })}
                  className={`w-full rounded-lg border p-2 text-xs transition-all focus:outline-none resize-none ${
                    isEditing ? "bg-white border-[#0A192F] text-slate-800" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                  placeholder="Describe operations..."
                />
              </div>
            </div>
          </div>

          {/* Section: Extra Info */}
          <div className="bg-white rounded-xl p-3.5 md:p-5 shadow-xs border border-slate-200">
            <h2 className="text-xs font-bold text-[#0A192F] mb-2.5 border-b border-slate-100 pb-1">Interests & Family</h2>
            <div className="space-y-2.5">
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">Hobbies</label>
                <input
                  type="text"
                  value={member.hobbies || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, hobbies: e.target.value })}
                  className={`w-full rounded-lg border p-2 text-xs transition-all focus:outline-none ${
                    isEditing ? "bg-white border-[#0A192F] text-slate-800" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                  placeholder="e.g. Reading, Traveling"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">Special Skills</label>
                <input
                  type="text"
                  value={member.specialSkills || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, specialSkills: e.target.value })}
                  className={`w-full rounded-lg border p-2 text-xs transition-all focus:outline-none ${
                    isEditing ? "bg-white border-[#0A192F] text-slate-800" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                  placeholder="e.g. Public Speaking"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-500 mb-0.5">Children Names</label>
                <input
                  type="text"
                  value={member.childrenNames || ""}
                  readOnly={!isEditing}
                  onChange={(e) => setMember({ ...member, childrenNames: e.target.value })}
                  className={`w-full rounded-lg border p-2 text-xs transition-all focus:outline-none ${
                    isEditing ? "bg-white border-[#0A192F] text-slate-800" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}
                  placeholder="Enter children names"
                />
              </div>
            </div>
          </div>

          {/* Section: Lions Info */}
          <div className="bg-white rounded-xl p-3.5 md:p-5 shadow-xs border border-slate-200">
            <h2 className="text-xs font-bold text-[#0A192F] mb-2.5 border-b border-slate-100 pb-1">🦁 Lions Club History (Locked)</h2>
            <div className="space-y-2.5 text-xs text-slate-700 font-semibold">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Year Joined</label>
                  <div className="bg-slate-50 p-2 border border-slate-200 rounded-lg">{member.yearJoinedLions || "-"}</div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Current Role</label>
                  <div className="bg-slate-50 p-2 border border-slate-200 rounded-lg text-[#0A192F] font-bold">{member.currentLionsRole || "-"}</div>
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Past Positions Held</label>
                <div className="bg-slate-50 p-2 border border-slate-200 rounded-lg whitespace-pre-wrap font-medium">{member.pastPositions || "None"}</div>
              </div>
              <div>
                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">Awards & Achievements</label>
                <div className="bg-slate-50 p-2 border border-slate-200 rounded-lg whitespace-pre-wrap font-medium">{member.awardsAchievements || "None"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SAVE BUTTON --- */}
        {isEditing && (
          <div className="mt-5">
            <button
              onClick={saveProfile}
              className="bg-[#0A192F] text-white w-full py-3 rounded-lg font-bold tracking-wide shadow-md hover:bg-[#112240] transition-all duration-200 transform active:scale-[0.98] text-sm cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        )}
      </div>

      {/* --- QR CODE POPUP MODAL (Digital Business Card साठी) --- */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 text-center shadow-2xl relative">
            <h3 className="text-base font-black text-[#0A192F] mb-1">📇 Digital Business Card QR</h3>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              हा QR कोड इतर मेंबर्सनी स्कॅन केल्यास तुमची संपर्क माहिती (vCard) थेट त्यांच्या मोबाईल फोनमध्ये सेव्ह होईल.
            </p>
            
            <div className="bg-white p-3 rounded-xl inline-block shadow-xs border-2 border-[#D4AF37] mx-auto mb-4">
              <QRCodeSVG value={getVCardData()} size={180} level="M" includeMargin={true} />
            </div>

            <div className="text-sm font-bold text-[#0A192F] mb-0.5">{member.name}</div>
            <div className="text-xs text-slate-500 mb-4">{member.currentLionsRole}</div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
