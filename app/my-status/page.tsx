"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/src/firebase/config";
import {
  ArrowLeft,
  User,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Award,
  Briefcase,
  MapPin,
  Heart,
} from "lucide-react";

interface MemberData {
  memberCode?: string;
  name?: string;
  mobile?: string;
  email?: string;
  photoUrl?: string;
  dob?: string;
  anniversary?: string;
  spouseName?: string;
  profession?: string;
  companyName?: string;
  jobTitle?: string;
  address?: string;
  yearJoinedLions?: string | number;
  [key: string]: any;
}

interface StoredMember {
  id: string;
  memberCode: string;
  name: string;
  currentLionsRole?: string;
  isSuperAdmin?: boolean;
}

export default function MyStatusPage() {
  const router = useRouter();
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedMemberStr = localStorage.getItem("member");
      if (!storedMemberStr) {
        router.push("/login");
        return;
      }
      const storedMember: StoredMember = JSON.parse(storedMemberStr);
      if (!storedMember || !storedMember.id) {
        router.push("/login");
        return;
      }

      const fetchMemberData = async () => {
        try {
          const docRef = doc(db, "members", storedMember.id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setMemberData(docSnap.data() as MemberData);
          } else {
            setError("Member record not found in database.");
          }
        } catch (err: any) {
          setError(err.message || "Failed to fetch member status.");
        } finally {
          setLoading(false);
        }
      };

      fetchMemberData();
    } catch (err: any) {
      setError("Error reading local storage.");
      setLoading(false);
    }
  }, [router]);

  const parseDateToMonthDay = (dateStr?: string) => {
    if (!dateStr) return null;
    let day: number, month: number;

    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        month = parseInt(parts[1], 10);
        day = parseInt(parts[2], 10);
      } else {
        return null;
      }
    } else if (dateStr.includes(".")) {
      const parts = dateStr.split(".");
      if (parts.length >= 2) {
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10);
      } else {
        return null;
      }
    } else {
      return null;
    }

    if (isNaN(day) || isNaN(month)) return null;

    const dateObj = new Date(2020, month - 1, day);
    if (isNaN(dateObj.getTime())) return null;

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return {
      formatted: `${day} ${monthNames[month - 1]}`,
      month: month - 1,
      day: day,
    };
  };

  const calculateCountdown = (month: number, day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let targetYear = today.getFullYear();
    let targetDate = new Date(targetYear, month, day);

    if (targetDate < today) {
      targetDate = new Date(targetYear + 1, month, day);
    }

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
  return 0;
}
    return diffDays;
  };

  const fieldsToTrack = [
    "photoUrl",
    "email",
    "mobile",
    "address",
    "profession",
    "dob",
    "spouseName",
    "anniversary",
    "companyName",
    "jobTitle",
    "yearJoinedLions",
    "memberCode",
    "name",
  ];

  const calculateProfileCompletion = (data: MemberData | null) => {
    if (!data) return 0;
    let filledCount = 0;
    fieldsToTrack.forEach((field) => {
      const val = data[field];
      if (val !== undefined && val !== null && String(val).trim() !== "") {
        filledCount++;
      }
    });
    return Math.round((filledCount / fieldsToTrack.length) * 100);
  };

  const profileCompletionPct = calculateProfileCompletion(memberData);
  const missingItems: string[] = [];

if (!memberData?.photoUrl) missingItems.push("Photo");
if (!memberData?.email) missingItems.push("Email");
if (!memberData?.address) missingItems.push("Address");
if (!memberData?.profession) missingItems.push("Profession");
if (!memberData?.dob) missingItems.push("Birthday");
const joinedYear = Number(memberData?.yearJoinedLions);

