"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/src/firebase/config";

export default function MemberMeetingPage() {
  const params = useParams();
  const router = useRouter();

  const [meeting, setMeeting] = useState<any>(null);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

const formatDate = (date: string) => {
  if (!date) return "";

  const d = new Date(date);

  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time: string) => {
  if (!time) return "";

  const [hour, minute] = time.split(":");

  const d = new Date();
  d.setHours(Number(hour));
  d.setMinutes(Number(minute));

  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

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
        router.push("/");
        return;
      }

      setMeeting({
        id: meetingSnap.id,
        ...meetingSnap.data(),
      });

      if (agendaSnap.exists()) {
        setAgenda(agendaSnap.data().items || []);
      }
    } catch (err) {
      console.error(err);
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

      <div className="bg-[#003B75] rounded-3xl p-5 text-white shadow-lg mb-4">

        <div className="flex justify-between items-start">

          <div>

            <p className="uppercase tracking-widest text-xs text-blue-200 font-bold">
              Upcoming Meeting
            </p>

            <h1 className="text-xl font-bold mt-1">
              {meeting.meetingTitle}
            </h1>

            

          </div>

          <Link
            href="/"
            className="bg-white text-[#003B75] px-3 py-1 rounded-lg text-sm font-bold"
          >
            ← Home
          </Link>

        </div>

      </div>

      <div className="bg-white rounded-3xl shadow-lg p-4 space-y-4">

        <div className="grid grid-cols-2 gap-2">

          <div className="bg-[#F8F9FA] rounded-xl px-3 py-2">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-0">Meeting Type</p>
            <p className="font-semibold text-sm text-[#003B75]">{meeting.meetingType}</p>
          </div>

          <div className="bg-[#F8F9FA] rounded-xl px-3 py-2">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-0">Status</p>
            <p className="font-semibold text-sm text-[#003B75]">{meeting.status}</p>
          </div>

          <div className="bg-[#F8F9FA] rounded-xl px-3 py-2">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-0">Date</p>
            <p className="font-semibold text-sm text-[#003B75]">{formatDate(meeting.meetingDate)}</p>
          </div>

          <div className="bg-[#F8F9FA] rounded-xl px-3 py-2">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-0">Time</p>
            <p className="font-semibold text-sm text-[#003B75]">{formatTime(meeting.meetingTime)}</p>
          </div>

          <div className="bg-[#F8F9FA] rounded-xl px-3 py-2">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-0">Venue</p>
            <p className="font-semibold text-sm text-[#003B75]">{meeting.venue}</p>
          </div>

          <div className="bg-[#F8F9FA] rounded-xl px-3 py-2">
            <p className="text-[10px] uppercase text-gray-500 font-bold mb-0">Created By</p>
            <p className="font-semibold text-sm text-[#003B75]">{meeting.createdBy}</p>
          </div>

        </div>

       

      </div>

      <div className="bg-white rounded-3xl shadow-lg p-4 mt-4">

        <h2 className="text-base font-bold text-[#003B75] mb-3 flex items-center gap-2">
          📋 Meeting Agenda
        </h2>

        <div className="overflow-hidden rounded-2xl border border-gray-200">

          {agenda.map((item, index) => (

            <div
              key={index}
              className="bg-white px-3 py-2 border-b last:border-b-0"
            >

              <div className="flex gap-2 items-start">

                <div className="font-bold text-[#003B75] text-sm shrink-0">
                  {item.serial}.
                </div>

                <div className="font-semibold text-sm text-[#003B75] text-sm">
                  {item.title}
                </div>

              </div>

              {item.notes && (
                <div className="ml-5 mt-1 text-gray-600 whitespace-pre-wrap">
                  {item.notes}
                </div>
              )}

            </div>

          ))}

        </div>
<div className="bg-white rounded-3xl shadow-lg p-4 mt-4">

  <h2 className="text-base font-bold text-[#003B75] mb-3 flex items-center gap-2">
    📢 Secretary's Message
  </h2>

  <p className="whitespace-pre-wrap leading-7 text-gray-700 text-sm">
    {meeting.announcement}
  </p>

  <div className="mt-4 pt-3 border-t border-gray-200">

    <p className="text-xs text-gray-500">
      Secretary
    </p>

    <p className="font-semibold text-[#003B75] text-sm">
      {meeting.createdBy}
    </p>

  </div>

</div>
      </div>

    </div>
  );
}