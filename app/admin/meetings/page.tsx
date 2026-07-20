"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "@/src/firebase/config";
import { Meeting } from "@/src/types/meeting";

export default function MeetingsPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

 useEffect(() => {
  const checkAccess = () => {
    const memberData = localStorage.getItem("member");

    if (!memberData) {
      router.replace("/");
      return;
    }

    const user = JSON.parse(memberData);

    if (
      user.isSuperAdmin ||
      user.currentLionsRole === "Secretary"
    ) {
      loadMeetings();
    } else {
      router.replace("/");
    }
  };

  checkAccess();

  window.addEventListener("pageshow", checkAccess);

  return () => {
    window.removeEventListener("pageshow", checkAccess);
  };
}, [router]);

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  const deleteMeeting = async (meetingId: string) => {
    const ok = confirm(
      "Delete this meeting?\n\nAgenda will also be deleted."
    );

    if (!ok) return;

    try {
      setDeletingId(meetingId);

      await deleteDoc(doc(db, "meetings", meetingId));

      await deleteDoc(doc(db, "meetingAgendas", meetingId));

      setMeetings((prev) =>
        prev.filter((m) => m.id !== meetingId)
      );

      alert("Meeting deleted.");

    } catch (error) {
      console.error(error);
      alert("Unable to delete meeting.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">

      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-6">

          <div>

            <Link
              href="/admin"
              className="text-[#003B75] font-bold text-sm"
            >
              ← Back
            </Link>

            <h1 className="text-2xl md:text-3xl font-bold mt-2 text-[#003B75]">
              Meetings Management
            </h1>

          </div>

          <Link
            href="/admin/meetings/new"
            className="bg-[#003B75] hover:bg-[#00529B] text-white px-4 py-3 rounded-xl font-bold"
          >
            + New Meeting
          </Link>

        </div>

        {loading ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow">
            Loading meetings...
          </div>
        ) : meetings.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow">

            <div className="text-6xl mb-4">
              📅
            </div>

            <h2 className="text-2xl font-bold">
              No Meetings Found
            </h2>

            <p className="text-gray-500 mt-2">
              No meetings have been created yet.
            </p>

          </div>
        ) : (
                    <>
            {/* Mobile View */}
            <div className="grid gap-4 md:hidden">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-white rounded-2xl shadow border border-gray-100 p-5"
                >
                  <h2 className="text-lg font-bold text-[#003B75]">
                    {meeting.meetingTitle}
                  </h2>

                  <div className="mt-4 space-y-2 text-sm text-gray-700">

                    <div>
                      📅{" "}
                      {new Date(meeting.meetingDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </div>

                    <div>
                      🕒 {formatTime(meeting.meetingTime)}
                    </div>

                    <div>
                      📍 {meeting.venue}
                    </div>

                    <div className="pt-2">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          meeting.status === "Upcoming"
                            ? "bg-green-100 text-green-700"
                            : meeting.status === "Completed"
                            ? "bg-gray-200 text-gray-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {meeting.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5">

                    <Link
                      href={`/admin/meetings/${meeting.id}/view`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-semibold"
                    >
                      👁 View
                    </Link>

                    <Link
                      href={`/admin/meetings/${meeting.id}/edit`}
                      className="flex-1 bg-yellow-500 text-white text-center py-2 rounded-lg text-sm font-semibold"
                    >
                      ✏ Edit
                    </Link>

                    <button
                      onClick={() => {
  if (meeting.id) {
    deleteMeeting(meeting.id);
  }
}}
                      disabled={meeting.id ? deletingId === meeting.id : true}
                      className="bg-red-600 text-white px-4 rounded-lg text-sm font-semibold disabled:bg-gray-400"
                    >
                      🗑
                    </button>

                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-2xl shadow overflow-hidden">

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
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-4 font-medium">
                        {meeting.meetingTitle}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {new Date(meeting.meetingDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>

                      <td className="p-4">
                        {formatTime(meeting.meetingTime)}
                      </td>

                      <td className="p-4">
                        {meeting.venue}
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            meeting.status === "Upcoming"
                              ? "bg-green-100 text-green-700"
                              : meeting.status === "Completed"
                              ? "bg-gray-200 text-gray-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {meeting.status}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">

                          <Link
                            href={`/admin/meetings/${meeting.id}/view`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            👁 View
                          </Link>

                          <Link
                            href={`/admin/meetings/${meeting.id}/edit`}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg text-sm"
                          >
                            ✏ Edit
                          </Link>

                          <button
                            onClick={() => {
  if (meeting.id) {
    deleteMeeting(meeting.id);
  }
}}
                            disabled={meeting.id ? deletingId === meeting.id : true}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm disabled:bg-gray-400"
                          >
                            🗑 Delete
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>
          </>
        )}

      </div>

    </main>
  );
}