const lionsYears =
  joinedYear && !isNaN(joinedYear)
    ? new Date().getFullYear() - joinedYear
    : null;
  const dobParsed = parseDateToMonthDay(memberData?.dob);
  const dobCountdown = dobParsed ? calculateCountdown(dobParsed.month, dobParsed.day) : null;

  const annivParsed = parseDateToMonthDay(memberData?.anniversary);
  const annivCountdown = annivParsed ? calculateCountdown(annivParsed.month, annivParsed.day) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#003B75] border-t-[#F2A900] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#003B75] font-semibold text-sm">Loading your status...</p>
        </div>
      </div>
    );
  }

  if (error || !memberData) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm max-w-sm w-full text-center border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#003B75] mb-1">Unable to Load</h2>
          <p className="text-gray-600 text-sm mb-4">{error || "Member data not available."}</p>
          <button
            onClick={() => router.back()}
            className="w-full py-2.5 bg-[#003B75] text-white rounded-xl font-medium text-sm hover:bg-[#002d5a] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-gray-800 pb-12">
      <header className="bg-[#003B75] text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="text-center">
            <h1 className="text-xs uppercase tracking-wider text-[#F2A900] font-semibold">
              Lions Connect
            </h1>
            <p className="text-base font-bold">My Status</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-[#F2A900]">
            <span className="text-xs font-bold text-[#F2A900]">LC</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 mt-4 space-y-4">
        <div className="bg-gradient-to-br from-[#003B75] to-[#002850] rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#F2A900]/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white/10 border-2 border-[#F2A900] overflow-hidden flex items-center justify-center shadow-inner">
                {memberData.photoUrl ? (
                  <img
                    src={memberData.photoUrl}
                    alt={memberData.name || "Member"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white/70" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F2A900] text-[#003B75] mb-1 uppercase tracking-wide">
                Code: {memberData.memberCode || "N/A"}
              </span>
              <h2 className="text-lg font-bold truncate text-white">
                {memberData.name || "Lions Member"}
           </h2>

<p className="text-xs text-white/80 truncate flex items-center mt-1">
  <Briefcase className="w-3.5 h-3.5 mr-1 text-[#F2A900] shrink-0" />
  {memberData.profession || memberData.jobTitle || "Lions Club Member"}
</p>

{lionsYears !== null && (
  <div className="mt-2 text-[11px] font-semibold text-[#F2A900]">
    🦁 Lion for {lionsYears} {lionsYears === 1 ? "Year" : "Years"}
  </div>
)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                Membership Fee
              </span>
              <p className="text-lg font-bold text-[#003B75]">Pending Update</p>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50 flex items-center text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-[#F2A900] mr-1.5 shrink-0" />
              <span>Dues Status</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
  <div>
    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
      Profile Completion
    </span>

    <p className="text-2xl font-black text-[#003B75]">
      {profileCompletionPct}%
    </p>
  </div>

  <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3 overflow-hidden">
    <div
      className="bg-[#F2A900] h-full rounded-full transition-all duration-500"
      style={{ width: `${profileCompletionPct}%` }}
    />
  </div>
<p className="mt-2 text-[11px] text-center font-medium text-gray-600">
  {profileCompletionPct === 100
    ? "🎉 Your profile is complete."
    : `${100 - profileCompletionPct}% more to complete your profile.`}
</p>
  <div className="mt-3 text-[11px] text-gray-600 space-y-1">
    {!memberData?.photoUrl && <div>📷 Add Profile Photo</div>}
    {!memberData?.email && <div>📧 Add Email Address</div>}
    {!memberData?.address && <div>📍 Add Address</div>}
    {!memberData?.dob && <div>🎂 Add Date of Birth</div>}
    {!memberData?.spouseName && <div>❤️ Add Spouse Name</div>}
    {!memberData?.anniversary && <div>💍 Add Anniversary</div>}

    {profileCompletionPct === 100 && (
      <div className="text-green-600 font-semibold">
        ✅ Profile Complete
      </div>
    )}
  </div>
</div>
          <div className="mt-3 text-center">
  {profileCompletionPct === 100 ? (
    <span className="text-[11px] font-bold text-green-600">
      ✅ Profile Complete
    </span>
  ) : (
    <button
      onClick={() => router.push("/my-profile")}
      className="text-[11px] font-bold text-[#003B75] hover:underline"
    >
      Complete your profile →
    </button>
  )}
</div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Account Verification & Status
          </h3>
{missingItems.length > 0 && (
  <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
    <p className="text-[11px] font-bold text-amber-800">
      ⚠ Missing: {missingItems.join(", ")}
    </p>
  </div>
)}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F5F7FA] rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 font-medium block">Profile Photo</span>
                <span className="text-xs font-bold text-[#003B75]">
                  {memberData.photoUrl ? "Available" : "Missing"}
                </span>
              </div>
              {memberData.photoUrl ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
            </div>

            <div className="bg-[#F5F7FA] rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-500 font-medium block">Email Address</span>
                <span className="text-xs font-bold text-[#003B75]">
                  {memberData.email ? "Available" : "Missing"}
                </span>
              </div>
              {memberData.email ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
              )}
            </div>
          </div>

          <div className="bg-[#F5F7FA] rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#003B75] shadow-sm">
                <Phone className="w-4 h-4 text-[#003B75]" />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 font-medium block">Mobile Number</span>
                <span className="text-xs font-bold text-[#003B75]">
                  {memberData.mobile || "Not Provided"}
                </span>
              </div>
            </div>
            {memberData.mobile ? (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                Linked
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                Missing
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Important Dates & Milestones
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F5F7FA] rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Birthday</span>
              </div>
              <div>
                <p className="text-base font-bold text-[#003B75]">
                  {dobParsed ? dobParsed.formatted : "Not Set"}
                </p>
                <p className="text-[11px] font-medium text-amber-600 mt-0.5">
  {dobCountdown === null
    ? "-"
    : dobCountdown === 0
    ? "🎉 Today"
    : dobCountdown === 1
    ? "Tomorrow"
    : `In ${dobCountdown} Days`}
</p>
              </div>
            </div>

            <div className="bg-[#F5F7FA] rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600">
                  <Heart className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-semibold text-gray-400 uppercase">Anniversary</span>
              </div>
              <div>
                <p className="text-base font-bold text-[#003B75]">
                  {annivParsed ? annivParsed.formatted : "-"}
                </p>
                <p className="text-[11px] font-medium text-pink-600 mt-0.5">
  {annivCountdown === null
    ? "-"
    : annivCountdown === 0
    ? "🎉 Today"
    : annivCountdown === 1
    ? "Tomorrow"
    : `In ${annivCountdown} Days`}
</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}