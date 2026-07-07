"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/firebase/config";

export default function AgendaBuilderPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };

  const [meeting, setMeeting] = useState<any>(null);
  const [agendaDoc, setAgendaDoc] = useState<any>(null);
  const [agenda, setAgenda] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const memberData = localStorage.getItem("member");
    const user = memberData ? JSON.parse(memberData) : null;
    
    if (!user || user.currentLionsRole !== "Secretary") {
      alert("Access Denied");
      router.replace("/");
      return;
    }
    setCurrentUser(user);
    loadData();
  }, [id, router]);

  const loadData = async () => {
    try {
      const [mSnap, aSnap] = await Promise.all([
        getDoc(doc(db, "meetings", id)),
        getDoc(doc(db, "meetingAgendas", id))
      ]);

      if (!mSnap.exists()) { alert("Meeting not found."); router.back(); return; }
      if (!aSnap.exists()) { alert("Agenda not found."); router.back(); return; }

      setMeeting(mSnap.data());
      setAgendaDoc(aSnap.data());
      setAgenda(aSnap.data().items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const renumber = (items: any[]) => items.map((item, i) => ({ ...item, serial: i + 1 }));

  const updateItem = (index: number, field: string, value: string) => {
    const newAgenda = [...agenda];
    newAgenda[index] = { ...newAgenda[index], [field]: value };
    setAgenda(newAgenda);
  };

  const moveItem = (index: number, direction: number) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= agenda.length) return;
    const newAgenda = [...agenda];
    [newAgenda[index], newAgenda[newIndex]] = [newAgenda[newIndex], newAgenda[index]];
    setAgenda(renumber(newAgenda));
  };

  const deleteItem = (index: number) => {
    setAgenda(renumber(agenda.filter((_, i) => i !== index)));
  };

  const saveAgenda = async (isPublish = false) => {
    if (isPublish && agenda.some(item => !item.title.trim())) {
      alert("All agenda items must have a title.");
      return;
    }

    setSaving(true);
    const batch = writeBatch(db);
    
    const agendaRef = doc(db, "meetingAgendas", id);
    const meetingRef = doc(db, "meetings", id);

    const updateData: any = { items: agenda, updatedAt: serverTimestamp() };

    if (isPublish) {
      updateData.published = true;
      updateData.locked = true;
      updateData.publishedAt = serverTimestamp();
      updateData.publishedBy = currentUser.name;
      batch.update(meetingRef, { status: "Upcoming", updatedAt: serverTimestamp() });
    } else {
      updateData.preparedBy = currentUser.name;
      updateData.preparedRole = currentUser.currentLionsRole;
      updateData.preparedDate = serverTimestamp();
    }

    batch.update(agendaRef, updateData);
    
    try {
      await batch.commit();
      alert(isPublish ? "Agenda Published Successfully." : "Agenda Draft Saved Successfully.");
      if (isPublish) router.push("/admin");
    } catch (e) {
      alert("Error saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-[#003B75] font-bold">Loading...</div>;

  const isLocked = agendaDoc?.locked === true;

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      <div className="bg-[#003B75] p-4 text-white sticky top-0 z-10 shadow-md">
        <button onClick={() => router.back()} className="text-xs font-bold">← Back</button>
        <h1 className="text-lg font-bold mt-1">Agenda Builder</h1>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-l-[#F2A900]">
          <h2 className="font-bold text-[#003B75] text-lg">{meeting.meetingTitle}</h2>
          <p className="text-xs text-gray-500 font-semibold">{meeting.meetingDate} | {meeting.meetingTime}</p>
          <p className="text-xs text-gray-500 font-semibold mt-1">Venue: {meeting.venue}</p>
          <div className="mt-3 pt-2 border-t text-[10px] text-gray-400 font-bold uppercase">Created By: {meeting.createdBy}</div>
        </div>

        {agenda.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-[#F2A900] font-black text-sm">
              <span>{item.serial}.</span>
              {!isLocked && (
                <div className="flex gap-3">
                  <button onClick={() => moveItem(index, -1)} className="text-gray-400">▲</button>
                  <button onClick={() => moveItem(index, 1)} className="text-gray-400">▼</button>
                  <button onClick={() => deleteItem(index)} className="text-red-400">✕</button>
                </div>
              )}
            </div>
            <input 
              disabled={isLocked}
              className="w-full font-bold text-sm outline-none border-b border-gray-100"
              placeholder="Title"
              value={item.title}
              onChange={(e) => updateItem(index, "title", e.target.value)}
            />
            <textarea 
              disabled={isLocked}
              className="w-full text-xs text-gray-600 outline-none mt-1 resize-none"
              placeholder="Notes (Optional)"
              rows={2}
              value={item.notes}
              onChange={(e) => updateItem(index, "notes", e.target.value)}
            />
          </div>
        ))}

        {!isLocked && (
          <button onClick={() => setAgenda([...agenda, { serial: agenda.length + 1, title: "", notes: "" }])} 
                  className="w-full py-3 border-2 border-dashed border-[#003B75] text-[#003B75] font-bold rounded-xl text-sm">
            + Add Agenda Item
          </button>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 flex gap-2 max-w-md mx-auto z-10">
        <button onClick={() => router.back()} className="flex-1 py-3 font-bold border border-gray-200 rounded-xl text-sm">Cancel</button>
        {!isLocked ? (
          <>
            <button onClick={() => saveAgenda(false)} disabled={saving} className="flex-1 py-3 font-bold bg-[#00529B] text-white rounded-xl text-sm">Save Draft</button>
            <button onClick={() => saveAgenda(true)} disabled={saving} className="flex-1 py-3 font-bold bg-[#F2A900] text-[#003B75] rounded-xl text-sm">Publish</button>
          </>
        ) : (
          <div className="flex-1 text-center py-3 font-bold text-[#F2A900] uppercase text-xs border border-[#F2A900] rounded-xl bg-yellow-50">Published - Read Only</div>
        )}
      </div>
    </main>
  );
}