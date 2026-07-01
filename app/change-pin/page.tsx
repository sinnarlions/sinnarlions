"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { db } from "@/src/firebase/config";

import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

export default function ChangePinPage() {
    const router = useRouter();
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  return (
    <main className="min-h-screen bg-[#825232] flex items-center justify-center px-4">

      <div className="w-full max-w-md rounded-[32px] bg-[#FDF2E9] p-8 shadow-2xl">

        <h1 className="text-3xl font-bold text-center text-[#622A1E]">
          Change PIN
        </h1>

        <p className="text-center text-gray-500 mt-2">
          Please change your default PIN
        </p>

        <input
          type="password"
          placeholder="Current PIN"
          value={oldPin}
          onChange={(e) => setOldPin(e.target.value)}
          className="mt-8 w-full rounded-xl border p-4"
        />

        <input
          type="password"
          placeholder="New 4 Digit PIN"
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
          className="mt-4 w-full rounded-xl border p-4"
        />

        <input
          type="password"
          placeholder="Confirm New PIN"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
          className="mt-4 w-full rounded-xl border p-4"
        />

        <button
  onClick={async () => {

    const memberString = localStorage.getItem("member");

    if (!memberString) {
      router.replace("/login");
      return;
    }

    const member = JSON.parse(memberString);

    // Validation

    if (!oldPin || !newPin || !confirmPin) {
      alert("Please fill all fields.");
      return;
    }

    // Get latest member data from Firestore

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
      "0000",
      "1111",
      "1234",
      "2222",
      "3333",
      "4444",
      "5555",
      "6666",
      "7777",
      "8888",
      "9999",
    ];

    if (weakPins.includes(newPin)) {
      alert("Choose a stronger PIN.");
      return;
    }

    // Firestore Update

    await updateDoc(
  memberRef,
  {
    loginPin: newPin,
    isPinChanged: true,
  }
);

    // Update Local Storage

    member.isPinChanged = true;

    localStorage.setItem(
      "member",
      JSON.stringify(member)
    );

    alert("PIN changed successfully.");

    router.replace("/");

  }}
  className="mt-6 w-full rounded-xl bg-[#825232] py-4 text-white font-bold"
>
  Save PIN
</button>

      </div>

    </main>
  );
}