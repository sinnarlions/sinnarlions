"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/src/firebase/config";

export default function MyProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadMyProfile();
  }, []);

useEffect(() => {
  const handlePageShow = () => {
    const member = localStorage.getItem("member");

    if (!member) {
      router.replace("/login");
    }
  };

  window.addEventListener("pageshow", handlePageShow);

  return () => {
    window.removeEventListener("pageshow", handlePageShow);
  };
}, [router]);

  const loadMyProfile = async () =>  {
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

  }
  catch (error) {
  console.error(error);

  localStorage.removeItem("member");
  router.replace("/login");
} 
  finally {
    setLoading(false);
  }
};

  const saveProfile = async () => {
    try {
      if (!member?.id) return;

      await updateDoc(
        doc(db, "members", member.id),
        {
          email: member.email || "",
          address: member.address || "",

          profession:
            member.profession || "",

          companyName:
            member.companyName || "",

          jobTitle:
            member.jobTitle || "",

          businessDescription:
            member.businessDescription || "",

          hobbies:
            member.hobbies || "",

          specialSkills:
            member.specialSkills || "",
            childrenNames:
            member.childrenNames || "",
        }
      );

      setIsEditing(false);

      alert(
        "Profile updated successfully"
      );
    } catch (error) {
      console.error(error);
      alert("Error saving profile");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#E1D4C2] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#6E473B] border-t-transparent"></div>
          <p className="text-[#6E473B] font-bold tracking-wide">
            Loading Profile...
          </p>
        </div>
      </main>
    );
  }

  if (!member) {
    return (
      <main className="min-h-screen bg-[#E1D4C2] flex items-center justify-center p-4">
        <div className="bg-white border-l-4 border-red-500 rounded-2xl p-6 shadow-md max-w-sm w-full text-center">
          <p className="text-red-600 font-bold text-lg">
            Member not found
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#E1D4C2] pb-12">
      <div className="border-b border-[#BEB5A9] bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-[#6E473B] font-bold hover:text-[#291C0E] transition-colors flex items-center gap-1 group text-sm md:text-base"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform">←</span> Back
          </button>

          <h1 className="text-xl md:text-2xl font-black text-[#291C0E] tracking-tight">
            Lions Connect
          </h1>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-wide shadow-sm transition-all active:scale-95 ${
              isEditing 
                ? "bg-gray-200 text-[#291C0E] hover:bg-gray-300" 
                : "bg-[#6E473B] text-white hover:bg-[#291C0E]"
            }`}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-8">
        {/* Profile Card Header */}
        <div className="bg-[#291C0E] rounded-3xl p-6 md:p-8 text-[#E1D4C2] mb-8 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 font-black text-7xl uppercase tracking-wider pointer-events-none select-none p-4">
            LIONS
          </div>
          <div className="relative z-10">
            <span className="bg-[#6E473B] text-[#E1D4C2] text-xs font-bold px-3 py-1 rounded-md tracking-wider uppercase">
              {member.memberCode || "LIONS CLUB"}
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mt-3 text-white">
              {member.name}
            </h2>
            <p className="text-sm md:text-base text-[#E1D4C2]/80 mt-1 font-medium">
              {member.currentLionsRole || "Club Member"}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-[#BEB5A9]/30">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
              <h2 className="text-xl font-extrabold text-[#291C0E]">
                Basic Information
              </h2>
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded">
                Read Only
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  🔒 Name
                </label>
                <input
                  type="text"
                  value={member.name || ""}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-sm font-semibold text-[#291C0E] cursor-not-allowed focus:outline-none"
                />
              </div>

              {/* Member Code */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  🔒 Member Code
                </label>
                <input
                  type="text"
                  value={member.memberCode || ""}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-sm font-semibold text-[#291C0E] cursor-not-allowed focus:outline-none"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  🔒 Mobile Number
                </label>
                <input
                  type="text"
                  value={member.mobile || ""}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-sm font-semibold text-[#291C0E] cursor-not-allowed focus:outline-none"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  🔒 Date of Birth
                </label>
                <input
                  type="text"
                  value={member.dob || ""}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/80 p-3 text-sm font-semibold text-[#291C0E] cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E473B]">
                  Email Address
                </label>
                {isEditing && <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">Editable</span>}
              </div>
              <input
                type="email"
                value={member.email || ""}
                onChange={(e) =>
                  setMember({
                    ...member,
                    email: e.target.value,
                  })
                }
                readOnly={!isEditing}
                className={`w-full rounded-xl border p-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#6E473B]/20 ${
                  isEditing
                    ? "bg-white border-[#6E473B] text-[#291C0E]"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
                placeholder="Enter email address"
              />
            </div>

            {/* Address */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E473B]">
                  Home Address
                </label>
                {isEditing && <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">Editable</span>}
              </div>
              <textarea
                rows={3}
                value={member.address || ""}
                onChange={(e) =>
                  setMember({
                    ...member,
                    address: e.target.value,
                  })
                }
                readOnly={!isEditing}
                className={`w-full rounded-xl border p-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#6E473B]/20 resize-none ${
                  isEditing
                    ? "bg-white border-[#6E473B] text-[#291C0E]"
                    : "bg-gray-50 border-gray-200 text-gray-600"
                }`}
                placeholder="Enter full home address"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-[#BEB5A9]/30">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
              <h3 className="text-xl font-extrabold text-[#291C0E]">
                Professional Information
              </h3>
              {isEditing && <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">Editable</span>}
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6E473B] mb-2">
                    Profession
                  </label>
                  <input
                    value={member.profession || ""}
                    onChange={(e) =>
                      setMember({
                        ...member,
                        profession: e.target.value,
                      })
                    }
                    readOnly={!isEditing}
                    className={`w-full rounded-xl border p-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#6E473B]/20 ${
                      isEditing
                        ? "bg-white border-[#6E473B] text-[#291C0E]"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                    }`}
                    placeholder="e.g., Architect, Business Owner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6E473B] mb-2">
                    Company Name
                  </label>
                  <input
                    value={member.companyName || ""}
                    onChange={(e) =>
                      setMember({
                        ...member,
                        companyName: e.target.value,
                      })
                    }
                    readOnly={!isEditing}
                    className={`w-full rounded-xl border p-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#6E473B]/20 ${
                      isEditing
                        ? "bg-white border-[#6E473B] text-[#291C0E]"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                    }`}
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E473B] mb-2">
                  Job Title
                </label>
                <input
                  value={member.jobTitle || ""}
                  onChange={(e) =>
                    setMember({
                      ...member,
                      jobTitle: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  className={`w-full rounded-xl border p-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#6E473B]/20 ${
                    isEditing
                      ? "bg-white border-[#6E473B] text-[#291C0E]"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                  placeholder="e.g., Director, Senior Consultant"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E473B] mb-2">
                  Business Description
                </label>
                <textarea
                  rows={4}
                  value={member.businessDescription || ""}
                  onChange={(e) =>
                    setMember({
                      ...member,
                      businessDescription: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  className={`w-full rounded-xl border p-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#6E473B]/20 resize-none ${
                    isEditing
                      ? "bg-white border-[#6E473B] text-[#291C0E]"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                  placeholder="Describe your business operations or services offered..."
                />
              </div>
            </div>
          </div>

          {/* Interests & Skills */}
          <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-[#BEB5A9]/30">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
              <h3 className="text-xl font-extrabold text-[#291C0E]">
                Interests & Skills
              </h3>
              {isEditing && <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">Editable</span>}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E473B] mb-2">
                  Hobbies
                </label>
                <textarea
                  rows={3}
                  value={member.hobbies || ""}
                  onChange={(e) =>
                    setMember({
                      ...member,
                      hobbies: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  className={`w-full rounded-xl border p-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#6E473B]/20 resize-none ${
                    isEditing
                      ? "bg-white border-[#6E473B] text-[#291C0E]"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                  placeholder="e.g., Reading, Golfing, Social Service"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E473B] mb-2">
                  Special Skills
                </label>
                <textarea
                  rows={3}
                  value={member.specialSkills || ""}
                  onChange={(e) =>
                    setMember({
                      ...member,
                      specialSkills: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  className={`w-full rounded-xl border p-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#6E473B]/20 resize-none ${
                    isEditing
                      ? "bg-white border-[#6E473B] text-[#291C0E]"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                  placeholder="e.g., Public Speaking, Event Organizing, Financial Planning"
                />
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-[#BEB5A9]/30">
            <h3 className="text-xl font-extrabold text-[#291C0E] mb-6 border-b border-gray-100 pb-3">
              Family Information
            </h3>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    🔒 Spouse Name
                  </label>
                  <input
                    type="text"
                    value={member.spouseName || ""}
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-[#291C0E] cursor-not-allowed focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    🔒 Wedding Anniversary
                  </label>
                  <input
                    type="text"
                    value={member.anniversary || ""}
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-[#291C0E] cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6E473B]">
                    Children Names
                  </label>
                  {isEditing && <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">Editable</span>}
                </div>
                <textarea
                  rows={3}
                  value={member.childrenNames || ""}
                  onChange={(e) =>
                    setMember({
                      ...member,
                      childrenNames: e.target.value,
                    })
                  }
                  readOnly={!isEditing}
                  className={`w-full rounded-xl border p-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#6E473B]/20 resize-none ${
                    isEditing 
                      ? "bg-white border-[#6E473B] text-[#291C0E]" 
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                  placeholder="Enter children's names"
                />
              </div>
            </div>
          </div>

          {/* Lions Information */}
          <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 border border-[#BEB5A9]/30">
            <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-3">
              <h3 className="text-xl font-extrabold text-[#291C0E]">
                Lions Information
              </h3>
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase bg-gray-100 px-2 py-0.5 rounded">
                Read Only
              </span>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    🔒 Member Code
                  </label>
                  <input
                    type="text"
                    value={member.memberCode || ""}
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-[#291C0E] cursor-not-allowed focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    🔒 Year Joined Lions
                  </label>
                  <input
                    type="text"
                    value={member.yearJoinedLions || ""}
                    readOnly
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-semibold text-[#291C0E] cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  🔒 Current Lions Role
                </label>
                <input
                  type="text"
                  value={member.currentLionsRole || ""}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-bold text-[#6E473B] cursor-not-allowed focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  🔒 Past Positions Held
                </label>
                <textarea
                  rows={3}
                  value={member.pastPositions || ""}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-medium text-[#291C0E] cursor-not-allowed focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  🔒 Awards & Achievements
                </label>
                <textarea
                  rows={3}
                  value={member.awardsAchievements || ""}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-medium text-[#291C0E] cursor-not-allowed focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating / Sticky Save Bar when editing */}
        {isEditing && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={saveProfile}
              className="bg-[#6E473B] text-white px-8 py-4 rounded-xl font-bold tracking-wide shadow-lg hover:bg-[#291C0E] transition-colors duration-200 transform active:scale-95 text-sm md:text-base w-full md:w-auto"
            >
              Save Profile Changes
            </button>
          </div>
        )}
      </div>
    </main>
  );
}