"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
   Building2,
    Shield,
  Users,
  Award,
  ScrollText,
  Trophy,
  Target,
    Flag,
  ChevronRight,
} from "lucide-react";

const clubSections = [
  {
  title: "Members Directory",
  description: "View all club members",
  href: "/members",
  icon: Users,
},
  
  {
    title: "Office Bearers",
    description: "Current club leadership",
    href: "/club/board",
    icon: Briefcase,
  },
  {
  title: "Directors",
  description: "Current Board Directors",
  href: "/club/directors",
  icon: Building2,
},
 {
  title: "Cabinet Officers",
  description: "District cabinet leadership",
  href: "/club/cabinet-officers",
  icon: Shield,
},

  {
    title: "Committees",
    description: "Committee structure and members",
    href: "/club/committees",
    icon: Users,
  },
  {
    title: "Past Presidents",
    description: "Year-wise list of past presidents",
    href: "/club/past-presidents",
    icon: Award,
  },
  {
    title: "Club Information",
    description: "Club details and history",
    href: "/club/information",
    icon: ScrollText,
  },
  {
    title: "Club Awards",
    description: "Awards and recognitions",
    href: "/club/awards",
    icon: Trophy,
  },
  {
    title: "Signature Projects",
    description: "Major service projects",
    href: "/club/projects",
    icon: Target,
  },
  {
  title: "ध्वज वंदन",
  description: "National Flag Salutation",
  href: "/club/flag-salutation",
  icon: ScrollText,
},
];

export default function ClubPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-md px-4 py-4">
        {/* Header */}
        {/* Header */}
<div className="overflow-hidden rounded-2xl bg-[#0B4D9B] shadow-md">
  <div className="flex items-center justify-between px-4 py-4">

    <div className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="Lions Club Logo"
        width={52}
        height={52}
        className="h-auto w-12"
        priority
      />

      <div>
        <h1 className="text-base font-bold text-white">
          Lions Club of Sinnar City
        </h1>

        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-yellow-300">
          Club Information & Leadership
        </p>
      </div>
    </div>

    <button
      onClick={() => router.push("/")}
      className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#0B4D9B]"
    >
      ← Back
    </button>

  </div>
</div>
        {/* Section Heading */}
        <div className="mt-5 mb-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
            Club Directory
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="space-y-2.5">
          {clubSections.map((section) => {
            const Icon = section.icon;

            return (
              <Link
                key={section.href}
                href={section.href}
                className="group block rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:border-[#0B4D9B] hover:shadow-md"
              >
                <div className="flex items-center justify-between px-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50">
                      <Icon
                        size={18}
                        className="text-[#0B4D9B]"
                        strokeWidth={2.2}
                      />
                    </div>

                    <div>
                      <h2 className="text-[14px] font-semibold text-[#0B4D9B]">
                        {section.title}
                      </h2>

                      <p className="mt-0.5 text-[11px] leading-4 text-slate-500">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className="text-amber-500 transition-transform group-hover:translate-x-1"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}