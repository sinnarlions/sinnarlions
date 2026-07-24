"use client";

import { useEffect, useState, useRef } from "react";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/src/firebase/config";
import { QRCodeSVG } from "qrcode.react";

export default function MyProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [feeStatus, setFeeStatus] = useState<string>("Checking...");

  const IMGBB_API_KEY = "5bb2b7c8e03b0f57750176b9d8108ef8";

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
        "childrenNames",
        "photoUrl"
      ];
      
      let filledCount = 2; 
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

      const memberData: any = {
        id: memberSnap.id,
        ...memberSnap.data(),
      };
      setMember(memberData);

      const primaryCode = memberData.memberCode || loggedInMember.memberCode;
      if (primaryCode) {
        const feesQuery = query(
          collection(db, "membershipFees"),
          where("primaryMemberCode", "==", primaryCode)
        );
        const feesSnap = await getDocs(feesQuery);
        if (!feesSnap.empty) {
          setFeeStatus("PAID");
        } else {
          setFeeStatus("PENDING");
        }
      } else {
        setFeeStatus("PENDING");
      }

    } catch (error) {
      console.error(error);
      localStorage.removeItem("member");
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const img = new Image();
      img.src = (event.target?.result as string) || "";
      
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setUploading(false);
          return;
        }

        const sourceSize = Math.min(img.width, img.height);
        const sourceX = (img.width - sourceSize) / 2;
        const sourceY = (img.height - sourceSize) / 2;

        ctx.drawImage(
          img,
          sourceX, sourceY, sourceSize, sourceSize,
          0, 0, size, size
        );

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        const compressedBase64 = dataUrl.split(",")[1];

        try {
          const formData = new FormData();
          formData.append("image", compressedBase64);

          const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData,
          });

          const result = await response.json();

          if (result.success) {
            const uploadedUrl = result.data.url;
            await updateDoc(doc(db, "members", member.id), {
              photoUrl: uploadedUrl,
            });

            setMember((prev: any) => ({
              ...prev,
              photoUrl: uploadedUrl,
            }));
            alert("Profile photo updated successfully 📸");
          } else {
            alert("Failed to upload image to server.");
          }
        } catch (error) {
          console.error(error);
          alert("Error while uploading image.");
        } finally {
          setUploading(false);
        }
      };
    };
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

  const getVCardData = () => {
    if (!member) return "";
    return `BEGIN:VCARD\nVERSION:3.0\nN:${member.name || ""};;;\nFN:${member.name || ""}\nORG:${member.companyName || "Lions Club"}\nTITLE:${member.currentLionsRole || "Member"}\nTEL;TYPE=CELL:${member.mobile || ""}\nEMAIL;TYPE=PREF,INTERNET:${member.email || ""}\nADR;TYPE=HOME:;;${member.address || ""};;;;\nNOTE:Lions Member Code: ${member.memberCode || ""}\nEND:VCARD`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#052f6b] border-t-[#D4AF37]"></div>
          <p className="font-bold tracking-wide" style={{ color: '#052f6b' }}>Loading Profile...</p>
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

  const renderField = (label: string, value: string, fieldKey: string, isTextArea = false, placeholder = "") => {
    return (
      <div className="py-2 border-b border-slate-100 last:border-none">
        <span className="block text-[11px] font-bold text-slate-400 mb-0.5 tracking-normal leading-tight">{label}</span>
        {isEditing ? (
          isTextArea ? (
            <textarea
              rows={2}
              value={member?.[fieldKey] || ""}
              onChange={(e) => setMember({ ...member, [fieldKey]: e.target.value })}
              className="w-full rounded-lg border border-[#052f6b] bg-white p-2 text-xs text-slate-800 transition-all focus:outline-none resize-none"
              placeholder={placeholder}
            />
          ) : (
            <input
              type="text"
              value={member?.[fieldKey] || ""}
              onChange={(e) => setMember({ ...member, [fieldKey]: e.target.value })}
              className="w-full rounded-lg border border-[#052f6b] bg-white p-2 text-xs text-slate-800 transition-all focus:outline-none"
              placeholder={placeholder}
            />
          )
        ) : (
          <p className="text-xs sm:text-sm font-bold text-slate-700">
            {value || <span className="text-slate-300 font-normal italic">Not provided</span>}
          </p>
        )}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 pb-10">
      
      {/* --- हेडर --- */}
      <div className="border-b border-slate-200 bg-[#052f6b] sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-[#D4AF37] font-bold hover:text-white transition-colors flex items-center gap-1 text-xs md:text-sm cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="text-sm md:text-base font-black text-white tracking-tight">Lions Connect</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide shadow-md transition-all active:scale-95 cursor-pointer ${
              isEditing ? "bg-slate-600 text-white hover:bg-slate-500" : "bg-[#D4AF37] text-[#052f6b] hover:bg-[#F3E5AB]"
            }`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 mt-3 space-y-3">
        
        {/* --- हिरो कार्ड --- */}
        <div className="bg-[#052f6b] rounded-2xl p-4 shadow-lg relative overflow-hidden text-white">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3.5 text-center sm:text-left relative z-10">
            
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="h-20 w-20 sm:h-22 sm:w-22 rounded-full border-2 border-[#D4AF37] bg-[#073b85] overflow-hidden flex items-center justify-center relative shadow-inner">
                {member?.photoUrl ? (
                  <img src={member.photoUrl} alt="profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl">🦁</span>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] font-bold text-white animate-pulse">
                    ...
                  </div>
                )}
              </div>
              
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 bg-[#D4AF37] text-[#052f6b] px-2 py-0.5 rounded-full text-[10px] font-black shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                >
                  📷 Change
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="space-y-1 flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                {member?.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#D4AF37] font-semibold">
                🦁 {member?.currentLionsRole || "Club Member"}
              </p>
              
              <div className="pt-1.5 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  onClick={() => router.push(`/my-profile/id-card`)}
                  className="bg-[#D4AF37] text-[#052f6b] px-3 py-1.5 rounded-lg font-black text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  🪪 View ID Card
                </button>
                <button
                  onClick={() => setShowQRModal(true)}
                  className="bg-[#073b85] hover:bg-[#0a4aa8] border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  📇 Business QR
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* --- मेंबर कोड आणि फी स्टेटस पट्टी --- */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white rounded-xl px-3 py-2.5 shadow-xs border border-slate-200 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Member Code</span>
            <span className="bg-[#052f6b] text-[#D4AF37] text-xs font-black px-2 py-0.5 rounded">
              {member?.memberCode || "LIONS"}
            </span>
          </div>
          <div className="bg-white rounded-xl px-3 py-2.5 shadow-xs border border-slate-200 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400">Fee Status</span>
            <span className={`text-xs font-black px-2 py-0.5 rounded ${
              feeStatus === "PAID" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
            }`}>
              {feeStatus}
            </span>
          </div>
        </div>

        {/* --- प्रोग्रेस बार --- */}
        <div className="bg-white rounded-xl px-3.5 py-3 shadow-xs border border-slate-200">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase">📈 Profile Completion Status</span>
            <span className="font-black text-xs bg-slate-100 px-2 py-0.5 rounded" style={{ color: '#052f6b' }}>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-r from-[#052f6b] to-[#D4AF37] h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* --- माहिती विभाग --- */}
        <div className="space-y-3">
          
          {/* Section: Personal & Admin Info (Light Gray Background - Locked) */}
          <div className="bg-slate-100 rounded-2xl px-4 py-3 shadow-xs border border-slate-200">
            <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1 border-b border-slate-300 pb-1.5 text-slate-600">🔒 Personal & Admin Info (Locked)</h2>
            <div className="divide-y divide-slate-200">
              <div className="py-2">
                <span className="block text-[11px] font-bold text-slate-400 mb-0.5">Mobile Number</span>
                <p className="text-xs sm:text-sm font-bold text-slate-700">{member?.mobile || "-"}</p>
              </div>
              <div className="py-2">
                <span className="block text-[11px] font-bold text-slate-400 mb-0.5">Date of Birth</span>
                <p className="text-xs sm:text-sm font-bold text-slate-700">{member?.dob || "-"}</p>
              </div>
              <div className="py-2">
                <span className="block text-[11px] font-bold text-slate-400 mb-0.5">Spouse Name</span>
                <p className="text-xs sm:text-sm font-bold text-slate-700">{member?.spouseName || "-"}</p>
              </div>
              <div className="py-2">
                <span className="block text-[11px] font-bold text-slate-400 mb-0.5">Wedding Anniversary</span>
                <p className="text-xs sm:text-sm font-bold text-slate-700">{member?.anniversary || "-"}</p>
              </div>
            </div>
          </div>

          {/* Section: Contact Info (White Background - Editable) */}
          <div className="bg-white rounded-2xl px-4 py-3 shadow-xs border border-slate-200">
            <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1 border-b border-slate-200 pb-1.5" style={{ color: '#052f6b' }}>Contact Information</h2>
            <div>
              {renderField("Email Address", member?.email, "email", false, "Enter email address")}
              {renderField("Home Address", member?.address, "address", true, "Enter home address")}
            </div>
          </div>

          {/* Section: Professional Info (White Background - Editable) */}
          <div className="bg-white rounded-2xl px-4 py-3 shadow-xs border border-slate-200">
            <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1 border-b border-slate-200 pb-1.5" style={{ color: '#052f6b' }}>Professional Information</h2>
            <div>
              {renderField("Profession", member?.profession, "profession", false, "e.g. Business Owner")}
              {renderField("Company Name", member?.companyName, "companyName", false, "Enter company name")}
              {renderField("Job Title / Designation", member?.jobTitle, "jobTitle", false, "e.g. Proprietor")}
              {renderField("Business Description", member?.businessDescription, "businessDescription", true, "Describe operations...")}
            </div>
          </div>

          {/* Section: Interests & Family (White Background - Editable) */}
          <div className="bg-white rounded-2xl px-4 py-3 shadow-xs border border-slate-200">
            <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1 border-b border-slate-200 pb-1.5" style={{ color: '#052f6b' }}>Interests & Family</h2>
            <div>
              {renderField("Hobbies", member?.hobbies, "hobbies", false, "e.g. Reading, Traveling")}
              {renderField("Special Skills", member?.specialSkills, "specialSkills", false, "e.g. Public Speaking")}
              {renderField("Children Names", member?.childrenNames, "childrenNames", false, "Enter children names")}
            </div>
          </div>

          {/* Section: Lions Club History (Light Gray Background - Locked) */}
          <div className="bg-slate-100 rounded-2xl px-4 py-3 shadow-xs border border-slate-200">
            <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1 border-b border-slate-300 pb-1.5 text-slate-600">🦁 Lions Club History (Locked)</h2>
            <div className="divide-y divide-slate-200">
              <div className="py-2">
                <span className="block text-[11px] font-bold text-slate-400 mb-0.5">Year Joined</span>
                <p className="text-xs sm:text-sm font-bold text-slate-700">{member?.yearJoinedLions || "-"}</p>
              </div>
              <div className="py-2">
                <span className="block text-[11px] font-bold text-slate-400 mb-0.5">Current Role</span>
                <p className="text-xs sm:text-sm font-black text-slate-700">{member?.currentLionsRole || "-"}</p>
              </div>
              <div className="py-2">
                <span className="block text-[11px] font-bold text-slate-400 mb-0.5">Past Positions Held</span>
                <p className="text-xs sm:text-sm font-bold whitespace-pre-wrap text-slate-700">{member?.pastPositions || "None"}</p>
              </div>
              <div className="py-2">
                <span className="block text-[11px] font-bold text-slate-400 mb-0.5">Awards & Achievements</span>
                <p className="text-xs sm:text-sm font-bold whitespace-pre-wrap text-slate-700">{member?.awardsAchievements || "None"}</p>
              </div>
            </div>
          </div>

        </div>

        {/* --- SAVE BUTTON --- */}
        {isEditing && (
          <div className="pt-1">
            <button
              onClick={saveProfile}
              className="bg-[#052f6b] text-white w-full py-3 rounded-xl font-bold tracking-wide shadow-lg hover:bg-[#073b85] transition-all duration-200 transform active:scale-[0.98] text-sm cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        )}
      </div>

      {/* --- QR कोड पॉपअप मॉडेल --- */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 text-center shadow-2xl relative">
            <h3 className="text-base font-black mb-1" style={{ color: '#052f6b' }}>📇 Digital Business Card QR</h3>
            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              हा QR कोड इतर मेंबर्सनी स्कॅन केल्यास तुमची संपर्क माहिती थेट त्यांच्या मोबाईल फोनमध्ये सेव्ह होईल.
            </p>
            
            <div className="bg-white p-3 rounded-xl inline-block shadow-xs border-2 border-[#D4AF37] mx-auto mb-4">
              <QRCodeSVG value={getVCardData()} size={180} level="M" includeMargin={true} />
            </div>

            <div className="text-sm font-bold mb-0.5" style={{ color: '#052f6b' }}>{member?.name}</div>
            <div className="text-xs text-slate-500 mb-4">{member?.currentLionsRole}</div>

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