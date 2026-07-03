"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/src/firebase/config";
import { isSuperAdmin as checkSuperAdmin, canAccessAdmin } from "@/src/utils/permissions";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function SecurityPage() {
  const router = useRouter();
  
  const [authorized, setAuthorized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const memberData = localStorage.getItem("member");
    if (!memberData) {
      router.replace("/login");
      return;
    }

    const user = JSON.parse(memberData);
    const isAllowed = canAccessAdmin(user) && checkSuperAdmin(user);

    if (!isAllowed) {
      alert("Access Denied: Super Admin Only 🛡️");
      router.replace("/");
      return;
    }

    setAuthorized(true);
    fetchMembers();
  }, [router]);

  // Firestore मधून मेंबर्सचा डेटा आणणे
  const fetchMembers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "members"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // नावाप्रमाणे सॉर्टिंग
      data.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
      setMembers(data);
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  // १. FORCE LOGOUT (Session Clear करणे)
  const handleForceLogout = async (memberId: string) => {
    const ok = confirm("Are you sure you want to force logout this member?");
    if (!ok) return;

    setLoadingId(memberId);
    try {
      await updateDoc(doc(db, "members", memberId), {
        isLoggedIn: false,
        sessionId: "", // सेशन आयडी रिकामा करणे
      });
      alert("Member logged out successfully! 🔴");
      fetchMembers();
    } catch (error) {
      alert("Something went wrong!");
    } finally {
      setLoadingId(null);
    }
  };

  // २. PASSWORD RESET (Pin Reset + WhatsApp Share)
  const handleResetPassword = async (member: any) => {
    // ४ अंकी सोपा नवीन तात्पुरता पिन बनवणे
    const defaultPin = "1234"; 
    const ok = confirm(`Reset password for ${member.name} to default '${defaultPin}'?`);
    if (!ok) return;

    setLoadingId(member.id);
    try {
      await updateDoc(doc(db, "members", member.id), {
        loginPin: defaultPin,
        isPinChanged: false, // जेणेकरून तो पुढच्या लॉगिनला पासवर्ड बदलेल
      });

      alert("Password reset in database! ✅ Opening WhatsApp to share...");

      // WhatsApp मेसेज तयार करणे आणि लिंक ओपन करणे
      const message = `LIONS CLUB OF SINNAR CITY\n\nHello Lion ${member.name},\nYour Login PIN has been reset by the Admin.\n\n📱 Member Code: ${member.memberCode}\n🔑 Temporary PIN: ${defaultPin}\n\nPlease login and change your PIN immediately.`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/91${member.mobile}?text=${encodedMessage}`;
      
      window.open(whatsappUrl, "_blank");
      fetchMembers();
    } catch (error) {
      alert("Failed to reset password.");
    } finally {
      setLoadingId(null);
    }
  };

  // सर्च बारनुसार मेंबर्स फिल्टर करणे
  const filteredMembers = members.filter((m: any) => {
    const name = (m.name || "").toLowerCase();
    const code = (m.memberCode || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || code.includes(query);
  });

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-[#F8F9FA] p-4 sm:p-6 md:p-8 font-sans antialiased">
      <div className="mx-auto max-w-2xl space-y-4">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h1 className="text-xl font-black text-[#003B75] tracking-tight flex items-center gap-2">
              🔐 Login & Security
            </h1>
            <p className="text-[10px] font-bold text-[#F2A900] uppercase tracking-wider">
              Super Admin Control Panel
            </p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#003B75] shadow-xs hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
          >
            ← Back
          </button>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search member by name or code (e.g. LC001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 p-3 text-sm font-medium focus:outline-none focus:border-[#003B75] bg-white shadow-xs transition-colors"
          />
        </div>

        {/* --- MEMBERS LIST --- */}
        <div className="space-y-2">
          {filteredMembers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center">
              <p className="text-xs font-medium text-gray-400 italic">No members found.</p>
            </div>
          ) : (
            filteredMembers.map((member: any) => (
              <div
                key={member.id}
                className="rounded-xl border border-gray-100 bg-white p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* डावी बाजू: मेंबरची माहिती */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-[#003B75] truncate">
                      {member.name || "No Name"}
                    </h3>
                    <span className="bg-gray-100 text-gray-600 font-mono text-[9px] font-black px-1.5 py-0.5 rounded border border-gray-200 shrink-0">
                      {member.memberCode}
                    </span>
                  </div>
                  <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                     Status:{" "}
                     <span className={member.isLoggedIn ? "text-green-600 font-black" : "text-gray-400 font-medium"}>
                      {member.isLoggedIn ? "🟢 Online" : "Offline"}
                         </span>
                            </p>
                         </div>

                         {/* उजवी बाजू: ॲक्शन्स बटन्स (Sleek Buttons) */}
                      <div className="flex items-center gap-2 sm:justify-end shrink-0">
                        {/* Force Logout */}
                        <button
                          disabled={loadingId === member.id}
                          onClick={() => handleForceLogout(member.id)}
                          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-rose-100 text-rose-600 text-xs font-bold transition-all shadow-xs hover:bg-rose-50 cursor-pointer ${
                            !member.isLoggedIn && "opacity-40 cursor-not-allowed hover:bg-transparent"
                          }`}
                        >
                          🛑 Logout
                        </button>

                  {/* Reset Password */}
                  <button
                    disabled={loadingId === member.id}
                    onClick={() => handleResetPassword(member)}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold transition-all shadow-xs hover:bg-gray-100 hover:border-gray-300 cursor-pointer"
                  >
                    🔑 Reset PIN
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}