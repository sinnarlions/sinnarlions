"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, doc, writeBatch, query, where, getDocs, serverTimestamp } from "firebase/firestore";

import { db } from "@/src/firebase/config";




export default function NewMeetingPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    meetingType: "",
    customTitle: "",
    meetingDate: "",
    meetingTime: "",
    venue: "",
    announcement: "प्रिय लायन सदस्य,\n\nआपण सर्वांनी सभेस वेळेवर उपस्थित राहून सभेचे कामकाज यशस्वी करण्यासाठी सहकार्य करावे, ही नम्र विनंती.\n\nधन्यवाद.\n",

  });

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const memberData = localStorage.getItem("member");
    if (!memberData) { router.replace("/"); return; }
    const user = JSON.parse(memberData);
    if (user.isSuperAdmin || ["President", "Secretary"].includes(user.currentLionsRole)) {
      setCurrentUser(user);
    } else {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 9. Validation
    const today = new Date().toISOString().split("T")[0];
    if (formData.meetingDate < today) { alert("Past date not allowed."); return; }
    if (!formData.venue.trim()) { alert("Venue is required."); return; }
    
    const finalTitle = formData.meetingType === "इतर" ? formData.customTitle.trim() : formData.meetingType;
    if (!finalTitle) { alert("Title is required."); return; }

    setLoading(true);
    try {
      // 11. Duplicate Check
      const q = query(collection(db, "meetings"), 
        where("meetingDate", "==", formData.meetingDate),
        where("meetingTime", "==", formData.meetingTime),
        where("meetingType", "==", formData.meetingType)
      );
      const duplicateSnap = await getDocs(q);
      if (!duplicateSnap.empty) { alert("A meeting already exists at this date and time."); setLoading(false); return; }

      // 8. Firestore Batch (Atomic Operation)
      const batch = writeBatch(db);
      const meetingRef = doc(collection(db, "meetings"));
      const agendaRef = doc(db, "meetingAgendas", meetingRef.id);

      // 1-7. Save Meeting
      batch.set(meetingRef, {
        meetingType: formData.meetingType,
        meetingTitle: finalTitle,
        meetingDate: formData.meetingDate,
        meetingTime: formData.meetingTime,
        venue: formData.venue.trim(),
        announcement: formData.announcement,
        status: "Draft", // 1. Important
        createdBy: currentUser?.name,
        createdByMemberCode: currentUser?.memberCode || "N/A",
        createdRole: currentUser?.currentLionsRole,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 3, 6. Save Agenda Items
      const defaultTitles = ["ध्वजवंदन", "मागील सभेचा इतिवृत्तांत वाचून कायम करणे", "आलेला पत्रव्यवहार पाहणे", "विषय क्र.", "विषय क्र.", "विषय क्र.", "विषय क्र.", "विषय क्र.", "आयत्या वेळचे विषय", "राष्ट्रगीत"];
      
      batch.set(agendaRef, {
        meetingId: meetingRef.id,
        items: defaultTitles.map((title, i) => ({ serial: i + 1, title, notes: "" })),
        published: false,
        locked: false,
        preparedBy: currentUser?.name,
        preparedRole: currentUser?.currentLionsRole,
        preparedDate: serverTimestamp(),
        publishedAt: null,
        publishedBy: null,
        updatedAt: serverTimestamp()
      });

      await batch.commit();
      alert("Meeting created successfully.");

      

      router.push(`/admin/meetings/${meetingRef.id}/edit`);

    } catch (error) {
      console.error(error);
      alert("Error creating meeting.");
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <main className="min-h-screen bg-[#F8F9FA] py-8 px-4 font-sans">
      <div className="max-w-md mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-[#003B75] font-bold text-sm">← Back</button>
          <h1 className="text-xl font-bold text-[#003B75]">Create Meeting</h1>
          <div className="w-12"></div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">सभेचा प्रकार *</label>
            <select required className="w-full p-3 rounded-xl border border-gray-200 outline-none" onChange={(e) => setFormData({...formData, meetingType: e.target.value})}>
              <option value="">निवडा...</option>
              <option value="मासिक सर्वसाधारण सभा">मासिक सर्वसाधारण सभा</option>
              <option value="संचालक मंडळ सभा">संचालक मंडळ सभा</option>
              <option value="विशेष सभा">विशेष सभा</option>
              <option value="इतर">इतर</option>
            </select>
          </div>

          {formData.meetingType === "इतर" && (
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">सभेचे नाव *</label>
              <input required className="w-full p-3 rounded-xl border border-gray-200 outline-none" onChange={(e) => setFormData({...formData, customTitle: e.target.value})} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date *</label>
              <input type="date" required className="w-full p-3 rounded-xl border border-gray-200 outline-none" onChange={(e) => setFormData({...formData, meetingDate: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Time *</label>
              <input type="time" required className="w-full p-3 rounded-xl border border-gray-200 outline-none" onChange={(e) => setFormData({...formData, meetingTime: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Venue *</label>
            <input required className="w-full p-3 rounded-xl border border-gray-200 outline-none" onChange={(e) => setFormData({...formData, venue: e.target.value})} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Announcement</label>
            <textarea className="w-full p-3 rounded-xl border border-gray-200 outline-none h-32" value={formData.announcement} onChange={(e) => setFormData({...formData, announcement: e.target.value})} />
          </div>

          <button disabled={loading} className="w-full py-4 rounded-xl font-bold text-white bg-[#003B75] hover:bg-[#00529B] disabled:bg-gray-400">
            {loading ? "Creating..." : "Save & Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}