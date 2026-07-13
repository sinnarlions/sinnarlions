"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "@/src/firebase/config";

export default function ClubInformationAdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    clubName: "",
    clubId: "",
    charterDate: "",
    charterPresident: "",
    district: "",
    region: "",
    zone: "",

     regionChairperson: "",
  zoneChairperson: "",

    meetingDay: "",
    meetingTime: "",
    meetingVenue: "",
    clubAddress: "",
    clubEmail: "",
    clubWebsite: "",
    clubVision: "",
    clubHistory: "",
  });

  useEffect(() => {
    loadClubInformation();
  }, []);

  async function loadClubInformation() {
    try {
      const ref = doc(db, "clubInformation", "main");

      const snap = await getDoc(ref);

      if (snap.exists()) {
        setForm((prev) => ({
          ...prev,
          ...(snap.data() as typeof prev),
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSave() {
    setSaving(true);

    try {
      await setDoc(
        doc(db, "clubInformation", "main"),
        form
      );

      alert("Club Information Saved Successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Unable to save information.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
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
              Super Admin
            </p>
          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#003B75] shadow"
          >
            ← Back
          </button>

        </div>
      </div>

      <div className="mx-auto mt-5 max-w-md space-y-4 px-4">

        {/* Club Name */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Club Name
          </label>

          <input
            name="clubName"
            value={form.clubName}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />
        </div>

        {/* Club ID */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Club ID
          </label>

          <input
            name="clubId"
            value={form.clubId}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />
        </div>

        {/* Charter Date */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Charter Date
          </label>

          <input
            type="date"
            name="charterDate"
            value={form.charterDate}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />
        </div>

        {/* Charter President */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Charter President
          </label>

          <input
            name="charterPresident"
            value={form.charterPresident}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />
        </div>
                {/* District */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            District
          </label>

          <input
            name="district"
            value={form.district}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
            placeholder="3234-H2"
          />
        </div>

        {/* Region */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Region
          </label>

          <input
            name="region"
            value={form.region}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />
        </div>

        {/* Zone */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Zone
          </label>

          <input
            name="zone"
            value={form.zone}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />
        </div>
{/* Region Chairperson */}

<div>
  <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
    Region Chairperson
  </label>

  <input
    name="regionChairperson"
    value={form.regionChairperson}
    onChange={handleChange}
    className="w-full rounded-xl border p-3"
    placeholder="Region Chairperson"
  />
</div>

{/* Zone Chairperson */}

<div>
  <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
    Zone Chairperson
  </label>

  <input
    name="zoneChairperson"
    value={form.zoneChairperson}
    onChange={handleChange}
    className="w-full rounded-xl border p-3"
    placeholder="Zone Chairperson"
  />
</div>
        {/* Meeting Day */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Meeting Day
          </label>

          <input
            name="meetingDay"
            value={form.meetingDay}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
            placeholder="Second & Fourth Saturday"
          />
        </div>

        {/* Meeting Time */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Meeting Time
          </label>

          <input
            name="meetingTime"
            value={form.meetingTime}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
            placeholder="7:00 PM"
          />
        </div>

        {/* Meeting Venue */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Meeting Venue
          </label>

          <input
            name="meetingVenue"
            value={form.meetingVenue}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />
        </div>
                {/* Club Address */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Club Address
          </label>

          <textarea
            rows={3}
            name="clubAddress"
            value={form.clubAddress}
            onChange={handleChange}
            className="w-full rounded-xl border p-3 resize-none"
          />
        </div>

        {/* Club Email */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Club Email
          </label>

          <input
            type="email"
            name="clubEmail"
            value={form.clubEmail}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />
        </div>

        {/* Club Website */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Club Website
          </label>

          <input
            name="clubWebsite"
            value={form.clubWebsite}
            onChange={handleChange}
            className="w-full rounded-xl border p-3"
          />
        </div>

        {/* Club Vision */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Club Vision / Motto
          </label>

          <textarea
            rows={3}
            name="clubVision"
            value={form.clubVision}
            onChange={handleChange}
            className="w-full rounded-xl border p-3 resize-none"
          />
        </div>

        {/* Club History */}

        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
            Club History
          </label>

          <textarea
            rows={6}
            name="clubHistory"
            value={form.clubHistory}
            onChange={handleChange}
            className="w-full rounded-xl border p-3 resize-none"
          />
        </div>

        {/* Save Button */}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-[#003B75] py-3 font-bold text-white transition hover:bg-[#002a53] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Club Information"}
        </button>

      </div>

    </main>
  );
}