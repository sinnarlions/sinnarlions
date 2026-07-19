"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Image साठी import आवश्यक

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const memberData = localStorage.getItem("member");
    if (!memberData) {
      router.replace("/login");
      return;
    }
    const saved = JSON.parse(memberData);
    if (saved.isSuperAdmin || saved.currentLionsRole === "Treasurer") {
      setAuthorized(true);
    } else {
      router.replace("/admin");
    }
    setLoading(false);
  }, [router]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-[#F8F9FA] flex flex-col">
      {/* हेडर */}
      <header className="bg-[#003B75] py-2.5 px-4 w-full text-white flex items-center">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Lions Logo" width={40} height={40} />
          <div>
            <h1 className="text-lg font-black uppercase text-center leading-none">Lions Connect</h1>
            <p className="text-[10px] text-[#F2A900] font-bold">Finance Department</p>
          </div>
        </div>
      </header>

      {/* पेज कंटेंट */}
      <div className="flex-1 p-4">
        {children}
      </div>

      {/* फुटर */}
      <footer className="bg-[#003B75] py-2 text-center">
        <p className="text-white/40 text-[8px] font-bold tracking-[0.4em] uppercase">
          App Developed By: Jitendra Jagtap
        </p>
      </footer>
    </main>
  );
}