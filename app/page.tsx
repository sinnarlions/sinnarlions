"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { db } from "../src/firebase/config";
import AuthGuard from "@/src/components/AuthGuard";
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
  const [currentRole, setCurrentRole] = useState("");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [celebrations, setCelebrations] = useState<any[]>([]);
  const [upcomingCelebrations, setUpcomingCelebrations] = useState<any[]>([]);
  const [upcomingMeeting, setUpcomingMeeting] = useState<any>(null);

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

  // --- रिअल-टाइम सेशन व्हॅलिडेशन (onSnapshot) ---
let unsubscribeSession = () => {};

// 👑 Super Admin साठी Session Validation Skip
if (saved && saved.id && saved.sessionId && !saved.isSuperAdmin) {
  const memberDocRef = doc(db, "members", saved.id);

  unsubscribeSession = onSnapshot(
    memberDocRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const liveMemberData = snapshot.data();

        if (saved.sessionId !== liveMemberData.sessionId) {
          alert("Your account has been logged in from another device.");
          localStorage.clear();
          router.replace("/login");
        }
      }
    },
    (error) => {
      console.error("Session listener error:", error);
    }
  );
}

    cleanupExpiredAnnouncements();
    loadCelebrations();
    loadUpcomingCelebrations();
    loadUpcomingMeeting();
    loadAnnouncements();

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
const loadUpcomingMeeting = async () => {
  const snapshot = await getDocs(collection(db, "meetings"));

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
    })
    .sort((a: any, b: any) =>
      new Date(a.meetingDate).getTime() -
      new Date(b.meetingDate).getTime()
    );

  if (meetings.length > 0) {
    setUpcomingMeeting(meetings[0]);
  }
};
  return (
    <main className="min-h-screen bg-[#003B75] flex flex-col antialiased font-sans">
      
      {/* हेडर */}
      <header className="py-2.5 px-4 max-w-4xl w-full mx-auto text-white relative flex items-center">
        <div className="absolute left-4">
          <Image
            src="/logo.png"
            alt="Lions Logo"
            width={44}
            height={44}
            className="object-contain"
          />
        </div>
        
        <div className="flex-1 text-center min-w-0">
          <h1 className="text-xl md:text-2xl font-black text-white uppercase leading-none tracking-tight">
            Lions Connect
          </h1>
          <h2 className="text-[10px] md:text-xs font-black text-[#F2A900] leading-none truncate mt-0.5">
            Lions Club of Sinnar City
          </h2>
          <p className="text-[7px] md:text-[8px] tracking-[0.25em] font-bold text-white/40 uppercase mt-1 leading-none">
            CONNECT • SERVE • CELEBRATE
          </p>
        </div>
      </header>

      {/* मुख्य डॅशबोर्ड कंटेनर */}
      <div className="flex-1 bg-[#F8F9FA] rounded-t-none md:rounded-t-[32px] px-4 md:px-12 pt-1.5 pb-6 shadow-inner">
        <div className="max-w-4xl mx-auto space-y-3.5">
          
          {/* युटिलिटी बार */}
          {memberVerified && (
            <div className="border-b border-gray-200/50 pb-2.5 space-y-2">
              
              <div className="min-w-0 px-0.5 pt-1">
                <h3 className="text-xs font-semibold text-[#003B75] truncate leading-none">
                  {memberName}
                </h3>
                {currentRole && (
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5 leading-none">
                    {currentRole}
                  </p>
                )}
              </div>

              {/* Compact Buttons Row */}
<div className="flex flex-wrap gap-2 pt-1">
  
  {(isSuperAdmin || currentRole === "President" || currentRole === "Secretary" || currentRole === "Treasurer") && (
    <button
      onClick={() => router.push("/admin")}
      className="bg-gray-100 hover:bg-gray-200 text-[#003B75] px-2 py-1 rounded-md text-[10px] font-extrabold transition-all"
    >
      Admin
    </button>
  )}
  
  <button onClick={() => router.push("/members")} className="bg-gray-100 hover:bg-gray-200 text-[#003B75] px-2 py-1 rounded-md text-[10px] font-extrabold transition-all">Members</button>
  <button onClick={() => router.push("/club")} className="bg-gray-100 hover:bg-gray-200 text-[#003B75] px-2 py-1 rounded-md text-[10px] font-extrabold transition-all">Club</button>
  <button onClick={() => router.push("/my-profile")} className="bg-gray-100 hover:bg-gray-200 text-[#003B75] px-2 py-1 rounded-md text-[10px] font-extrabold transition-all">My Profile</button>
  
  <button 
    onClick={async () => { /* ... तुमचा लॉग आऊट लॉजिक ... */ }}
    className="bg-[#F2A900]/10 hover:bg-[#F2A900]/20 text-[#d69500] px-2 py-1 rounded-md text-[10px] font-black transition-colors"
  >
    Logout
  </button>
</div>

            </div>
          )}

          {/* SECTION 1: TODAY'S HIGHLIGHTS */}
          <section>
            <h3 className="mb-1.5 text-[10px] font-black tracking-wider text-[#F2A900] uppercase">
              Today's Highlights
            </h3>
            {celebrations.length === 0 ? (
              <div className={cardWrapperClass}>
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#F2A900] rounded-l-xl" />
                <div className="ml-2 bg-amber-50/40 border border-amber-100 rounded-xl p-4 text-center shadow-sm">
                  <h4 className="text-sm font-bold text-[#003B75] tracking-tight">
                    ✨ Have a wonderful and productive day ahead!
                  </h4>
                  <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                    No club celebrations scheduled for today
                  </p>
                </div>
              </div>
            ) : (
              celebrations.map((item, idx) => (
                <div key={idx} className={`${cardWrapperClass} cursor-pointer`} onClick={() => router.push(`/celebration/${item.id}`)}>
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#F2A900] rounded-l-xl" />
                  <div className="ml-2 bg-[#003B75] border border-[#002b54] rounded-xl p-4 text-center shadow-md">
                    <div className="flex justify-center mb-1">
                      <span className="bg-[#F2A900] text-[#003B75] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                        🎉 {item.type}
                      </span>
                    </div>
                    <h4 className="text-lg md:text-xl font-bold text-[#F2A900] tracking-tight drop-shadow-sm">
                      {item.name}
                    </h4>
                    <p className="text-[10px] font-bold text-white/80 mt-1.5 flex items-center justify-center gap-1 animate-pulse">
                      Click to wish <span>✨</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </section>

{/* UPCOMING MEETING */}<section>
  {!upcomingMeeting ? (
    <div className="bg-[#EEF6FF] rounded-2xl p-6 min-h-[110px] flex flex-col justify-center shadow-sm">
      <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500 mb-2">
        Upcoming Meeting
      </h3>

      <h4 className="text-xl font-bold text-gray-400">
        No Upcoming Meeting
      </h4>
    </div>
  ) : (
    <div
      onClick={() => router.push(`/meeting/${upcomingMeeting.id}`)}
      className="bg-[#EEF6FF] rounded-2xl p-6 min-h-[125px] cursor-pointer shadow border border-gray-200 hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-start">

        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">
            Upcoming Meeting
          </h3>

          <h4 className="text-1.5xl font-bold text-[#003B75] mt-2">
            {upcomingMeeting.meetingTitle}
          </h4>

          <div className="flex flex-wrap gap-5 text-sm text-gray-600 font-medium mt-4">
            <span>
              📅{" "}
              {new Date(upcomingMeeting.meetingDate).toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}
            </span>

            <span>
              🕒{" "}
              {new Date(
                `2000-01-01T${upcomingMeeting.meetingTime}`
              ).toLocaleTimeString("en-IN", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </span>

            <span>📍 {upcomingMeeting.venue}</span>
          </div>
        </div>

        <div className="text-3xl text-[#003B75] font-light">
          →
        </div>

      </div>
    </div>
  )}
</section>

          {/* SECTION 2: CLUB UPDATES */}
          <section>
            <h3 className="mb-1.5 text-[10px] font-black tracking-wider text-[#F2A900] uppercase">
              Club Updates
            </h3>
            {announcements.length === 0 ? (
              <div className={cardWrapperClass}>
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#003B75] rounded-l-xl" />
                <div className="ml-2 bg-blue-50/40 rounded-xl p-4 border border-blue-100 shadow-sm">
                  <h4 className="text-xs font-semibold text-blue-500/80 italic">No updates available</h4>
                </div>
              </div>
            ) : (
              announcements.map((item) => (
                <div key={item.id} className={cardWrapperClass}>
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#003B75] rounded-l-xl" />
                  <div className="ml-2 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div>
                      <span className="bg-[#003B75] text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                        📢 {item.type}
                      </span>
                      <h4 className="mt-1.5 text-base font-bold text-[#003B75] tracking-tight leading-snug">
                        {item.title}
                      </h4>
                      
                      {/* इंग्रजी शब्द (Date, Time, Venue) */}
                      <div className="mt-2 flex flex-col gap-y-0.5 text-[11px] font-bold text-gray-500">
                        {item.eventDate && (
                          <span>
                            Date: <span className="text-gray-700">{new Date(item.eventDate).toLocaleDateString("en-GB", {
                              day: "numeric", month: "long", year: "numeric",
                            })}</span>
                          </span>
                        )}
                        {item.eventTime && <span>Time: <span className="text-gray-700">{item.eventTime}</span></span>}
                        {item.venue && <p>Venue: <span className="text-gray-700">{item.venue}</span></p>}
                      </div>
                    </div>

                    {/* मुख्य मजकुराचा फॉन्ट (text-sm आणि text-gray-700) */}
                    <p className="mt-3 text-sm font-medium leading-relaxed text-gray-700 whitespace-pre-line border-t border-gray-100 pt-2">
                      {item.message}
                    </p>

                    <div className="mt-2.5 text-[8px] text-gray-400 font-bold uppercase tracking-wider">
                      Published By: <span className="text-gray-700 font-extrabold">{item.author}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* SECTION 3: COMING UP THIS WEEK */}
          <section>
            <h3 className="mb-1.5 text-[10px] font-black tracking-wider text-[#F2A900] uppercase">
              Coming Up This Week
            </h3>
            {upcomingCelebrations.length === 0 ? (
              <div className={cardWrapperClass}>
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-slate-400 rounded-l-xl" />
                <div className="ml-2 bg-slate-50 rounded-xl p-4 text-center border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-semibold text-slate-500 italic">Nothing scheduled</h4>
                </div>
              </div>
            ) : (
              upcomingCelebrations.slice(0, 3).map((item, idx) => (
                <div key={idx} className={cardWrapperClass}>
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-slate-400 rounded-l-xl" />
                  <div className="ml-2 bg-white border border-gray-200 rounded-xl p-3.5 text-center shadow-sm">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="rounded bg-slate-100 text-slate-700 border border-slate-200 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider">
                        {item.type === "Birthday" ? "🎂 Birthday" : "💑 Anniversary"}
                      </span>
                      <span className="text-[9px] font-black text-[#003B75] bg-[#003B75]/5 px-1.5 py-0.5 rounded">
                        In {item.days_left} Days
                      </span>
                    </div>
                    {/* मुख्य मजकूर थोडा फिकट (text-gray-600) केला */}
                    <h4 className="mt-0.5 text-sm font-semibold text-gray-600 tracking-tight">
                      {item.name}
                    </h4>
                  </div>
                </div>
              ))
            )}
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#003B75] py-2.5 text-center border-t border-white/10">
        <p className="text-white/40 text-[8px] font-bold tracking-[0.4em] uppercase">
          App Developed By: Jitendra Jagtap
        </p>
      </footer>
    </main>
  );
}