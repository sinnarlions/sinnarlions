"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function ChangePinPage() {
  const router = useRouter();

  // इनपुट स्टेट्स
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // शो/हाईड पिनसाठी स्वतंत्र States
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6E4025] via-[#825232] to-[#A56A43] flex items-center justify-center px-4 py-8">
      
      <div className="w-full max-w-md rounded-3xl border border-[#E7D5C8] bg-[#FDF2E9] p-6 sm:p-8 shadow-2xl">
        
        <h1 className="text-3xl font-bold text-center text-[#622A1E]">
          Change PIN
        </h1>

        <p className="text-center text-gray-500 mt-2 text-sm">
          Please change your default PIN to secure your account
        </p>

        {/* --- CURRENT PIN INPUT --- */}
        <div className="relative mt-8">
          <input
            type={showOldPin ? "text" : "password"}
            placeholder="Current PIN"
            value={oldPin}
            maxLength={4}
            onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ""))} // फक्त नंबर्स
            className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 pr-12 text-base text-black placeholder:text-gray-400 outline-none transition focus:border-[#825232] focus:ring-2 focus:ring-[#825232]/20 shadow-xs"
          />
          <button
            type="button"
            onClick={() => setShowOldPin(!showOldPin)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#825232] text-xl cursor-pointer"
          >
            {showOldPin ? "👁️" : "🙈"}
          </button>
        </div>

        {/* --- NEW PIN INPUT --- */}
        <div className="relative mt-4">
          <input
            type={showNewPin ? "text" : "password"}
            placeholder="New 4 Digit PIN"
            value={newPin}
            maxLength={4}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ""))} // फक्त नंबर्स
            className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 pr-12 text-base text-black placeholder:text-gray-400 outline-none transition focus:border-[#825232] focus:ring-2 focus:ring-[#825232]/20 shadow-xs"
          />
          <button
            type="button"
            onClick={() => setShowNewPin(!showNewPin)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#825232] text-xl cursor-pointer"
          >
            {showNewPin ? "👁️" : "🙈"}
          </button>
        </div>

        {/* --- CONFIRM NEW PIN INPUT --- */}
        <div className="relative mt-4">
          <input
            type={showConfirmPin ? "text" : "password"}
            placeholder="Confirm New PIN"
            value={confirmPin}
            maxLength={4}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))} // फक्त नंबर्स
            className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 pr-12 text-base text-black placeholder:text-gray-400 outline-none transition focus:border-[#825232] focus:ring-2 focus:ring-[#825232]/20 shadow-xs"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPin(!showConfirmPin)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#825232] text-xl cursor-pointer"
          >
            {showConfirmPin ? "👁️" : "🙈"}
          </button>
        </div>

        {/* --- SAVE BUTTON --- */}
        <button
          onClick={async () => {
            const memberString = localStorage.getItem("member");

            if (!memberString) {
              router.replace("/login");
              return;
            }

            const member = JSON.parse(memberString);

            // व्हॅलिडेशन चेक
            if (!oldPin || !newPin || !confirmPin) {
              alert("Please fill all fields.");
              return;
            }

            // Firestore मधून लेटेस्ट डेटा आणणे
            const memberRef = doc(db, "members", member.id);
            const memberSnap = await getDoc(memberRef);

            if (!memberSnap.exists()) {
              alert("Member not found.");
              return;
            }

            const memberData = memberSnap.data();

            if (String(memberData.loginPin) !== oldPin) {
              alert("Current PIN is incorrect.");
              return;
            }

            if (!/^\d{4}$/.test(newPin)) {
              alert("PIN must be exactly 4 digits.");
              return;
            }

            if (newPin !== confirmPin) {
              alert("New PIN and Confirm PIN do not match.");
              return;
            }

            if (newPin === oldPin) {
              alert("New PIN must be different from current PIN.");
              return;
            }

            const weakPins = [
              "0000", "1111", "1234", "2222", "3333", "4444", 
              "5555", "6666", "7777", "8888", "9999"
            ];

            if (weakPins.includes(newPin)) {
              alert("Choose a stronger PIN. Easy combinations like 1234 or 1111 are not allowed.");
              return;
            }

            // Firestore मध्ये नवीन पिन अपडेट करणे
            await updateDoc(memberRef, {
              loginPin: newPin,
              isPinChanged: true,
            });

            // LocalStorage अपडेट करणे
            member.isPinChanged = true;
            localStorage.setItem("member", JSON.stringify(member));

            alert("PIN changed successfully! 🎉 Welcome to Lions Club App.");
            router.replace("/");
          }}
          className="mt-6 w-full rounded-xl bg-[#825232] py-4 text-white font-bold text-lg transition hover:bg-[#6E4025] active:scale-[0.98] shadow-md cursor-pointer"
        >
          Save PIN
        </button>

      </div>
    </main>
  );
}