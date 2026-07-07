"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { db } from "../src/firebase/config";

import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  orderBy,
  limit,
} from "firebase/firestore";

export default function Home() {
  const formatName = (name: string) =>
    name
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const router = useRouter();
  
  const [memberVerified, setMemberVerified] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]); // नवीन स्टेट
  const [currentRole, setCurrentRole] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [celebrations, setCelebrations] = useState<any[]>([]);
  const [upcomingCelebrations, setUpcomingCelebrations] = useState<any[]>([]);
  const [selectedAgenda, setSelectedAgenda] = useState<any | null>(null);

  useEffect(() => {
    const handlePageShow = () => {
      const member = localStorage.getItem("member");
      if (!member) {
        router.replace("/login");
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [router]);

  useEffect(() => {
    const member = localStorage.getItem("member");

    if (!member) {
      router.replace("/login");
      return;
    }

    const saved = JSON.parse(member);

    setMemberVerified(true);
    setMemberName(saved.name);
    setIsSuperAdmin(saved.isSuperAdmin || false);

    const userRole = saved.currentLionsRole || "Member";
    setCurrentRole(userRole);

    let unsubscribeSession = () => {};
    
    if (saved && saved.id && saved.sessionId) {
      const memberDocRef = doc(db, "members", saved.id);
      
      unsubscribeSession = onSnapshot(memberDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const liveMemberData = snapshot.data();
          if (saved.sessionId !== liveMemberData.sessionId) {
            alert("Your account has been logged in from another device.");
            localStorage.clear();
            router.replace("/login");
          }
        }
      }, (error) => {
        console.error("Session listener error:", error);
      });
    }

    cleanupExpiredAnnouncements();
    loadCelebrations();
    loadUpcomingCelebrations();
    loadAnnouncements();
    loadUpcomingMeeting(); // नवीन फंक्शन कॉल
    

    return () => {
      unsubscribeSession();
    };
  }, [router]);

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

  const loadUpcomingMeeting = async () => {
    try {
      const q = query(
        collection(db, "meetings"),
        where("status", "==", "Upcoming"),
        orderBy("meetingDate", "asc"),
        limit(3)
      );
      const snapshot = await getDocs(q);
      const meetings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUpcomingMeetings(meetings);
    } catch (error) {
      console.error("Error loading meeting:", error);
    }
  };

  const fetchAgenda = async (meetingId: string) => {
    try {
      const q = query(collection(db, "meetingAgendas"), where("meetingId", "==", meetingId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setSelectedAgenda(snapshot.docs[0].data()); // इथे डेटा सेट होईल
      } else {
        alert("या मीटिंगचे विषय उपलब्ध नाहीत.");
      }
    } catch (error) {
      console.error("Error fetching agenda:", error);
    }
  };

  const loadCelebrations = async () => {
    const snapshot = await getDocs(collection(db, "members"));
    const today = new Date();
    const todayDay = today.getDate();
    const todayMonth = today.getMonth() + 1;
    const data: any[] = [];
    const seenAnniversaries = new Set(); 

    snapshot.forEach((doc) => {
      const member = doc.data();
      if (member.dob) {
        const parts = member.dob.split(".");
        if (Number(parts[0]) === todayDay && Number(parts[1]) === todayMonth) {
          data.push({ id: doc.id, type: "Birthday", name: member.name });
        }
      }
      if (member.anniversary && member.spouseName) {
        const parts = member.anniversary.split(".");
        if (Number(parts[0]) === todayDay && Number(parts[1]) === todayMonth) {
          const n1 = member.name.replace(/Dr\.|Er\.|Shri\./gi, "").trim().toLowerCase();
          const n2 = member.spouseName.replace(/Dr\.|Er\.|Shri\./gi, "").trim().toLowerCase();
          const coupleKey = `${member.anniversary}_${[n1, n2].sort().join("_")}`;
          
          if (!seenAnniversaries.has(coupleKey)) {
            seenAnniversaries.add(coupleKey);
            data.push({ id: doc.id, type: "Anniversary", name: `${member.name} & ${member.spouseName}` });
          }
        }
      }
    });
    setCelebrations(data);
  };

  const loadUpcomingCelebrations = async () => {
    const snapshot = await getDocs(collection(db, "members"));
    const today = new Date();
    const rawData: any[] = [];
    const seenUpcomingAnniversaries = new Set(); 

    snapshot.forEach((doc) => {
      const member = doc.data();
      
      if (member.dob) {
        const parts = member.dob.split(".");
        const nextDate = new Date(today.getFullYear(), Number(parts[1]) - 1, Number(parts[0]));
        if (nextDate < today) nextDate.setFullYear(today.getFullYear() + 1);
        const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0 && diffDays <= 8) {
          rawData.push({ id: doc.id, type: "Birthday", name: member.name, days_left: diffDays });
        }
      }

      if (member.anniversary && member.spouseName) {
        const parts = member.anniversary.split(".");
        const nextDate = new Date(today.getFullYear(), Number(parts[1]) - 1, Number(parts[0]));
        if (nextDate < today) nextDate.setFullYear(today.getFullYear() + 1);
        const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0 && diffDays <= 8) {
          const n1 = member.name.replace(/Dr\.|Er\.|Shri\./gi, "").trim().toLowerCase();
          const n2 = member.spouseName.replace(/Dr\.|Er\.|Shri\./gi, "").trim().toLowerCase();
          const coupleKey = `${member.anniversary}_${[n1, n2].sort().join("_")}`;

          if (!seenUpcomingAnniversaries.has(coupleKey)) {
            seenUpcomingAnniversaries.add(coupleKey);
            rawData.push({ 
              id: doc.id, 
              type: "Anniversary", 
              name: `${member.name} & ${member.spouseName}`, 
              days_left: diffDays 
            });
          }
        }
      }
    });

    rawData.sort((a, b) => a.days_left - b.days_left);
    setUpcomingCelebrations(rawData);
  };

  const loadAnnouncements = async () => {
    const snapshot = await getDocs(collection(db, "announcements"));
    const today = new Date().toISOString().split("T")[0];
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((item: any) => item.visibleUntil >= today);
    setAnnouncements(data);
  };

  const cardWrapperClass = "relative w-full mb-3.5 transition-all duration-200 active:scale-[0.99]";

  return (
    <main className="min-h-screen bg-[#003B75] flex flex-col antialiased font-sans">
      <header className="py-2.5 px-4 max-w-4xl w-full mx-auto text-white relative flex items-center">
        <div className="absolute left-4">
          <Image src="/logo.png" alt="Lions Logo" width={44} height={44} className="object-contain" />
        </div>
        <div className="flex-1 text-center min-w-0">
          <h1 className="text-xl md:text-2xl font-black text-white uppercase leading-none tracking-tight">Lions Connect</h1>
          <h2 className="text-[10px] md:text-xs font-black text-[#F2A900] leading-none truncate mt-0.5">Lions Club of Sinnar City</h2>
        </div>
      </header>

      <div className="flex-1 bg-[#F8F9FA] rounded-t-none md:rounded-t-[32px] px-4 md:px-12 pt-1.5 pb-6 shadow-inner">
        <div className="max-w-4xl mx-auto space-y-3.5">
          
          {memberVerified && (
            <div className="border-b border-gray-200/50 pb-2.5 space-y-2">
              <div className="min-w-0 px-0.5 pt-1">
                <h3 className="text-xs font-semibold text-[#003B75] truncate leading-none">{memberName}</h3>
                {currentRole && <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 leading-none">{currentRole}</p>}
              </div>
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-1.5">
                  {(isSuperAdmin || currentRole === "President" || currentRole === "Secretary" || currentRole === "Treasurer") && (
                    <button onClick={() => router.push("/admin")} className="bg-gray-100 hover:bg-gray-200 text-[#003B75] px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all">Admin</button>
                  )}
                  <button onClick={() => router.push("/members")} className="bg-gray-100 hover:bg-gray-200 text-[#003B75] px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all">Members</button>
                  <button onClick={() => router.push("/my-profile")} className="bg-gray-100 hover:bg-gray-200 text-[#003B75] px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all">My Profile</button>
                </div>
                <button onClick={async () => { localStorage.removeItem("member"); router.replace("/login"); }} className="bg-[#F2A900]/10 hover:bg-[#F2A900]/20 text-[#d69500] px-2.5 py-1 rounded-md text-[11px] font-black transition-colors">Log Out</button>
              </div>
            </div>
          )}

          <section>
            <h3 className="mb-1.5 text-[10px] font-black tracking-wider text-[#F2A900] uppercase">Today's Highlights</h3>
            {celebrations.length === 0 ? (
              <div className={cardWrapperClass}>
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#F2A900] rounded-l-xl" />
                <div className="ml-2 bg-amber-50/40 border border-amber-100 rounded-xl p-4 text-center shadow-sm">
                  <h4 className="text-sm font-bold text-[#003B75] tracking-tight">✨ Have a wonderful and productive day ahead!</h4>
                </div>
              </div>
            ) : (
              celebrations.map((item, idx) => (
                <div key={idx} className={`${cardWrapperClass} cursor-pointer`} onClick={() => router.push(`/celebration/${item.id}`)}>
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#F2A900] rounded-l-xl" />
                  <div className="ml-2 bg-[#003B75] border border-[#002b54] rounded-xl p-4 text-center shadow-md">
                    <span className="bg-[#F2A900] text-[#003B75] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">🎉 {item.type}</span>
                    <h4 className="text-lg md:text-xl font-bold text-[#F2A900] tracking-tight">{item.name}</h4>
                  </div>
                </div>
              ))
            )}
          </section>

          <section>
            <h3 className="mb-1.5 text-[10px] font-black tracking-wider text-[#F2A900] uppercase">Upcoming Meetings</h3>
            {upcomingMeetings.length === 0 ? (
              <div className={cardWrapperClass}>
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#003B75] rounded-l-xl" />
                <div className="ml-2 bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center">
                  <h4 className="text-xs font-semibold text-gray-400 italic">No upcoming meeting scheduled.</h4>
                </div>
              </div>
            ) : (
              <>
                {upcomingMeetings.map((meeting) => (
                 <div key={meeting.id} className={`${cardWrapperClass} cursor-pointer`} onClick={() => fetchAgenda(meeting.id)}>
    <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#003B75] rounded-l-xl" />
                    <div className="ml-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <h4 className="text-base font-bold text-[#003B75] tracking-tight">
                        {meeting.meetingTitle}
                      </h4>
                      <div className="mt-2 flex flex-col gap-y-0.5 text-[11px] font-bold text-gray-500">
                        <span>Date: <span className="text-gray-700">{meeting.meetingDate}</span></span>
                        <span>Time: <span className="text-gray-700">{meeting.meetingTime}</span></span>
                        <span>Venue: <span className="text-gray-700">{meeting.venue}</span></span>
                      </div>


                      <p className="mt-3 text-sm font-medium leading-relaxed text-gray-700 whitespace-pre-line border-t border-gray-100 pt-2">
                        {meeting.announcement}
                      </p>
                      <div className="mt-2.5 text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                        Created By:
                        <span className="text-gray-700 font-extrabold">
                          {meeting.createdBy}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </section>

          <section>
            <h3 className="mb-1.5 text-[10px] font-black tracking-wider text-[#F2A900] uppercase">Club Updates</h3>
            {announcements.map((item) => (
              <div key={item.id} className={cardWrapperClass}>
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#003B75] rounded-l-xl" />
                <div className="ml-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <span className="bg-[#003B75] text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">📢 {item.type}</span>
                  <h4 className="mt-1.5 text-base font-bold text-[#003B75]">{item.title}</h4>
                  <p className="mt-3 text-sm text-gray-700 whitespace-pre-line border-t border-gray-100 pt-2">{item.message}</p>
                </div>
              </div>
            ))}
          </section>

          <section>
            <h3 className="mb-1.5 text-[10px] font-black tracking-wider text-[#F2A900] uppercase">Coming Up This Week</h3>
            {upcomingCelebrations.slice(0, 3).map((item, idx) => (
              <div key={idx} className={cardWrapperClass}>
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-slate-400 rounded-l-xl" />
                <div className="ml-2 bg-white border border-gray-200 rounded-xl p-3.5 text-center shadow-sm">
                  <span className="rounded bg-slate-100 text-slate-700 px-1.5 py-0.5 text-[8px] font-bold uppercase">{item.type === "Birthday" ? "🎂 Birthday" : "💑 Anniversary"}</span>
                  <h4 className="mt-1 text-sm font-semibold text-gray-600">{item.name}</h4>
                </div>
              </div>
            ))}
          </section>
        </div>
      {selectedAgenda && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedAgenda(null)}>
    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
      <h3 className="text-xl font-black text-[#003B75] mb-4">मीटिंगचे विषय</h3>
      
      <div className="space-y-3">
        {selectedAgenda.items?.map((item: any, i: number) => (
          <div key={i} className="flex gap-2">
            <span className="font-bold text-[#003B75]">{item.serial}.</span>
            <p className="text-gray-700">{item.title}</p>
          </div>
        ))}
      </div>

      <button 
        className="mt-6 w-full bg-[#003B75] text-white py-2 rounded-lg font-bold" 
        onClick={() => setSelectedAgenda(null)}
      >
        बंद करा
      </button>
    </div>
  </div>
)}
      </div>
      <footer className="bg-[#003B75] py-2.5 text-center border-t border-white/10">
        <p className="text-white/40 text-[8px] font-bold tracking-[0.4em] uppercase">App Developed By: Jitendra Jagtap</p>
      </footer>
    </main>
  );
}