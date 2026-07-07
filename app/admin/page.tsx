"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase/config";
import { 
  canAccessAdmin,
  canPublishAnnouncement,
  canEditAnnouncement,
  canDeleteAnnouncement,
  isSuperAdmin as checkSuperAdmin
} from "@/utils/permissions";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

export default function AdminPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentRole, setCurrentRole] = useState("");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("Notice"); 
  const [author, setAuthor] = useState("President");

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [editingId, setEditingId] = useState("");
  const [canPublish, setCanPublish] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const member = localStorage.getItem("member");
    if (!member) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(member);
    const allowed = canAccessAdmin(user);
    const superAdminStatus = checkSuperAdmin(user);
    
    setCanPublish(canPublishAnnouncement(user));
    setCanEdit(canEditAnnouncement(user));
    setCanDelete(canDeleteAnnouncement(user));
    setIsSuperAdmin(superAdminStatus);
    setCurrentRole(user.currentLionsRole || "");

    if (!superAdminStatus) setAuthor(user.currentLionsRole || "Member");

    if (!allowed) {
      alert("Access Denied");
      router.replace("/");
      return;
    }

    setAuthorized(true);
    loadAnnouncements();
  }, [router]);

  const loadAnnouncements = async () => {
    const snapshot = await getDocs(collection(db, "announcements"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    data.sort((a: any, b: any) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
    setAnnouncements(data);
  };

  const clearForm = () => {
    setTitle("");
    setMessage("");
    setType("Notice");
    setAuthor(isSuperAdmin ? "President" : currentRole);
    setEditingId("");
  };

  const handlePublish = async () => {
    if (!title || !message || !author) {
      alert("Please fill all required fields.");
      return;
    }

    if (editingId) {
      await updateDoc(doc(db, "announcements", editingId), { title, message, type, author });
      alert("Announcement Updated ✅");
    } else {
      await addDoc(collection(db, "announcements"), {
        title, message, type, author, createdAt: serverTimestamp(),
      });
      alert("Announcement Published ✅");
    }
    clearForm();
    loadAnnouncements();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    await deleteDoc(doc(db, "announcements", id));
    loadAnnouncements();
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setMessage(item.message);
    setType(item.type || "Notice");
    setAuthor(item.author);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getCardBgClass = (cardType: string) => {
    switch (cardType) {
      case "Activity": return "bg-amber-50/50 border-amber-200/60";
      case "Emergency": return "bg-rose-50/40 border-rose-200/60";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-3 sm:p-6 md:p-8 antialiased font-sans">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
          <h1 className="text-xl sm:text-2xl font-black text-[#003B75]">Admin Dashboard</h1>
          <button onClick={() => router.push("/")} className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-bold text-[#003B75]">← Home</button>
        </div>

        {/* Meeting Management Section */}
        <div className="rounded-2xl bg-white border border-gray-200 p-5 shadow-sm">
          <h2 className="text-lg font-black text-[#003B75]">📅 Meeting Management</h2>
          <p className="text-xs text-gray-500 mt-1">Manage Club Meetings, Agendas and Schedule</p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => router.push("/admin/meetings")} className="flex-1 rounded-xl bg-[#003B75] text-white py-3 font-bold hover:bg-[#00529B]">
              View All Meetings
            </button>
            {(currentRole === "Secretary" || isSuperAdmin) && (
              <button onClick={() => router.push("/admin/meetings/new")} className="flex-1 rounded-xl bg-[#F2A900] text-[#003B75] py-3 font-bold hover:bg-[#d69500]">
                + Create New
              </button>
            )}
          </div>
        </div>

        {/* Announcement Management */}
        <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm space-y-4">
          <h2 className="text-base font-black text-[#003B75]">📢 Announcement Management</h2>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-xl border border-gray-200 p-3 text-sm" />
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-sm">
            <option>Activity</option>
            <option>Notice</option>
            <option>Emergency</option>
          </select>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" className="w-full rounded-xl border border-gray-200 p-3 text-sm h-24" />
          {canPublish && (
            <button onClick={handlePublish} className="w-full rounded-xl bg-[#003B75] text-white py-3 font-bold hover:bg-[#00274d]">
              {editingId ? "Update Announcement" : "Publish Announcement"}
            </button>
          )}
        </div>

        {/* Published Bulletins List */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-[#003B75] uppercase tracking-wider">📋 Published Bulletins</h2>
          {announcements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-center">
              <p className="text-sm text-gray-500 italic">No announcements published yet.</p>
            </div>
          ) : (
            announcements.map((item: any) => (
              <div key={item.id} className={`rounded-xl border p-4 ${getCardBgClass(item.type)}`}>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-[#003B75]">{item.title}</h3>
                  <span className="text-[10px] font-bold uppercase bg-white/50 px-2 py-1 rounded">{item.type}</span>
                </div>
                <p className="text-sm mt-2 text-gray-700">{item.message}</p>
                
                {/* Published By Display */}
                <div className="mt-3 text-[10px] text-gray-500 font-bold uppercase">
                  Published By :
                  <span className="text-[#003B75] ml-1">
                    {item.author}
                  </span>
                </div>

                <div className="mt-3 flex gap-4">
                  {canEdit && <button onClick={() => handleEdit(item)} className="text-xs font-bold text-blue-600">Edit</button>}
                  {canDelete && <button onClick={() => handleDelete(item.id)} className="text-xs font-bold text-red-600">Delete</button>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}