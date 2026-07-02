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

  const cardWrapperClass = "relative w-full mb-5 transition-all duration-200 active:scale-[0.99]";

  return (
    <main className="min-h-screen bg-[#003B75] flex flex-col antialiased font-sans">
      
      {/* Header */}
      <header className="py-4 px-4 max-w-4xl w-full mx-auto text-white relative flex items-center">
        <div className="absolute left-4">
          <Image
            src="/logo.png"
            alt="Lions Logo"
            width={55}
            height={55}
            className="object-contain drop-shadow-md"
          />
        </div>
        
        <div className="flex-1 text-center min-w-0 py-1">
          <h1 className="text-xl md:text-3xl font-black tracking-tight text-white uppercase leading-none mb-1">
            Lions Connect
          </h1>
          <h2 className="text-xs md:text-base font-bold text-[#F2A900] leading-none truncate">
            Lions Club of Sinnar City
          </h2>
          <p className="text-[8px] md:text-[10px] tracking-[0.25em] font-bold text-white/40 uppercase mt-1 leading-none">
            CELEBRATE • CONNECT • SERVE
          </p>
        </div>
      </header>

      {/* Main Dashboard Container */}
      <div className="flex-1 bg-[#F8F9FA] rounded-t-none md:rounded-t-[32px] px-4 md:px-12 pt-4 pb-12 shadow-inner">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* UPDATED UTILITY BAR: मोबाईलसाठी २x२ ग्रिड आणि परफेक्ट प्रोफाइल कार्ड लेआउट */}
          {memberVerified && (
            <div className="border-b border-gray-200/60 pb-4 space-y-4">
              
              {/* १. प्रोफाईल माहिती सेक्शन (स्वच्छ आणि नीटनेटका डावीकडे अलाईन केलेला) */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Logged in as</p>
                  <h3 className="text-base font-extrabold text-[#003B75] truncate">
                    {memberName}
                  </h3>
                </div>
                {currentRole && (
                  <div className="self-start sm:self-center">
                    <span className="text-[11px] font-black text-white bg-[#003B75] px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider inline-flex items-center gap-1">
                      🏅 {currentRole}
                    </span>
                  </div>
                )}
              </div>

              {/* २. नेव्हिगेशन आणि लॉग आऊट बटन्स ग्रिड (मोबाईलवर २x२ आणि मोठ्या स्क्रीनवर एका ओळीत) */}
              <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2.5">
                <div className="grid grid-cols-2 sm:flex items-center gap-2 col-span-2 sm:col-span-1">
                  {(isSuperAdmin || currentRole === "President" || currentRole === "Secretary" || currentRole === "Treasurer") ? (
                    <>
                      <button
                        onClick={() => router.push("/admin")}
                        className="bg-[#003B75]/10 hover:bg-[#003B75]/20 border border-[#003B75]/10 py-2.5 sm:py-1.5 sm:px-4 rounded-xl text-xs font-bold text-[#003B75] text-center transition-all shadow-sm sm:shadow-none"
                      >
                        Admin
                      </button>
                      <button
                        onClick={() => router.push("/members")}
                        className="bg-[#003B75]/10 hover:bg-[#003B75]/20 border border-[#003B75]/10 py-2.5 sm:py-1.5 sm:px-4 rounded-xl text-xs font-bold text-[#003B75] text-center transition-all shadow-sm sm:shadow-none"
                      >
                        Members
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => router.push("/members")}
                      className="col-span-2 bg-[#003B75]/10 hover:bg-[#003B75]/20 border border-[#003B75]/10 py-2.5 sm:py-1.5 sm:px-4 rounded-xl text-xs font-bold text-[#003B75] text-center transition-all shadow-sm sm:shadow-none"
                    >
                      Members
                    </button>
                  )}
                  
                  <button
                    onClick={() => router.push("/my-profile")}
                    className="bg-[#003B75]/10 hover:bg-[#003B75]/20 border border-[#003B75]/10 py-2.5 sm:py-1.5 sm:px-4 rounded-xl text-xs font-bold text-[#003B75] text-center transition-all shadow-sm sm:shadow-none"
                  >
                    My Profile
                  </button>

                  <button 
                    onClick={async () => { 
                      const memberStorage = localStorage.getItem("member");
                      if (memberStorage) {
                        try {
                          const savedData = JSON.parse(memberStorage);
                          if (savedData.id) {
                            const memberRef = doc(db, "members", savedData.id);
                            await updateDoc(memberRef, {
                              isLoggedIn: false,
                              sessionId: "",
                            });
                          }
                        } catch (error) {
                          console.error("Logout state update error:", error);
                        }
                      }
                      localStorage.removeItem("member"); 
                      router.replace("/login"); 
                    }}
                    className="sm:hidden bg-[#F2A900] hover:bg-[#d69500] py-2.5 rounded-xl text-xs font-black text-[#003B75] text-center shadow-md transition-colors"
                  >
                    Log Out
                  </button>
                </div>
                
                {/* मोठी स्क्रीन असताना दिसणारे लॉग आऊट बटण */}
                <button 
                  onClick={async () => { 
                    const memberStorage = localStorage.getItem("member");
                    if (memberStorage) {
                      try {
                        const savedData = JSON.parse(memberStorage);
                        if (savedData.id) {
                          const memberRef = doc(db, "members", savedData.id);
                          await updateDoc(memberRef, {
                            isLoggedIn: false,
                            sessionId: "",
                          });
                        }
                      } catch (error) {
                        console.error("Logout state update error:", error);
                      }
                    }
                    localStorage.removeItem("member"); 
                    router.replace("/login"); 
                  }}
                  className="hidden sm:block bg-[#F2A900] hover:bg-[#d69500] px-4 py-1.5 rounded-xl text-xs font-black text-[#003B75] shadow-sm transition-colors"
                >
                  Log Out
                </button>
              </div>

            </div>
          )}

          {/* SECTION 1: TODAY'S HIGHLIGHTS */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
              Today's Highlights
            </h3>
            {celebrations.length === 0 ? (
              <div className={cardWrapperClass}>
                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#F2A900] rounded-l-xl" />
                <div className="ml-3 bg-amber-50/60 border border-amber-200/70 rounded-xl p-6 text-center shadow-sm">
                  <h4 className="text-base md:text-lg font-bold text-[#003B75] tracking-tight">
                    ✨ Have a wonderful and productive day ahead!
                  </h4>
                  <p className="text-xs font-medium text-gray-400 mt-1">
                    No club celebrations scheduled for today
                  </p>
                </div>
              </div>
            ) : (
              celebrations.map((item, idx) => (
                <div key={idx} className={`${cardWrapperClass} cursor-pointer`} onClick={() => router.push(`/celebration/${item.id}`)}>
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#F2A900] rounded-l-xl" />
                  <div className="ml-3 bg-[#003B75] border border-[#002b54] rounded-xl p-6 text-center shadow-md">
                    <div className="flex justify-center mb-2">
                      <span className="bg-[#F2A900] text-[#003B75] px-3 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                        🎉 {item.type}
                      </span>
                    </div>
                    <h4 className="text-2xl md:text-3xl font-bold text-[#F2A900] tracking-tight drop-shadow-sm">
                      {item.name}
                    </h4>
                    <p className="text-xs font-bold text-white/80 mt-3 flex items-center justify-center gap-1 animate-pulse">
                      Click to wish <span>✨</span>
                    </p>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* SECTION 2: CLUB UPDATES */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
              Club Updates
            </h3>
            {announcements.length === 0 ? (
              <div className={cardWrapperClass}>
                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#003B75] rounded-l-xl" />
                <div className="ml-3 bg-blue-50/50 rounded-xl p-6 border border-blue-100 shadow-sm">
                  <h4 className="text-base font-semibold text-blue-500/80 italic">No updates available</h4>
                </div>
              </div>
            ) : (
              announcements.map((item) => (
                <div key={item.id} className={cardWrapperClass}>
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#003B75] rounded-l-xl" />
                  <div className="ml-3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div>
                      <span className="bg-[#003B75] text-white px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                        📢 {item.type}
                      </span>
                      <h4 className="mt-3 text-xl font-bold text-[#003B75] tracking-tight leading-snug">
                        {item.title}
                      </h4>
                      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-gray-500">
                        {item.eventDate && (
                          <span>
                            📅 {new Date(item.eventDate).toLocaleDateString("en-GB", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                          </span>
                        )}
                        {item.eventTime && <span>🕒 {item.eventTime}</span>}
                      </div>
                      {item.venue && <p className="mt-1 text-xs font-bold text-gray-500">📍 {item.venue}</p>}
                    </div>

                    <p className="mt-4 text-sm font-medium leading-relaxed text-gray-600 whitespace-pre-line border-t border-gray-100 pt-3">
                      {item.message}
                    </p>

                    <div className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Published By: <span className="text-gray-700 font-extrabold">{item.author}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* SECTION 3: COMING UP THIS WEEK */}
          <section>
            <h3 className="mb-3 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
              Coming Up This Week
            </h3>
            {upcomingCelebrations.length === 0 ? (
              <div className={cardWrapperClass}>
                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-slate-400 rounded-l-xl" />
                <div className="ml-3 bg-slate-50 rounded-xl p-6 text-center border border-slate-200 shadow-sm">
                  <h4 className="text-base font-semibold text-slate-500 italic">Nothing scheduled</h4>
                </div>
              </div>
            ) : (
              upcomingCelebrations.slice(0, 3).map((item, idx) => (
                <div key={idx} className={cardWrapperClass}>
                  <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-slate-400 rounded-l-xl" />
                  <div className="ml-3 bg-white border border-gray-200 rounded-xl p-5 text-center shadow-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        {item.type === "Birthday" ? "🎂 Birthday" : "💑 Anniversary"}
                      </span>
                      <span className="text-xs font-black text-[#003B75] bg-[#003B75]/5 px-2.5 py-0.5 rounded-md">
                        In {item.days_left} Days
                      </span>
                    </div>
                    <h4 className="mt-2 text-lg font-bold text-[#003B75] tracking-tight">
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
      <footer className="bg-[#003B75] py-4 text-center border-t border-white/10">
        <p className="text-white/40 text-[9px] font-bold tracking-[0.4em] uppercase">
          App Developed By: Jitendra Jagtap
        </p>
      </footer>
    </main>
  );
}