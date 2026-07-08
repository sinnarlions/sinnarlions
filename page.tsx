"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { db } from "./src/firebase/config";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function Home() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [mobile, setMobile] = useState("");
  const [memberVerified, setMemberVerified] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [celebrations, setCelebrations] = useState<any[]>([]);
  const [upcomingCelebrations, setUpcomingCelebrations] = useState<any[]>([]);
  const [upcomingMeeting, setUpcomingMeeting] = useState<any>(null);

  useEffect(() => {
    const savedMobile = localStorage.getItem("memberMobile");
    const savedName = localStorage.getItem("memberName");
    if (savedMobile) setMemberVerified(true);
    if (savedName) setMemberName(savedName);
    
    cleanupExpiredAnnouncements();
    loadCelebrations();
    loadUpcomingCelebrations();
    loadUpcomingMeeting();
    loadAnnouncements();
  }, []);

  const cleanupExpiredAnnouncements = async () => {
    const snapshot = await getDocs(collection(db, "announcements"));
    const today = new Date().toISOString().split("T")[0];
    for (const item of snapshot.docs) {
      const data = item.data();
      if (data.deleteAfter && data.deleteAfter < today) {
        await deleteDoc(doc(db, "announcements", item.id));
      }
    }
  };

  const loadCelebrations = async () => {
    const snapshot = await getDocs(collection(db, "members"));
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    const data: any[] = [];
    snapshot.forEach((doc) => {
      const member = doc.data();
      if (member.dob) {
        const parts = member.dob.split(".");
        if (Number(parts[0]) === todayDay && Number(parts[1]) === todayMonth) {
          data.push({ id: doc.id, type: "Birthday", name: member.name });
        }
      }
      if (member.anniversary) {
        const parts = member.anniversary.split(".");
        if (Number(parts[0]) === todayDay && Number(parts[1]) === todayMonth) {
          data.push({ id: doc.id, type: "Anniversary", name: `${member.name} & ${member.spouseName}` });
        }
      }
    });
    setCelebrations(data);
  };

  const loadUpcomingCelebrations = async () => {
    const snapshot = await getDocs(collection(db, "members"));
    const today = new Date();
    const data: any[] = [];
    snapshot.forEach((doc) => {
      const member = doc.data();
      const checkDate = (dateString: string, type: string, name: string) => {
        const parts = dateString.split(".");
        const nextDate = new Date(today.getFullYear(), Number(parts[1]) - 1, Number(parts[0]));
        if (nextDate < today) nextDate.setFullYear(today.getFullYear() + 1);
        const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays <= 8) data.push({ type, name, days_left: diffDays });
      };
      if (member.dob) checkDate(member.dob, "Birthday", member.name);
      if (member.anniversary && member.spouseName) checkDate(member.anniversary, "Anniversary", `${member.name} & ${member.spouseName}`);
    });
    data.sort((a, b) => a.days_left - b.days_left);
    setUpcomingCelebrations(data);
  };

  const loadAnnouncements = async () => {
    const snapshot = await getDocs(collection(db, "announcements"));
    const today = new Date().toISOString().split("T")[0];
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((item: any) => item.visibleUntil >= today);
    setAnnouncements(data);
  };

