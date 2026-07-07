"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/firebase/config";
import AuthGuard from "@/components/AuthGuard";
import { 
  Calendar, Clock, MapPin, User, Pencil, Trash, 
  Search, Loader2, BookOpen, AlertCircle, Eye 
} from "lucide-react";

interface Meeting {
  id: string;
  meetingTitle: string;
  meetingDate: string;
  meetingTime: string;
  venue: string;
  announcement: string;
  createdBy: string;
  status: "Upcoming" | "Completed" | "Cancelled";
}

interface SectionProps {
  title: string;
  data: Meeting[];
  onDelete: (id: string) => void;
}

export default function MeetingManagementPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      setError(false);
      const snapshot = await getDocs(collection(db, "meetings"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Meeting[];
      setMeetings(data);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("ही सभा कायमची डिलीट करायची?")) {
      try {
        await deleteDoc(doc(db, "meetings", id));
        setMeetings(prev => prev.filter(m => m.id !== id));
      } catch (error) {
        console.error(error);
        alert("Delete करताना Error आली.");
      }
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 text-[#003B75] animate-spin" />
    </div>
  );

  if (error) return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center p-4">
        <AlertCircle className="w-10 h-10 text-red-500" />
        <p className="font-semibold text-red-600">Failed to load meetings.</p>
        <button onClick={fetchMeetings} className="bg-[#003B75] text-white px-5 py-2 rounded-lg">Retry</button>
      </div>
    </AuthGuard>
  );

  const today = new Date().toISOString().split("T")[0];

  const filteredMeetings = meetings.filter(m => 
    m.meetingTitle.toLowerCase().includes(search.toLowerCase()) ||
    m.venue.toLowerCase().includes(search.toLowerCase()) ||
    m.createdBy.toLowerCase().includes(search.toLowerCase())
  );

  const upcoming = filteredMeetings
    .filter((m) => m.meetingDate >= today)
    .sort((a, b) => a.meetingDate.localeCompare(b.meetingDate));

  const past = filteredMeetings
    .filter((m) => m.meetingDate < today)
    .sort((a, b) => b.meetingDate.localeCompare(a.meetingDate));

  return (
    <AuthGuard>
      <main className="min-h-screen bg-[#F8FAFC] py-8 px-4 font-sans">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
               <div className="flex items-center gap-3 mb-2">
  <button
    onClick={() => router.push("/admin")}
    className="px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-[#003B75] text-sm font-bold"
  >
    ← Back
  </button> 
              <h1 className="text-2xl font-black text-[#003B75]">Meeting Management</h1></div>
              <div className="flex gap-4 mt-2 text-[11px] font-black uppercase text-gray-500 tracking-wider">
                <span>{meetings.length} Total</span>
                <span>{upcoming.length} Upcoming</span>
                <span>{past.length} Past</span>
              </div>
            </div>
            <button onClick={() => router.push("/admin/meetings/new")} className="bg-[#F2A900] text-[#003B75] px-6 py-3 rounded-xl font-black hover:bg-[#d69500] transition-all">
              + Create New Meeting
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input 
              placeholder="Search by title, venue or creator..." 
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-[#003B75]/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Section title="Upcoming Meetings" data={upcoming} onDelete={handleDelete} />
          <Section title="Past Meetings" data={past} onDelete={handleDelete} />
        </div>
      </main>
    </AuthGuard>
  );
}

function Section({ title, data, onDelete }: SectionProps) {
  const router = useRouter();
  
  const getBadgeClass = (status: string) => 
    status === "Upcoming" ? "bg-blue-100 text-blue-700" : 
    status === "Cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500";

  const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <section>
      <h2 className="text-xs font-black text-[#003B75] uppercase tracking-widest mb-4">{title}</h2>
      {data.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-dashed text-center">
          <div className="text-3xl mb-2">📅</div>
          <p className="font-bold text-gray-400">No {title.toLowerCase()} found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map((m) => (
            <div key={m.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-[#003B75] hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <h3 className="font-black text-[#003B75]">{m.meetingTitle}</h3>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${getBadgeClass(m.status)}`}>{m.status}</span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-gray-600 font-bold">
                <div className="flex items-center gap-1"><Calendar size={12}/> {formatDate(m.meetingDate)}</div>
                <div className="flex items-center gap-1"><Clock size={12}/> {m.meetingTime}</div>
                <div className="flex items-center gap-1 col-span-2"><MapPin size={12}/> {m.venue}</div>
              </div>

              <p className="mt-3 text-sm text-gray-600 line-clamp-2">{m.announcement}</p>

              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                  <User size={12} /> {m.createdBy}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => router.push(`/admin/meetings/${m.id}/agenda`)} className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg hover:bg-blue-50 text-[#003B75] text-[10px] font-bold">
                    <Eye size={14} /> <span className="hidden md:inline">View</span>
                  </button>
                  <button onClick={() => router.push(`/admin/meetings/edit/${m.id}`)} className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg hover:bg-blue-50 text-[#003B75] text-[10px] font-bold">
                    <Pencil size={14} /> <span className="hidden md:inline">Edit</span>
                  </button>
                  <button onClick={() => onDelete(m.id)} className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg hover:bg-red-50 text-red-600 text-[10px] font-bold">
                    <Trash size={14} /> <span className="hidden md:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}