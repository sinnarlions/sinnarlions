"use client";

import InstallGuide from "@/components/InstallGuide";
import Link from "next/link";
import { Smartphone } from "lucide-react";

export default function InstallPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-yellow-50">
      <div className="max-w-md mx-auto px-5 py-8">

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/icons/icon-192.png"
            alt="LionsConnect"
            className="w-24 h-24 rounded-3xl shadow-lg"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-[#003B75]">
          LionsConnect
        </h1>

        <p className="text-center text-gray-600 mt-2">
          Install LionsConnect on your mobile for a faster and better experience.
        </p>

        {/* Install Card */}
        <div className="mt-8 bg-white rounded-3xl shadow-lg p-6">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <Smartphone
                size={42}
                className="text-[#003B75]"
              />
            </div>
          </div>

          <InstallGuide />
        </div>

        {/* Login Button */}

        <Link
          href="/login"
          className="block mt-8 bg-[#003B75] hover:bg-[#002c58]
                     text-white text-center font-semibold
                     rounded-xl py-4 transition"
        >
          Open LionsConnect
        </Link>

        <p className="text-center text-xs text-gray-500 mt-6">
          Lions Club of Sinnar City
        </p>

      </div>
    </main>
  );
}