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

        {/* Club Details */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="mb-4 text-lg font-bold text-[#003B75]">
            Club Details
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between gap-3">
              <span className="font-semibold text-gray-500">
                Club Name
              </span>

              <span className="text-right font-bold text-gray-800">
                {club.clubName}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="font-semibold text-gray-500">
                Club ID
              </span>

              <span className="font-bold text-gray-800">
                {club.clubId}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="font-semibold text-gray-500">
                Charter Date
              </span>

              <span className="font-bold text-gray-800">
                {club.charterDate}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="font-semibold text-gray-500">
                Charter President
              </span>

              <span className="text-right font-bold text-[#003B75]">
                {charterPresident?.name || "-"}
              </span>
            </div>

          </div>

        </div>

        {/* District Information */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="mb-4 text-lg font-bold text-[#003B75]">
            District Information
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
    District
  </span>

  <span className="text-sm font-semibold text-slate-800">
    {club.district}
  </span>
</div>

           <div className="flex justify-between">
  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
    Region
  </span>

  <span className="text-sm font-semibold text-slate-800">
    {club.region}
  </span>
</div>

           <div className="flex justify-between">
  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
    Zone
  </span>

  <span className="text-sm font-semibold text-slate-800">
    {club.zone}
  </span>
</div>

            <div className="flex justify-between gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Region Chairperson
              </span>

              <span className="text-right text-sm font-semibold text-slate-800">
                {club.regionChairperson}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Zone Chairperson
              </span>

              <span className="text-right text-sm font-semibold text-slate-800">
                {club.zoneChairperson}
              </span>
            </div>

          </div>

        </div>
                {/* Meeting Information */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="mb-4 text-lg font-bold text-[#003B75]">
            Meeting Information
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Meeting Day
              </span>

              <span className="text-sm font-semibold text-slate-800">
                {club.meetingDay}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold text-gray-500">
                Meeting Time
              </span>

             <span className="text-sm font-semibold text-slate-800">
                {club.meetingTime}
              </span>
            </div>

            <div className="flex justify-between gap-3">
              <span className="font-semibold text-gray-500">
                Meeting Venue
              </span>

              <span className="text-right font-bold">
                {club.meetingVenue}
              </span>
            </div>

          </div>

        </div>

        {/* Contact Information */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="mb-4 text-lg font-bold text-[#003B75]">
            Contact Information
          </h2>

          <div className="space-y-3 text-sm">

            <div>
              <p className="text-xs font-semibold text-gray-500">
                Address
              </p>

              <p className="mt-1 font-medium text-gray-800 whitespace-pre-wrap">
                {club.clubAddress}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500">
                Email
              </p>

              <p className="mt-1 font-medium text-gray-800">
                {club.clubEmail}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500">
                Website
              </p>

              <p className="mt-1 font-medium text-blue-700 break-all">
                {club.clubWebsite}
              </p>
            </div>

          </div>

        </div>

        {/* Club Vision */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="mb-4 text-lg font-bold text-[#003B75]">
            Club Vision
          </h2>

          <p className="text-sm leading-7 text-gray-700 whitespace-pre-wrap">
            {club.clubVision}
          </p>

        </div>

        {/* Club History */}

        <div className="rounded-2xl bg-white p-5 shadow-sm">

          <h2 className="mb-4 text-lg font-bold text-[#003B75]">
            Club History
          </h2>

          <p className="text-sm leading-7 text-gray-700 whitespace-pre-wrap">
            {club.clubHistory}
          </p>

        </div>

      </div>

    </main>
  );
}