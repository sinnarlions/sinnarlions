"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/src/firebase/config";

import Link from "next/link";

export default function ViewMeetingPage() {
  const params = useParams();
  const router = useRouter();

  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
const [agenda, setAgenda] = useState<any[]>([]);
  useEffect(() => {
    loadMeeting();
  }, []);

  const loadMeeting = async () => {
    try {
     const meetingRef = doc(db, "meetings", String(params.id));
const agendaRef = doc(db, "meetingAgendas", String(params.id));

const [meetingSnap, agendaSnap] = await Promise.all([
  getDoc(meetingRef),
  getDoc(agendaRef),
]);

if (!meetingSnap.exists()) {
  alert("Meeting not found.");
  router.push("/admin/meetings");
  return;
}

setMeeting({
  id: meetingSnap.id,
  ...meetingSnap.data(),
});

if (agendaSnap.exists()) {
  const data = agendaSnap.data();
  setAgenda(data.items || []);
}

      

      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
     <div className="max-w-3xl mx-auto px-4 py-8">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      <div className="bg-[#003B75] rounded-3xl p-8 text-white shadow-lg mb-6">

  <div className="flex justify-between items-start">

    <div>

      <p className="uppercase tracking-widest text-xs text-blue-200 font-bold">
        Upcoming Meeting
      </p>

      <h1 className="text-3xl font-bold mt-2">
        {meeting.meetingTitle}
      </h1>

      <div className="flex gap-3 mt-5 flex-wrap">

        <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
          📅 {meeting.meetingDate}
        </span>

        <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
          🕒 {meeting.meetingTime}
        </span>

      </div>

    </div>

    <Link
      href="/admin/meetings"
      className="bg-white text-[#003B75] px-4 py-2 rounded-xl font-bold"
    >
      ← Back
    </Link>

  </div>

</div>

      <div className="bg-white rounded-3xl shadow-lg p-8 space-y-8">

        

        <div className="grid grid-cols-2 gap-5">

  <div className="bg-[#F8F9FA] rounded-2xl p-4">
    <p className="text-xs uppercase text-gray-500 font-bold mb-2">
      Meeting Type
    </p>

    <p className="font-semibold text-[#003B75]">
      {meeting.meetingType}
    </p>
  </div>

  <div className="bg-[#F8F9FA] rounded-2xl p-4">
    <p className="text-xs uppercase text-gray-500 font-bold mb-2">
      Status
    </p>

    <p className="font-semibold text-[#003B75]">
      {meeting.status}
    </p>
  </div>

  <div className="bg-[#F8F9FA] rounded-2xl p-4">
    <p className="text-xs uppercase text-gray-500 font-bold mb-2">
      Date
    </p>

    <p className="font-semibold text-[#003B75]">
      {meeting.meetingDate}
    </p>
  </div>

  <div className="bg-[#F8F9FA] rounded-2xl p-4">
    <p className="text-xs uppercase text-gray-500 font-bold mb-2">
      Time
    </p>

    <p className="font-semibold text-[#003B75]">
      {meeting.meetingTime}
    </p>
  </div>

  <div className="bg-[#F8F9FA] rounded-2xl p-4">
    <p className="text-xs uppercase text-gray-500 font-bold mb-2">
      Venue
    </p>

    <p className="font-semibold text-[#003B75]">
      {meeting.venue}
    </p>
  </div>

  <div className="bg-[#F8F9FA] rounded-2xl p-4">
    <p className="text-xs uppercase text-gray-500 font-bold mb-2">
      Created By
    </p>

    <p className="font-semibold text-[#003B75]">
      {meeting.createdBy}
    </p>
  </div>

</div>
      <div className="mb-8">

  <h2 className="text-lg font-bold text-[#003B75] mb-4 flex items-center gap-2">
    📢 Secretary's Message
  </h2>

  <p className="whitespace-pre-wrap leading-8 text-gray-700">
    {meeting.announcement}
  </p>

</div>

      </div>
<div className="bg-white rounded-3xl shadow-lg p-6">

  <h2 className="text-lg font-bold text-[#003B75] mb-5 flex items-center gap-2">
    📋 Meeting Agenda
  </h2>

  <div className="overflow-hidden rounded-2xl border border-gray-200">

    {agenda.map((item, index) => (
     <div
  key={index}
  className="bg-white px-5 py-4 border-b last:border-b-0"
>
     <div className="flex gap-3 items-start">

  <div className="font-bold text-[#003B75] text-lg shrink-0">
    {item.serial}.
  </div>

  <div className="font-semibold text-[#003B75] text-lg">
    {item.title}
  </div>

</div>
        {item.notes && (
          <div className="ml-12 mt-2 text-gray-600 whitespace-pre-wrap">
            {item.notes}
          </div>
        )}
      </div>
    ))}

  </div>
</div>
    </div>
  );
}