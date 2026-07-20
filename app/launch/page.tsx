"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LaunchPage() {
  const router = useRouter();
 const [countdown, setCountdown] = useState<number | null>(null);
const [showSuccess, setShowSuccess] = useState(false);
const [isButtonDisabled, setIsButtonDisabled] = useState(false);
 

 const handleLaunch = () => {
  setIsButtonDisabled(true);
  setCountdown(3);
};

 useEffect(() => {
  if (countdown === null) return;

  if (countdown > 0) {
    const timer = setTimeout(() => {
      setCountdown((prev) => (prev ?? 0) - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }

  setShowSuccess(true);

  const timer = setTimeout(() => {
    router.replace("/");
  }, 5000);

  return () => clearTimeout(timer);
}, [countdown, router]);
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-between p-6 bg-gradient-to-br from-[#003B75] to-[#0A4F97] text-white overflow-hidden relative font-sans selection:bg-yellow-500/30">
      {/* Golden Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl gap-8 animate-in fade-in duration-1000">
        {countdown === null && !showSuccess ? (
          <>
            <div className="relative w-52 h-52 md:w-64 md:h-64 rounded-full border border-yellow-500/20 p-2">
              <Image 
                alt="Lions Club Logo" 
                className="object-contain" 
                fill 
                priority 
                src="/logo.png"
              />
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl md:text-2xl
tracking-[0.4em]
font-semibold tracking-[0.3em] uppercase text-yellow-500 font-medium">Lions Club of Sinnar City</h2>
              <h1 className="text-5xl md:text-7xl font-extrabold
text-6xl md:text-8xl tracking-tight">LionsConnect</h1>
              <p className="text-xl md:text-2xl text-blue-100 font-light italic">CONNECT • SERVE • CELEBRATE</p>
            </div>
<div className="w-32 h-1 bg-yellow-500 rounded-full mb-6"/>
            <div className="text-center space-y-1 mt-4">
             <p className="text-3xl md:text-4xl font-extrabold uppercase tracking-[0.2em]"> Official Launch</p>
              <p className="text-xl md:text-2xl tracking-wide text-blue-100 font-light"> Installation Ceremony • 21 July 2026</p>
            </div>

            <button
              onClick={handleLaunch}
              disabled={isButtonDisabled}
              className="mt-8 px-10 py-4 bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold text-lg rounded-full shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              🚀 LAUNCH LIONSCONNECT
            </button>
          </>
        ) : showSuccess ? (
  <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-700">
    <p className="text-2xl text-blue-100">Welcome to</p>

    <h1 className="text-6xl md:text-8xl font-extrabold text-white">
      LionsConnect
    </h1>

    <h2 className="text-4xl md:text-6xl font-bold text-yellow-400">
      Officially Launched
    </h2>
  </div>
) : (
  <div className="flex flex-col items-center gap-6">
    <p className="text-2xl text-blue-100">Launching in</p>

    <div className="text-9xl font-black text-yellow-400 tabular-nums">
      {countdown}
    </div>
  </div>
)}
      </div>

      <footer className="w-full border-t border-white/20 py-8 text-center">
  <p className="text-sm text-white/80">
    © 2026 Lions Club of Sinnar City
  </p>

  <p className="mt-2 text-base font-semibold text-yellow-400">
    LionsConnect Version 1.0
  </p>

  <p className="mt-2 text-sm text-white/70">
    Developed by Lion Jitendra Jagtap
  </p>
</footer>
    </main>
  );
}