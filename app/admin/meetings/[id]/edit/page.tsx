"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/src/firebase/config";

export default function EditMeetingPage() {
  const router = useRouter();
  const params = useParams();

  const meetingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [agenda, setAgenda] = useState<any[]>([]);  
  const [formData, setFormData] = useState({
    meetingType: "",
    customTitle: "",
    meetingDate: "",
    meetingTime: "",
    venue: "",
    announcement: "",
    status: "",
  });

useEffect(() => {
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
    setCurrentUser(user);
    loadMeeting();
  } else {
    router.replace("/");
  }
}, [router]);

  const loadMeeting = async () => {
    try {
      const [meetingSnap, agendaSnap] = await Promise.all([
  getDoc(doc(db, "meetings", meetingId)),
  getDoc(doc(db, "meetingAgendas", meetingId)),
]);

      if (!meetingSnap.exists()) {
        alert("Meeting not found.");
        router.push("/admin/meetings");
        return;
      }

      const meeting = meetingSnap.data();

if (agendaSnap.exists()) {
  const agendaData = agendaSnap.data();
  setAgenda(agendaData.items || []);
}

      setFormData({
        meetingType: meeting.meetingType || "",
        customTitle: meeting.meetingTitle || "",
        meetingDate: meeting.meetingDate || "",
        meetingTime: meeting.meetingTime || "",
        venue: meeting.venue || "",
        announcement: meeting.announcement || "",
        status: meeting.status || "Draft",
      });

    } catch (err) {
      console.error(err);
      alert("Unable to load meeting.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
  if (!confirm("मीटिंग Publish करायची आहे का?")) return;

  try {
    const batch = writeBatch(db);

    const meetingRef = doc(db, "meetings", meetingId);
    const agendaRef = doc(db, "meetingAgendas", meetingId);

    batch.update(meetingRef, {
      status: "Upcoming",
      publishedAt: serverTimestamp(),
      publishedBy: currentUser?.name,
      updatedAt: serverTimestamp(),
    });

    batch.update(agendaRef, {
      published: true,
      locked: true,
      publishedAt: serverTimestamp(),
      publishedBy: currentUser?.name,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
setFormData((prev) => ({
  ...prev,
  status: "Published",
}));
    alert("Meeting Published Successfully.");

    router.push(`/admin/meetings/${meetingId}/view`);
  } catch (err) {
    console.error(err);
    alert("Unable to publish meeting.");
  }
};
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);

    try {

      const finalTitle =
        formData.meetingType === "इतर"
          ? formData.customTitle.trim()
          : formData.meetingType;

      const batch = writeBatch(db);

const meetingRef = doc(db, "meetings", meetingId);
const agendaRef = doc(db, "meetingAgendas", meetingId);

batch.update(meetingRef, {
  meetingType: formData.meetingType,
  meetingTitle: finalTitle,
  meetingDate: formData.meetingDate,
  meetingTime: formData.meetingTime,
  venue: formData.venue,
  announcement: formData.announcement,
  updatedAt: serverTimestamp(),
});

batch.update(agendaRef, {
  items: agenda,
  updatedAt: serverTimestamp(),
});

await batch.commit();

      alert("Meeting updated successfully.");

      router.push(`/admin/meetings/${meetingId}/view`);

    } catch (err) {
      console.error(err);
      alert("Unable to update meeting.");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }
    return (
    <main className="min-h-screen bg-[#F8F9FA] py-8 px-4 font-sans">
      <div className="max-w-md mx-auto">

        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-[#003B75] font-bold text-sm"
          >
            ← Back
          </button>

          <h1 className="text-xl font-bold text-[#003B75]">
            Edit Meeting
          </h1>

          <div className="w-12"></div>
        </div>

        <form
          onSubmit={handleUpdate}
          className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5"
        >

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              सभेचा प्रकार *
            </label>

            <select
              required
              value={formData.meetingType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  meetingType: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl border border-gray-200 outline-none"
            >
              <option value="">निवडा...</option>
              <option value="मासिक सर्वसाधारण सभा">
                मासिक सर्वसाधारण सभा
              </option>
              <option value="संचालक मंडळ सभा">
                संचालक मंडळ सभा
              </option>
              <option value="विशेष सभा">
                विशेष सभा
              </option>
              <option value="इतर">इतर</option>
            </select>
          </div>

          {formData.meetingType === "इतर" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                सभेचे नाव *
              </label>

              <input
                required
                value={formData.customTitle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customTitle: e.target.value,
                  })
                }
                className="w-full p-3 rounded-xl border border-gray-200 outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Date *
              </label>

              <input
                type="date"
                required
                value={formData.meetingDate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meetingDate: e.target.value,
                  })
                }
                className="w-full p-3 rounded-xl border border-gray-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                Time *
              </label>

              <input
                type="time"
                required
                value={formData.meetingTime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    meetingTime: e.target.value,
                  })
                }
                className="w-full p-3 rounded-xl border border-gray-200 outline-none"
              />
            </div>

          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Venue *
            </label>

            <input
              required
              value={formData.venue}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  venue: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl border border-gray-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Announcement
            </label>

            <textarea
              value={formData.announcement}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  announcement: e.target.value,
                })
              }
              className="w-full p-3 rounded-xl border border-gray-200 outline-none h-32"
            />
          </div>
          <hr className="my-6" />

          <h2 className="text-xl font-bold text-[#003B75]">
            Agenda
          </h2>

          <div className="space-y-4">

            {agenda.map((item, index) => (

              <div
                key={index}
                className="border border-gray-200 rounded-xl p-4"
              >

                <div className="flex items-center justify-between mb-2">

  <div className="font-bold text-[#003B75]">
    Item {item.serial}
  </div>

  <div className="flex items-center gap-2">

    <button
      type="button"
      disabled={index === 0}
      onClick={() => {
        const updated = [...agenda];
        [updated[index - 1], updated[index]] = [
          updated[index],
          updated[index - 1],
        ];

        setAgenda(
          updated.map((item, i) => ({
            ...item,
            serial: i + 1,
          }))
        );
      }}
      className="px-2 py-1 border rounded disabled:opacity-30"
    >
      ▲
    </button>

    <button
      type="button"
      disabled={index === agenda.length - 1}
      onClick={() => {
        const updated = [...agenda];
        [updated[index], updated[index + 1]] = [
          updated[index + 1],
          updated[index],
        ];

        setAgenda(
          updated.map((item, i) => ({
            ...item,
            serial: i + 1,
          }))
        );
      }}
      className="px-2 py-1 border rounded disabled:opacity-30"
    >
      ▼
    </button>

    <button
      type="button"
      onClick={() => {
        const updated = agenda.filter((_, i) => i !== index);

        setAgenda(
          updated.map((item, i) => ({
            ...item,
            serial: i + 1,
          }))
        );
      }}
      className="text-red-600 font-bold text-sm"
    >
      🗑
    </button>

  </div>

</div>

                <input
                  value={item.title}
                  placeholder="Agenda Title"
                  className="w-full p-3 rounded-xl border border-gray-200 mb-3"
                  onChange={(e) => {
                    const updated = [...agenda];
                    updated[index].title = e.target.value;
                    setAgenda(updated);
                  }}
                />

                <textarea
                  rows={2}
                  value={item.notes}
                  placeholder="Notes"
                  className="w-full p-3 rounded-xl border border-gray-200"
                  onChange={(e) => {
                    const updated = [...agenda];
                    updated[index].notes = e.target.value;
                    setAgenda(updated);
                  }}
                />

              </div>

            ))}

          </div>
<button
  type="button"
  onClick={() =>
    setAgenda([
      ...agenda,
      {
        serial: agenda.length + 1,
        title: "",
        notes: "",
      },
    ])
  }
  className="w-full py-3 border-2 border-dashed border-[#003B75] rounded-xl font-bold text-[#003B75]"
>
  + Add Agenda Item
</button>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-xl font-bold text-white bg-[#003B75] hover:bg-[#00529B] disabled:bg-gray-400"
          >
            {saving ? "Updating..." : "Update Meeting"}
          </button>
{formData.status !== "Published" && (
  <button
    type="button"
    onClick={handlePublish}
    className="w-full py-4 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700"
  >
    🚀 Publish Meeting
  </button>
)}
        </form>

      </div>
    </main>
  );
}