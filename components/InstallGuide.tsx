"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Smartphone,
  Monitor,
  ChevronDown,
  ChevronUp,
  Download,
  Share,
  PlusSquare,
  CheckCircle2,
  Info,
} from "lucide-react";

type DeviceType = "android" | "iphone" | "desktop";

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function InstallGuide() {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;

    const ua = navigator.userAgent.toLowerCase();

    const isAndroid = ua.includes("android");
    const isIOS =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" &&
        (navigator as any).maxTouchPoints > 1);

    if (isAndroid) {
      setDevice("android");
    } else if (isIOS) {
      setDevice("iphone");
    } else {
      setDevice("desktop");
    }
  }, []);

  const androidSteps: Step[] = useMemo(
    () => [
      {
        title: "Open LionsConnect",
        description:
          "Open the LionsConnect website in Google Chrome on your Android phone.",
        icon: <Smartphone className="w-5 h-5" />,
      },
      {
        title: "Tap Install",
        description:
          "If Chrome displays an Install App banner, tap Install.",
        icon: <Download className="w-5 h-5" />,
      },
      {
        title: "Or use Chrome Menu",
        description:
          "Tap the three-dot menu and choose 'Install App' or 'Add to Home screen'.",
        icon: <PlusSquare className="w-5 h-5" />,
      },
      {
        title: "Done",
        description:
          "LionsConnect will now appear like a normal app on your Home Screen.",
        icon: <CheckCircle2 className="w-5 h-5" />,
      },
    ],
    []
  );

  const iphoneSteps: Step[] = useMemo(
    () => [
      {
        title: "Open in Safari",
        description:
          "Open LionsConnect using Safari. Installation works only from Safari.",
        icon: <Smartphone className="w-5 h-5" />,
      },
      {
        title: "Tap Share",
        description:
          "Tap the Share button at the bottom of Safari.",
        icon: <Share className="w-5 h-5" />,
      },
      {
        title: "Add to Home Screen",
        description:
          "Scroll down and tap 'Add to Home Screen'.",
        icon: <PlusSquare className="w-5 h-5" />,
      },
      {
        title: "Tap Add",
        description:
          "Tap Add in the top-right corner. LionsConnect is now installed.",
        icon: <CheckCircle2 className="w-5 h-5" />,
      },
    ],
    []
  );

  const currentSteps =
    device === "android"
      ? androidSteps
      : device === "iphone"
      ? iphoneSteps
      : [];

  return (
    <div className="mt-6 rounded-2xl border border-blue-200 bg-white shadow-md overflow-hidden">

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-blue-700 text-white"
      >
        <div className="flex items-center gap-3">
          <Download className="w-5 h-5" />
          <span className="font-semibold text-lg">
            Install LionsConnect App
          </span>
        </div>

        {open ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {open && (
        <div className="p-5 space-y-5">

          {device === "desktop" && (
            <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4">
              <div className="flex gap-3">
                <Monitor className="w-5 h-5 text-yellow-700 mt-0.5" />

                <div>
                  <h3 className="font-semibold text-yellow-900">
                    Open on your mobile phone
                  </h3>

                  <p className="text-sm text-yellow-800 mt-1">
                    Installing LionsConnect works from an Android phone
                    using Chrome or from an iPhone using Safari.
                  </p>
                </div>
              </div>
            </div>
          )}

          {device !== "desktop" && (
            <>
              <div
                className={`rounded-xl p-4 border ${
                  device === "android"
                    ? "bg-green-50 border-green-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5" />

                  <div>
                    <h3 className="font-semibold">
                      {device === "android"
                        ? "Android Installation"
                        : "iPhone Installation"}
                    </h3>

                    <p className="text-sm mt-1">
                      Follow the steps below to install LionsConnect on your
                      Home Screen.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {currentSteps.map((step, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center font-bold shrink-0">
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-semibold text-blue-900">
                          {step.icon}
                          {step.title}
                        </div>

                        <p className="text-gray-600 text-sm mt-2 leading-6">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Tips
                </h3>

                <ul className="space-y-2 text-sm text-amber-800">
                  {device === "android" ? (
                    <>
                      <li>
                        • If you don't see the Install option, refresh the page
                        once and try again.
                      </li>

                      <li>
                        • Make sure you are using Google Chrome.
                      </li>

                      <li>
                        • After installation, open LionsConnect from your Home
                        Screen just like any other app.
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        • Installation works only in Safari.
                      </li>

                      <li>
                        • If "Add to Home Screen" isn't visible, scroll further
                        down in the Share menu.
                      </li>

                      <li>
                        • Once added, LionsConnect launches like a normal iPhone
                        app.
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="rounded-xl bg-blue-700 text-white p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />

                  <div>
                    <h3 className="font-semibold">
                      Enjoy the App Experience
                    </h3>

                    <p className="text-sm text-blue-100 mt-1 leading-6">
                      After installation, LionsConnect opens in full-screen,
                      starts faster, and feels just like a native mobile app.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}