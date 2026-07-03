"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/src/firebase/config";

import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();   
  const [mobile, setMobile] = useState("");
  const [pin, setPin] = useState("");
  
  // पिन पाहण्यासाठी आणि लपवण्यासाठीची स्टेट
  const [showPin, setShowPin] = useState(false);

  // Wrong PIN टाकल्यावर 'Forgot PIN?' लिंक दाखवण्यासाठीची स्टेट
  const [showForgotLink, setShowForgotLink] = useState(false);

  // Forgot PIN चे पॉपअप हँडल करण्यासाठीचे States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotMobile, setForgotMobile] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Forgot PIN हँडलर लॉजिक
  const handleForgotPin = async () => {
    if (!forgotMobile.trim()) {
      alert("Please enter your registered mobile number.");
      return;
    }

    setIsSending(true);
    try {
      const q = query(collection(db, "members"), where("mobile", "==", forgotMobile.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("This mobile number is not registered with us.");
        setIsSending(false);
        return;
      }

      const memberDoc = snapshot.docs[0];
      const member = memberDoc.data();

      if (!member.email) {
        // ईमेल नसेल तर व्हॉट्सॲप बॅकअप पर्याय
        alert(`Hi ${member.name}, your email is not updated in records. Opening WhatsApp to request Super Admin to reset your PIN.`);
        const msg = `Hello Admin, I forgot my login PIN. Please reset it.\nName: ${member.name}\nCode: ${member.memberCode}`;
        window.open(`https://wa.me/91${forgotMobile}?text=${encodeURIComponent(msg)}`, "_blank");
      } else {
        // ईमेल असल्यास ईमेल आयडी मास्क करून अलर्ट दाखवणे
        alert(`Reset link has been requested for ${member.name}.\nA reset email will be sent to: ${member.email.replace(/(.{2})(.*)(@.*)/, "$1***$3")} 📩\n(Note: Integrate EmailJS/API here to trigger email)`);
      }

      setShowForgotModal(false);
      setForgotMobile("");
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6E4025] via-[#825232] to-[#A56A43] flex items-center justify-center px-4 py-8 relative">

      <div className="w-full max-w-md rounded-3xl border border-[#E7D5C8] bg-white p-6 sm:p-8 shadow-2xl">

        <h1 className="text-3xl font-bold text-center text-[#622A1E]">
          Member Login
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Lions Club of Sinnar City
        </p>

        {/* --- MOBILE INPUT --- */}
        <input
          type="text"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="mt-8 w-full rounded-xl border-2 border-gray-300 bg-white p-4 text-base text-black placeholder:text-gray-500 outline-none transition focus:border-[#825232] focus:ring-2 focus:ring-[#825232]/20"
        />

        {/* --- PIN INPUT WITH SHOW/HIDE TOGGLE --- */}
        <div className="relative mt-4">
          <input
            type={showPin ? "text" : "password"}
            placeholder="4 Digit PIN"
            value={pin}
            maxLength={4}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} // फक्त नंबर्स स्वीकारणार
            className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 pr-12 text-base text-black placeholder:text-gray-500 outline-none transition focus:border-[#825232] focus:ring-2 focus:ring-[#825232]/20"
          />
          
          {/* कोपऱ्यातील 👁️ बटन */}
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#825232] transition-colors text-xl cursor-pointer"
          >
            {showPin ? "👁️" : "🙈"}
          </button>
        </div>

        {/* --- FORGOT PIN LINK (फक्त चुकीचा पासवर्ड टाकल्यावरच प्रकट होईल) --- */}
        {showForgotLink && (
          <div className="text-right mt-2.5 animate-in fade-in duration-200">
            <button
              onClick={() => setShowForgotModal(true)}
              className="text-xs font-bold text-[#825232] hover:underline cursor-pointer"
            >
              Forgot PIN?
            </button>
          </div>
        )}

        {/* --- LOGIN BUTTON --- */}
        <button
          onClick={async () => {
            if (!mobile.trim()) {
              alert("Enter mobile number");
              return;
            }

            if (!pin.trim()) {
              alert("Enter PIN");
              return;
            }

            const q = query(
              collection(db, "members"),
              where("mobile", "==", mobile)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
              alert("Mobile number not found");
              return;
            }

            const memberDoc = snapshot.docs[0];
            const member = memberDoc.data();

            if (!member.isActive) {
              alert("Your account is inactive.");
              return;
            }

            // पासवर्ड चुकीचा असल्यास 'Forgot PIN?' ची लिंक दाखवणे
            if (String(member.loginPin) !== pin) {
              alert("Invalid PIN");
              setShowForgotLink(true); 
              return;
            }

            // सिंगल डिव्हाइस लॉगिन चेक
            if (member.isLoggedIn === true) {
              if (member.isSuperAdmin === true) {
                const proceed = confirm(
                  "Your account is already logged in on another device. Continue and log out the previous device?"
                );
                if (!proceed) return;
              } else {
                alert("This account is already logged in on another device.");
                return;
              }
            }

            const sessionId = crypto.randomUUID();
            const memberRef = doc(db, "members", memberDoc.id);
            await updateDoc(memberRef, {
              isLoggedIn: true,
              sessionId: sessionId,
              lastLogin: serverTimestamp(),
            });

            localStorage.setItem(
              "member",
              JSON.stringify({
                id: memberDoc.id,
                memberCode: member.memberCode,
                name: member.name,
                mobile: member.mobile,
                currentLionsRole: member.currentLionsRole || "Member",
                isSuperAdmin: member.isSuperAdmin || false,
                isPinChanged: member.isPinChanged,
                sessionId: sessionId, 
              })
            );
            localStorage.setItem("memberName", member.name);
            localStorage.setItem("memberMobile", member.mobile);
            
            // जर पिन बदलला नसेल, तर सक्तीने पिन बदलण्याच्या पेजवर पाठवा
            if (member.isPinChanged === false) {
              router.replace("/change-pin");
            } else {
              router.replace("/");
            }
          }}
          className="mt-5 w-full rounded-xl bg-[#825232] py-4 text-lg font-semibold text-white transition hover:bg-[#6E4025] active:scale-[0.98] cursor-pointer"
        >
          Login
        </button>

      </div>

      {/* ================= FORGOT PIN MODAL (POPUP) ================= */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-base font-black text-[#622A1E]">🔍 Reset Your PIN</h3>
              <p className="text-xs text-gray-500 mt-0.5">Enter your registered mobile number to request a reset link.</p>
            </div>
            
            <input
              type="text"
              placeholder="Enter Mobile Number"
              value={forgotMobile}
              onChange={(e) => setForgotMobile(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-[#825232]"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                disabled={isSending}
                onClick={handleForgotPin}
                className="flex-1 py-2 rounded-xl bg-[#825232] text-white text-xs font-bold shadow-xs hover:bg-[#6E4025] disabled:opacity-50"
              >
                {isSending ? "Checking..." : "Request Reset"}
              </button>
              <button
                onClick={() => { setShowForgotModal(false); setForgotMobile(""); }}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}