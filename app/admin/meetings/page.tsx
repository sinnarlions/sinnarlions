"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/firebase/config";

import { Meeting } from "@/src/types/meeting";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const snapshot = await getDocs(collection(db, "meetings"));

      const data: Meeting[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Meeting, "id">),
      }));

     data.sort(
  (a, b) =>
    new Date(a.meetingDate).getTime() -
    new Date(b.meetingDate).getTime()
);

      setMeetings(data);
    } catch (error) {
      console.error("Error loading meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">
          📅 Meetings Management
        </h1>

        <Link
          href="/admin/meetings/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          + New Meeting
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">
          <p className="text-lg text-gray-600">
            Loading meetings...
          </p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-10 text-center">

          <div className="text-6xl mb-4">
            📅
          </div>

          <h2 className="text-2xl font-semibold mb-2">
            No Meetings Found
          </h2>

          <p className="text-gray-500 mb-6">
            No meetings have been created yet.
          </p>

          <Link
            href="/admin"
            className="inline-block bg-blue-600 text-white px-5 py-2 rounded-lg"
          >
            ← Back to Admin
          </Link>

        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Time</th>
                <th className="text-left p-4">Venue</th>
                <th className="text-left p-4">Status</th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {meetings.map((meeting) => (
                <tr
                  key={meeting.id}
                  className="border-t"
                >
                  <td className="p-4 font-medium">
                    {meeting.meetingTitle}
                  </td>

             <td className="p-4 whitespace-nowrap">
  {new Date(meeting.meetingDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}
</td>
                  <td className="p-4">
                    {meeting.meetingTime}
                  </td>

                  <td className="p-4">
                    {meeting.venue}
                  </td>

                  <td className="p-4">
  <span
    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
      ${
        meeting.status === "Upcoming"
          ? "bg-green-100 text-green-700"
          : meeting.status === "Completed"
          ? "bg-gray-200 text-gray-700"
          : "bg-red-100 text-red-700"
      }`}
  >
    <span>
      {meeting.status === "Upcoming"
        ? "🟢"
        : meeting.status === "Completed"
        ? "⚪"
        : "🔴"}
    </span>

    {meeting.status}
  </span>
</td>
                <td className="p-4 text-center space-x-2">

  <Link
    href={`/admin/meetings/${meeting.id}/view`}
    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
  >
    👁 View
  </Link>

  <Link
    href={`/admin/meetings/${meeting.id}/edit`}
    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm"
  >
    ✏ Edit
  </Link>

 

</td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}