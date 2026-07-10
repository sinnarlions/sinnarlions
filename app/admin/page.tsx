"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/src/firebase/config"; // Standardized absolute path
import Link from "next/link";


// Consolidated permission imports using absolute paths
import { 
  canAccessAdmin,
  canPublishAnnouncement,
  canEditAnnouncement,
  canDeleteAnnouncement,
  isSuperAdmin as checkSuperAdmin
} from "@/src/utils/permissions";

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
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [venue, setVenue] = useState("");

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
   

    // Evaluate permissions using the updated robust helper functions
    const allowed = canAccessAdmin(user);
    const superAdminStatus = checkSuperAdmin(user);
    
    setCanPublish(canPublishAnnouncement(user));
    setCanEdit(canEditAnnouncement(user));
    setCanDelete(canDeleteAnnouncement(user));


    setIsSuperAdmin(superAdminStatus);
    setCurrentRole(user.currentLionsRole || "");

    if (!superAdminStatus) {
      setAuthor(user.currentLionsRole || "Member");
    }

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

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    data.sort((a: any, b: any) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime();
    });

    setAnnouncements(data);
  };

  const clearForm = () => {
    setTitle("");
    setMessage("");
    setType("Notice");
    setAuthor(isSuperAdmin ? "President" : currentRole);
    setEventDate("");
    setEventTime("");
    setVenue("");
    setEditingId("");
  };

  const handlePublish = async () => {
    if (!title || !message || !eventDate || !author) {
      alert("Please fill all required fields.");
      return;
    }

    const visibleUntil = eventDate;
    const deleteAfterDate = new Date(eventDate);
    deleteAfterDate.setDate(deleteAfterDate.getDate() + 3);
    const deleteAfter = deleteAfterDate.toISOString().split("T")[0];

    if (editingId) {
      await updateDoc(doc(db, "announcements", editingId), {
        title,
        message,
        type,
        author,
        eventDate,
        eventTime,
        venue,
        visibleUntil,
        deleteAfter,
      });
      alert("Announcement Updated ✅");
    } else {
      await addDoc(collection(db, "announcements"), {
        title,
        message,
        type,
        author,
        eventDate,
        eventTime,
        venue,
        visibleUntil,
        deleteAfter,
        createdAt: serverTimestamp(),
      });
      alert("Announcement Published ✅");
    }

    clearForm();
    loadAnnouncements();
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("Delete this announcement?");
    if (!ok) return;

    await deleteDoc(doc(db, "announcements", id));
    loadAnnouncements();
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setMessage(item.message || "");
    setType(item.type || "Notice");
    setAuthor(item.author || "President");
    setEventDate(item.eventDate || "");
    setEventTime(item.eventTime || "");
    setVenue(item.venue || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getCardBgClass = (cardType: string) => {
    switch (cardType) {
      
      case "Activity":
        return "bg-amber-50/50 border-amber-200/60";
      case "Emergency":
        return "bg-rose-50/40 border-rose-200/60";
      case "Notice":
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-3 sm:p-6 md:p-8 antialiased font-sans">
      <div className="mx-auto max-w-4xl space-y-4">
        
        {/* --- OPTIMIZED HEADER --- */}
        <div className="flex items-center justify-between border-b border-gray-200/60 pb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#003B75] tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-[10px] font-bold text-[#F2A900] uppercase tracking-wider">
              Lions Club of Sinnar City
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-bold text-[#003B75] shadow-xs hover:bg-gray-50 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
          >
            ← Home
          </button>
        </div>

        {/* --- LOGGED IN AS (TOP SLIM BAR) --- */}
        <div className="rounded-xl bg-[#F2A900]/10 border border-[#F2A900]/20 px-4 py-2 flex items-center justify-between text-xs font-bold text-[#003B75] shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 font-medium">Logged in as :</span>
            <span className="font-black tracking-wide">{isSuperAdmin ? "Super Admin" : currentRole}</span>
          </div>
          <span>{isSuperAdmin ? "🛡️" : "⚡"}</span>
        </div>



        {/* --- MAIN ANNOUNCEMENT FORM --- */}
        <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-1.5">
            <h2 className="text-base font-black text-[#003B75]">
              {editingId ? "✏️ Edit Mode Active" : "📢 Add New Announcement"}
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Announcement Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Installation Meeting / Blood Donation Drive"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#003B75] bg-gray-50/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Announcement Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:border-[#003B75] bg-gray-50/50 transition-colors cursor-pointer"
                >
                  
                  <option>Activity</option>
                  <option>Notice</option>
                  <option>Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Published By <span className="text-red-500">*</span>
                </label>
                {isSuperAdmin ? (
                  <select
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:border-[#003B75] bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <option>President</option>
                    <option>Secretary</option>
                    <option>Treasurer</option>
                    <option>Admin</option>
                  </select>
                ) : (
                  <div className="w-full rounded-xl border border-gray-200 bg-gray-100 p-2.5 text-sm font-extrabold text-[#003B75]">
                    {currentRole}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#003B75] bg-gray-50/50 transition-colors cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Event Time
                </label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#003B75] bg-gray-50/50 transition-colors cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g., Thorat Hospital"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#003B75] bg-gray-50/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Announcement Message <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Write the announcement details here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full min-h-[90px] rounded-xl border border-gray-200 p-2.5 text-sm font-medium focus:outline-none focus:border-[#003B75] bg-gray-50/50 transition-colors whitespace-pre-wrap"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            {canPublish && (
              <button
                onClick={handlePublish}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-[#003B75] text-white font-bold text-xs shadow-sm hover:bg-[#00274d] active:scale-[0.98] transition-all cursor-pointer"
              >
                {editingId ? "✏️ Update" : "📢 Publish"}
              </button>
            )}
            {editingId && (
              <button
                onClick={clearForm}
                className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-300 active:scale-[0.98] transition-all cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* --- STATISTICS ROW --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-xl bg-[#003B75]/5 border border-[#003B75]/10 px-3 py-1.5 flex items-center justify-between gap-2 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Published Updates:</span>
            <span className="text-xs font-black text-[#003B75]">{announcements.length}</span>
          </div>

          <div className="rounded-xl bg-[#003B75]/5 border border-[#003B75]/10 px-3 py-1.5 flex items-center justify-between gap-2 shadow-xs min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 shrink-0">Latest Bulletin :</span>
            <span className="text-xs font-bold text-gray-600 truncate">{announcements[0]?.title || "None"}</span>
          </div>
        </div>

        {/* --- PUBLISHED ANNOUNCEMENTS LIST --- */}
        <div className="space-y-2.5">
          <div className="border-b border-gray-200 pb-0.5">
            <h2 className="text-xs font-black text-[#003B75] uppercase tracking-wider">
              📋 Published Bulletins
            </h2>
          </div>

          {announcements.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-center">
              <p className="text-xs font-medium text-gray-400 italic">No announcements published yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {announcements.map((item: any) => (
                <div
                  key={item.id}
                  className={`relative rounded-xl border p-3.5 shadow-xs transition-all hover:shadow-xs ${getCardBgClass(item.type)}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 border-b border-gray-200/50 pb-1.5">
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#003B75] tracking-tight">
                        {item.title}
                      </h3>
                      
                      {(() => {
                        const today = new Date().toISOString().split("T")[0];
                        let status = "Upcoming";
                        let pillClass = "bg-amber-100/60 text-amber-800 border-amber-200/60";

                        if (item.visibleUntil && today > item.visibleUntil) {
                          status = "Expired";
                          pillClass = "bg-rose-100/60 text-rose-800 border-rose-200/60";
                        } else if (item.eventDate && today >= item.eventDate) {
                          status = "Active Today";
                          pillClass = "bg-green-100/70 text-green-800 border-green-200/60";
                        }

                        return (
                          <div className={`mt-0.5 inline-flex items-center rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${pillClass}`}>
                            {status}
                          </div>
                        );
                      })()}
                    </div>

                    <span className="self-start sm:self-center bg-[#003B75]/10 text-[#003B75] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-[#003B75]/10 whitespace-nowrap">
                      {item.type}
                    </span>
                  </div>

                  <p className="mt-2 text-sm sm:text-base text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                    {item.message}
                  </p>

                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs font-bold text-gray-400 border-t border-gray-200/50 pt-2">
                    <div className="flex items-center gap-1">
                      <span>📅 Date:</span>
                      <span className="text-gray-600">
                        {item.eventDate
                          ? new Date(item.eventDate).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span>🕒 Time:</span>
                      <span className="text-gray-600">{item.eventTime || "-"}</span>
                    </div>

                    <div className="flex items-center gap-1 truncate">
                      <span>📍 Venue:</span>
                      <span className="text-gray-600 truncate">{item.venue || "-"}</span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-gray-200/50 pt-2">
                    <div className="inline-flex items-center gap-1 bg-white/80 border border-gray-200 rounded-md px-2 py-0.5 text-xs font-bold text-gray-500 self-start shadow-xs">
                      <span>👤 Published By :</span>
                      <span className="text-[#003B75] font-extrabold">{item.author}</span>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 self-end sm:self-auto">
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(item)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 text-xs font-bold transition-all shadow-xs hover:bg-blue-50 cursor-pointer flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-600 text-xs font-bold transition-all shadow-xs hover:bg-rose-50 cursor-pointer flex items-center gap-1"
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

{/* Secretary Tools */}
{currentRole === "Secretary" && (
  <>
    <h2 className="text-xl font-bold text-gray-800 mt-10 mb-4">
      Secretary Tools
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link
        href="/admin/meetings"
        className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
      >
        <div className="text-4xl mb-3">📅</div>

        <h3 className="text-lg font-bold">
          Meetings Management
        </h3>

        <p className="text-gray-600 text-sm mt-2">
          Create and manage club meetings.
        </p>
      </Link>
    </div>
  </>
)}

{/* ================= SUPER ADMIN TOOLS ================= */}
{/* ================= SUPER ADMIN ================= */}
{isSuperAdmin && (
  <>
    {/* ---------- SUPER ADMIN TOOLS ---------- */}
    <section className="mt-8 rounded-2xl border border-[#F2A900]/30 bg-[#FFFBEA]/40 p-4">

      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🛡️</span>
        <h2 className="text-base font-black text-[#003B75]">
          Super Admin Tools
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">

        <button
          onClick={() => router.push("/admin/members")}
          className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-[#003B75] hover:shadow-md"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">👥</span>
            <span className="text-[13px] font-semibold text-[#003B75]">
              Members
            </span>
          </div>

          <span className="text-gray-400">→</span>
        </button>

        <button
          onClick={() => router.push("/admin/security")}
          className="flex cursor-pointer items-center justify-between rounded-xl border border-red-200 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-red-400 hover:shadow-md"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🔐</span>
            <span className="text-[13px] font-semibold text-[#003B75]">
              Security
            </span>
          </div>

          <span className="text-red-400">→</span>
        </button>

      </div>

    </section>

    {/* ---------- CLUB MANAGEMENT ---------- */}

    <section className="mt-6">

      <div className="mb-3 flex items-center gap-2">
        <span className="text-lg">🏛️</span>
        <h2 className="text-base font-black text-[#003B75]">
          Club Management
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">

        <button
          onClick={() => router.push("/admin/past-presidents")}
          className="cursor-pointer rounded-xl border border-yellow-200 bg-white px-4 py-2.5 text-left shadow-sm transition-all hover:border-yellow-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <span className="text-lg">👑</span>

              <span className="text-[13px] font-semibold text-[#003B75] leading-4">
                Past Presidents
              </span>
            </div>

            <span className="text-gray-400">→</span>

          </div>
        </button>

        <button
          onClick={() => router.push("/admin/club-information")}
          className="cursor-pointer rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-left shadow-sm transition-all hover:border-blue-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <span className="text-lg">🏛️</span>

              <span className="text-[13px] font-semibold text-[#003B75] leading-4">
                Club Information
              </span>
            </div>

            <span className="text-gray-400">→</span>

          </div>
        </button>

        <button
          onClick={() => router.push("/admin/club-awards")}
          className="cursor-pointer rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-left shadow-sm transition-all hover:border-amber-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>

              <span className="text-[13px] font-semibold text-[#003B75] leading-4">
                Club Awards
              </span>
            </div>

            <span className="text-gray-400">→</span>

          </div>
        </button>

        <button
          onClick={() => router.push("/admin/signature-projects")}
          className="cursor-pointer rounded-xl border border-green-200 bg-white px-4 py-2.5 text-left shadow-sm transition-all hover:border-green-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <span className="text-lg">🌱</span>

              <span className="text-[13px] font-semibold text-[#003B75] leading-4">
                Signature Projects
              </span>
            </div>

            <span className="text-gray-400">→</span>

          </div>
        </button>

        <button
          onClick={() => router.push("/admin/committees")}
          className="cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-left shadow-sm transition-all hover:border-gray-500 hover:shadow-md"
        >
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">
              <span className="text-lg">👥</span>

              <span className="text-[13px] font-semibold text-[#003B75] leading-4">
                Committees
              </span>
            </div>

            <span className="text-gray-400">→</span>

          </div>
        </button>
<button
  onClick={() => router.push("/admin/cabinet-officers")}
  className="cursor-pointer rounded-xl border border-cyan-200 bg-white px-4 py-2.5 text-left shadow-sm transition-all hover:border-cyan-400 hover:shadow-md"
>
  <div className="flex items-center justify-between">

    <div className="flex items-center gap-2">
      <span className="text-lg">🛡️</span>

      <span className="text-[13px] font-semibold text-[#003B75] leading-4">
        Cabinet Officers
      </span>
    </div>

    <span className="text-gray-400">→</span>

  </div>
</button>
      </div>

    </section>
  </>
)}
      </div>
      
    </main>
  );
}