const loadUpcomingMeeting = async () => {
  const snapshot = await getDocs(collection(db, "meetings"));

  console.log("Meeting Docs:", snapshot.docs.length);

  const today = new Date();

  const meetings = snapshot.docs
    .map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    .filter((meeting: any) => {
      return (
        meeting.status === "Upcoming" &&
        new Date(meeting.meetingDate) >= today
      );
    });

  console.log("Upcoming Meetings:", meetings);

  meetings.sort(
    (a: any, b: any) =>
      new Date(a.meetingDate).getTime() -
      new Date(b.meetingDate).getTime()
  );

  if (meetings.length > 0) {
    setUpcomingMeeting(meetings[0]);
  }
};

  return (
    <main className="min-h-screen bg-[#825232] flex flex-col antialiased font-sans">
      {/* HEADER */}
      <header className="py-10 px-4 text-center text-white">
        <div className="flex items-center justify-center gap-6 md:gap-16">
          <Image src="/logo.png" alt="Lions Logo" width={70} height={70} className="hidden sm:block" />
          <div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Lions Connect</h1>
            <h2 className="text-2xl md:text-3xl font-medium mt-1 opacity-90">Lions Club of Sinnar City</h2>
          </div>
          <Image src="/logo.png" alt="Lions Logo" width={85} height={85} className="hidden sm:block" />
        </div>
        <p className="mt-4 text-xs md:text-base uppercase tracking-[0.3em] font-bold opacity-60">
          Celebrations • Meetings • Activities • Announcements
        </p>
      </header>

      {/* CONTENT AREA */}
      <div className="flex-1 bg-[#FDF2E9] rounded-t-[50px] px-4 md:px-12 pt-8 pb-12 shadow-inner border-x-[12px] border-[#825232]">
        
        {/* LOGGED IN STATUS */}
        <div className="flex justify-end mb-8 max-w-5xl mx-auto">
          {memberVerified ? (
            <div className="flex items-center bg-[#D9D9D9] p-1.5 px-4 rounded-xl border border-black/5 shadow-sm">
              <div className="mr-5">
                <p className="text-[9px] uppercase text-black/40 font-black tracking-widest leading-none mb-1">Status</p>
                <p className="font-bold text-[#454545] text-base leading-none">{memberName}</p>
              </div>
              <button 
                onClick={() => { localStorage.clear(); location.reload(); }}
                className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-[#454545] border border-black/10 active:bg-gray-100"
              >
                Log Out
              </button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} className="bg-white border border-[#825232]/20 px-6 py-2 rounded-xl text-[#825232] font-bold shadow-md">Member Login</button>
          )}
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* SECTION 1: TODAY'S HIGHLIGHTS (PEACH) */}
          <section>
            {celebrations.length === 0 ? (
              <div className="relative bg-[#454545] rounded-[35px] w-full overflow-hidden">
                <div className="ml-[18px] bg-[#F8E3D5] rounded-[35px] p-10 min-h-[320px] flex flex-col justify-center">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-black text-black/30 mb-2">Today's Highlights</h3>
                  <h4 className="text-3xl font-serif text-[#622A1E]/30 italic">No event today</h4>
                </div>
              </div>
            ) : (
              celebrations.map((item, idx) => (
                <div key={idx} className="relative bg-[#454545] rounded-[35px] w-full overflow-hidden cursor-pointer" onClick={() => router.push(`/celebration/${item.id}`)}>
                  <div className="ml-[18px] bg-[#F8E3D5] rounded-[35px] p-10 md:p-14 min-h-[320px] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-black text-black/40">Today's Highlights</h3>
                      <span className="text-[#A64D5E] font-black text-lg">{item.type}</span>
                    </div>
                    <h4 className="text-4xl md:text-5xl font-serif font-bold text-[#622A1E] italic leading-tight text-center md:text-left">{item.name}</h4>
                    <div className="h-4" /> {/* Spacer */}
                  </div>
                </div>
              ))
            )}
          </section>
{/* UPCOMING MEETING */}
<section>
  {!upcomingMeeting ? (
    <div className="relative bg-[#454545] rounded-[35px] w-full overflow-hidden">
      <div className="ml-[18px] bg-[#EEF6FF] rounded-[35px] p-10 min-h-[220px] flex flex-col justify-center">
        <h3 className="text-xs uppercase tracking-[0.2em] font-black text-black/30 mb-2">
          Upcoming Meeting
        </h3>

        <h4 className="text-2xl font-serif text-[#622A1E]/30 italic">
          No Upcoming Meeting
        </h4>
      </div>
    </div>
  ) : (
    <div className="relative bg-[#454545] rounded-[35px] w-full overflow-hidden">
      <div className="ml-[18px] bg-[#EEF6FF] rounded-[35px] p-10 md:p-14 min-h-[220px] flex flex-col justify-between">

        <div className="flex justify-between items-start">
          <h3 className="text-xs uppercase tracking-[0.2em] font-black text-black/40">
            Upcoming Meeting
          </h3>

          <span className="text-blue-700 font-black text-lg">
            📅 Meeting
          </span>
        </div>

        <h4 className="text-3xl md:text-4xl font-serif font-bold text-[#622A1E] leading-snug">
          {upcomingMeeting.meetingTitle}
        </h4>

        <div className="flex flex-wrap gap-4 text-[#622A1E]/70 font-bold text-sm mt-4">
          <span>
            📅 {new Date(upcomingMeeting.meetingDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>

          <span>
            🕒 {upcomingMeeting.meetingTime}
          </span>

          <span>
            📍 {upcomingMeeting.venue}
          </span>
        </div>

      </div>
    </div>
  )}
</section>

          {/* SECTION 2: CLUB UPDATES (CREAM) */}
          <section>
            {announcements.length === 0 ? (
              <div className="relative bg-[#454545] rounded-[35px] w-full overflow-hidden">
                <div className="ml-[18px] bg-[#FAF1E8] rounded-[35px] p-10 min-h-[320px] flex flex-col justify-center">
                   <h3 className="text-xs uppercase tracking-[0.2em] font-black text-black/30 mb-2">Club Updates</h3>
                   <h4 className="text-2xl font-serif text-[#622A1E]/30 italic">No updates available</h4>
                </div>
              </div>
            ) : (
              announcements.map((item) => (
                <div key={item.id} className="relative bg-[#454545] rounded-[35px] w-full overflow-hidden">
                  <div className="ml-[18px] bg-[#FAF1E8] rounded-[35px] p-10 md:p-14 min-h-[320px] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-black text-black/40">Club Updates</h3>
                      <span className="text-[#A64D5E] font-black text-lg">{item.type || 'Activity'}</span>
                    </div>
                    <h4 className="text-3xl md:text-5xl font-serif font-bold text-[#622A1E] leading-snug">{item.title}</h4>
                    <div className="flex flex-wrap gap-4 text-[#622A1E]/70 font-bold text-xs md:text-sm">
                      <span>📂 {item.type}</span>
                      <span>👤 {item.author}</span>
                      {item.eventDate && <span>📅 {new Date(item.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* SECTION 3: COMING UP THIS WEEK (BEIGE) */}
          <section>
            {upcomingCelebrations.length === 0 ? (
               <div className="relative bg-[#454545] rounded-[35px] w-full overflow-hidden">
                <div className="ml-[18px] bg-[#F2DFD0] rounded-[35px] p-10 min-h-[320px] flex flex-col justify-center">
                   <h3 className="text-xs uppercase tracking-[0.2em] font-black text-black/30 mb-2">Upcoming This Week</h3>
                   <h4 className="text-2xl font-serif text-[#622A1E]/30 italic text-center">Nothing scheduled</h4>
                </div>
              </div>
            ) : (
              upcomingCelebrations.slice(0, 1).map((item, idx) => (
                <div key={idx} className="relative bg-[#454545] rounded-[35px] w-full overflow-hidden">
                  <div className="ml-[18px] bg-[#F2DFD0] rounded-[35px] p-10 md:p-14 min-h-[320px] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs uppercase tracking-[0.2em] font-black text-black/40">Coming Up This Week</h3>
                      <span className="text-[#A64D5E] font-black text-lg">{item.type}</span>
                    </div>
                    <h4 className="text-4xl md:text-5xl font-serif font-bold text-[#622A1E] italic leading-tight text-center md:text-left">{item.name}</h4>
                    <p className="text-[#A64D5E] font-black uppercase tracking-widest text-[10px] md:text-xs">
                      Starts in {item.days_left} days
                    </p>
                  </div>
                </div>
              ))
            )}
          </section>

        </div>
      </div>

      <footer className="bg-[#825232] py-8 text-center">
        <p className="text-white/30 text-[9px] font-black tracking-[0.4em] uppercase">App Developed By: Jitendra Jagtap</p>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[40px] bg-[#FDF2E9] p-10 shadow-2xl border-t-[8px] border-[#825232]">
            <h2 className="text-3xl font-bold text-[#622A1E] text-center mb-10">Member Login</h2>
            <input
              type="text"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full rounded-2xl border-2 border-[#825232]/10 bg-white px-6 py-4 text-xl outline-none focus:border-[#825232]"
            />
            <button
              onClick={async () => {
                const q = query(collection(db, "members"), where("mobile", "==", mobile));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                  const data = querySnapshot.docs[0].data();
                  localStorage.setItem("memberName", data.name);
                  localStorage.setItem("memberMobile", mobile);
                  setMemberName(data.name);
                  setMemberVerified(true);
                  setShowLogin(false);
                } else { alert("Member not found."); }
              }}
              className="mt-6 w-full rounded-2xl bg-[#825232] py-4 font-bold text-white text-xl"
            >
              Verify Member
            </button>
            <button onClick={() => setShowLogin(false)} className="mt-4 w-full text-[#622A1E]/40 font-bold uppercase tracking-widest text-[10px]">Cancel</button>
          </div>
        </div>
      )}
    </main>
  );
}