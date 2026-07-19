"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "@/src/firebase/config";

interface ClubInformation {
  clubName: string;
  clubId: string;
  charterDate: string;

  district: string;
  region: string;
  zone: string;

  regionChairperson: string;
  zoneChairperson: string;

  meetingDay: string;
  meetingTime: string;
  meetingVenue: string;

  clubAddress: string;
  clubEmail: string;
  clubWebsite: string;

  clubVision: string;
  clubHistory: string;
}

interface Member {
  id: string;
  memberCode: string;
  name: string;
}

export default function ClubInformationPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [club, setClub] =
    useState<ClubInformation | null>(null);

  const [charterPresident, setCharterPresident] =
    useState<Member | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      // Club Information

      const clubSnap = await getDoc(
        doc(db, "clubInformation", "main")
      );

      if (clubSnap.exists()) {
        setClub(
          clubSnap.data() as ClubInformation
        );
      }

      // Charter President (Fixed LC010)

      const memberSnap = await getDocs(
        collection(db, "members")
      );

      const president = memberSnap.docs
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Member, "id">),
        }))
        .find(
          (m) => m.memberCode === "LC010"
        );

      if (president) {
        setCharterPresident(president);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <p className="font-bold text-[#003B75]">
          Loading Club Information...
        </p>
      </main>
    );
  }

  if (!club) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <p className="text-gray-500">
          Club information not available.
        </p>
      </main>
    );
  }
    return (
    <main className="min-h-screen bg-[#F8F9FA] pb-10">

      {/* Header */}
      <div className="sticky top-0 z-20 border-b-4 border-[#F2A900] bg-[#003B75] shadow-md">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">

          <div>
            <h1 className="text-xl font-bold text-white">
              Club Information
            </h1>

            <p className="text-[11px] text-white/80">
              Lions Club of Sinnar City
            </p>
          </div>

          <button
            onClick={() => router.push("/club")}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#003B75] shadow"
          >
            ← Back
          </button>

        </div>
      </div>

      <div className="mx-auto mt-5 max-w-md space-y-4 px-4">

        {/* {/* Club Details (Compact & Bold for Mobile) */}
<div className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
  <h2 className="text-xs font-black uppercase tracking-widest text-[#003B75]">Club Details</h2>
  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase font-bold text-gray-400">Club Name</p>
      <p className="text-sm font-extrabold text-[#003B75] leading-tight">{club.clubName}</p>
    </div>
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase font-bold text-gray-400">Club ID</p>
      <p className="text-sm font-extrabold text-gray-800">{club.clubId}</p>
    </div>
   <div className="space-y-0.5">
  <p className="text-[10px] uppercase font-bold text-gray-400">Charter Date</p>
  <p className="text-sm font-extrabold text-gray-800">
    {new Date(club.charterDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })}
  </p>
</div>
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase font-bold text-gray-400">Charter President</p>
      <p className="text-sm font-extrabold text-gray-800 truncate">{charterPresident?.name || "-"}</p>
    </div>
  </div>
</div>

{/* District Information (Compact & Bold for Mobile) */}
<div className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
  <h2 className="text-xs font-black uppercase tracking-widest text-[#003B75]">District Information</h2>
  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase font-bold text-gray-400">District / Region</p>
      <p className="text-sm font-extrabold text-gray-800">{club.district} / {club.region}</p>
    </div>
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase font-bold text-gray-400">Zone</p>
      <p className="text-sm font-extrabold text-gray-800">{club.zone}</p>
    </div>
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase font-bold text-gray-400">Region Chairperson</p>
      <p className="text-sm font-extrabold text-gray-800 leading-tight">{club.regionChairperson}</p>
    </div>
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase font-bold text-gray-400">Zone Chairperson</p>
      <p className="text-sm font-extrabold text-gray-800 leading-tight">{club.zoneChairperson}</p>
    </div>
  </div>
</div>

{/* Meeting Information */}
<div className="rounded-2xl bg-white p-5 shadow-sm">
  <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-[#003B75]">Meeting Information</h2>
  <div className="space-y-4 text-sm">
    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
      <span className="text-[11px] font-bold uppercase text-slate-400">Meeting Day</span>
      <span className="font-extrabold text-slate-800">{club.meetingDay}</span>
    </div>
    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
      <span className="text-[11px] font-bold uppercase text-slate-400">Meeting Time</span>
      <span className="font-extrabold text-slate-800">{club.meetingTime}</span>
    </div>
    <div className="space-y-1">
      <span className="text-[11px] font-bold uppercase text-slate-400">Meeting Venue</span>
      <p className="font-bold text-slate-800 leading-snug">{club.meetingVenue}</p>
    </div>
  </div>
</div>

{/* Contact Information */}
<div className="rounded-2xl bg-white p-5 shadow-sm">
  <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-[#003B75]">Contact Information</h2>
  <div className="space-y-4 text-sm">
    <div className="space-y-1">
      <p className="text-[11px] font-bold uppercase text-slate-400">Address</p>
      <p className="font-bold text-slate-800 leading-snug whitespace-pre-wrap">{club.clubAddress}</p>
    </div>
    <div className="space-y-1">
      <p className="text-[11px] font-bold uppercase text-slate-400">Email</p>
      <p className="font-bold text-[#003B75] break-all">{club.clubEmail}</p>
    </div>
    <div className="space-y-1">
      <p className="text-[11px] font-bold uppercase text-slate-400">Website</p>
      <p className="font-bold text-blue-600 break-all">{club.clubWebsite}</p>
    </div>
  </div>
</div>

{/* Explore More */}
<div className="rounded-2xl bg-white p-5 shadow-sm">
  <h2 className="mb-4 text-xs font-black uppercase tracking-widest text-[#003B75]">Explore More</h2>
  <div className="space-y-2.5">
    <button onClick={() => router.push("/club/history")} className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 transition hover:border-[#003B75] hover:bg-white">
      <p className="font-extrabold text-[#003B75]">📖 Club History</p>
      <span className="text-xl font-bold text-slate-300">›</span>
    </button>
    <button onClick={() => router.push("/club/vision")} className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-4 transition hover:border-[#003B75] hover:bg-white">
      <p className="font-extrabold text-[#003B75]">🎯 Our Vision</p>
      <span className="text-xl font-bold text-slate-300">›</span>
    </button>
  </div>
</div>
       

       

      </div>

    </main>
  );
}