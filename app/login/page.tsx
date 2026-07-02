"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/src/firebase/config";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
export default function LoginPage() {
    const router = useRouter();   
  const [mobile, setMobile] = useState("");
  const [pin, setPin] = useState("");
  

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#6E4025] via-[#825232] to-[#A56A43] flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-md rounded-3xl border border-[#E7D5C8] bg-white p-6 sm:p-8 shadow-2xl">

        <h1 className="text-3xl font-bold text-center text-[#622A1E]">
          Member Login
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Lions Club of Sinnar City
        </p>

        <input
          type="text"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="mt-8 w-full rounded-xl border-2 border-gray-300 bg-white p-4 text-base text-black placeholder:text-gray-500 outline-none transition focus:border-[#825232] focus:ring-2 focus:ring-[#825232]/20"
        />

        <input
          type="password"
          placeholder="4 Digit PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="mt-4 w-full rounded-xl border-2 border-gray-300 bg-white p-4 text-base text-black placeholder:text-gray-500 outline-none transition focus:border-[#825232] focus:ring-2 focus:ring-[#825232]/20"
        />

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

    if (String(member.loginPin) !== pin) {
      alert("Invalid PIN");
      return;
    }

    localStorage.setItem(
  "member",
  JSON.stringify({
    id: memberDoc.id,

    memberCode: member.memberCode,

    name: member.name,

    mobile: member.mobile,

    currentLionsRole:
      member.currentLionsRole || "Member",

    isSuperAdmin:
      member.isSuperAdmin || false,

    isPinChanged:
      member.isPinChanged,
  })
  localStorage.setItem("memberName", member.name);
   localStorage.setItem("memberMobile", member.mobile);
);

    if (!member.isPinChanged) {
  router.replace("/change-pin");
} else {
  router.replace("/");
}

  }}
 className="mt-6 w-full rounded-xl bg-[#825232] py-4 text-lg font-semibold text-white transition hover:bg-[#6E4025] active:scale-[0.98]"
>
  Login
</button>

      </div>

    </main>
  );
}