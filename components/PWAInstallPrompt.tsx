"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import InstallGuide from "./InstallGuide";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent.toLowerCase();

    const ios =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" &&
        (navigator as any).maxTouchPoints > 1);

    setIsIOS(ios);

    const dismissed =
      localStorage.getItem("install-dismissed") === "true";

    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();

      setDeferredPrompt(
        e as BeforeInstallPromptEvent
      );

      setShowPrompt(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handler
    );

    window.addEventListener(
      "appinstalled",
      () => {
        localStorage.setItem(
          "install-dismissed",
          "true"
        );

        setShowPrompt(false);
      }
    );

    if (ios) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler
      );
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const result =
      await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      localStorage.setItem(
        "install-dismissed",
        "true"
      );

      setShowPrompt(false);
    }

    setDeferredPrompt(null);
  };

  const closePrompt = () => {
    localStorage.setItem(
      "install-dismissed",
      "true"
    );

    setShowPrompt(false);
  };

  if (!showPrompt) return null;
    return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-blue-200 bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-bold text-[#003B75]">
            Install LionsConnect
          </h2>

          <button
            onClick={closePrompt}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">

          {isIOS ? (
            <InstallGuide />
          ) : (
            <>
              <div className="text-center">

                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Download className="h-8 w-8 text-[#003B75]" />
                </div>

                <h3 className="text-xl font-bold text-[#003B75]">
                  Install LionsConnect
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Install LionsConnect on your phone for a faster,
                  full-screen app experience.
                </p>

              </div>

              <button
                onClick={installApp}
                className="mt-6 w-full rounded-xl bg-[#003B75] py-4 text-lg font-semibold text-white transition hover:bg-[#002f5f]"
              >
                📲 Install App
              </button>

              <button
                onClick={closePrompt}
                className="mt-3 w-full rounded-xl border border-gray-300 py-3 font-medium text-gray-700 hover:bg-gray-50"
              >
                Not Now
              </button>

            </>
          )}

        </div>

      </div>
    </div>
  );
}