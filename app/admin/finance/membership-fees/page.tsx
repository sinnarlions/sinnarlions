"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Users,
  UserCheck,
  UserX,
  IndianRupee,
  ChevronLeft,
} from "lucide-react";

const summaryCards = [
  {
    title: "Total Members",
    value: "100",
    icon: Users,
  },
  {
    title: "Paid Members",
    value: "0",
    icon: UserCheck,
  },
  {
    title: "Pending Members",
    value: "100",
    icon: UserX,
  },
  {
    title: "Total Collection",
    value: "₹0",
    icon: IndianRupee,
  },
];

export default function MembershipFeesPage() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-[#003B75] shadow-md">
        <header className="py-2.5 px-4 max-w-4xl w-full mx-auto text-white relative flex items-center">

          <div className="absolute left-4">
            <Image
              src="/logo.png"
              alt="Lions Logo"
              width={44}
              height={44}
              className="object-contain"
            />
          </div>

          <div className="flex-1 text-center min-w-0">

            <h1 className="text-xl md:text-2xl font-black uppercase leading-none tracking-tight">
              Lions Connect
            </h1>

            <h2 className="text-[10px] md:text-xs font-black text-[#F2A900] leading-none truncate mt-0.5">
              Lions Club of Sinnar City
            </h2>

            <p className="text-[7px] md:text-[8px] tracking-[0.25em] font-bold text-white/40 uppercase mt-1">
              CONNECT • SERVE • CELEBRATE
            </p>

          </div>
        </header>
      </div>


      {/* Title */}
      <section className="max-w-4xl mx-auto px-4 pt-5">

        <Link
          href="/admin/finance"
          className="inline-flex items-center gap-1 text-sm text-[#003B75] font-semibold"
        >
          <ChevronLeft size={18} />
          Finance
        </Link>


        <div className="mt-4 bg-white rounded-2xl border border-[#F2A900]/20 shadow-sm p-4">

          <h1 className="text-xl font-bold text-[#003B75]">
            Membership Fees
          </h1>

          <p className="mt-1 text-sm text-slate-600">
            Manage member fee collection and payment status.
          </p>

        </div>

      </section>


      {/* Summary Cards */}
      <section className="max-w-4xl mx-auto px-4 py-5">

        <div className="grid grid-cols-2 gap-3">

          {summaryCards.map((card) => {

            const Icon = card.icon;

            return (

              <div
                key={card.title}
                className="
                  bg-white
                  rounded-2xl
                  border
                  border-slate-200
                  p-4
                  shadow-sm
                "
              >

                <div className="flex items-center justify-between">

                  <div className="
                    h-10
                    w-10
                    rounded-xl
                    bg-[#003B75]
                    flex
                    items-center
                    justify-center
                    text-white
                  ">
                    <Icon size={20} />
                  </div>


                  <span className="text-xl font-bold text-[#003B75]">
                    {card.value}
                  </span>

                </div>


                <p className="mt-3 text-xs font-semibold text-slate-500">
                  {card.title}
                </p>


              </div>

            );

          })}

        </div>

      </section>


      {/* Member Status */}
      <section className="max-w-4xl mx-auto px-4 pb-6">

        <div className="
          bg-white
          rounded-2xl
          border
          border-slate-200
          shadow-sm
          p-4
        ">

          <h2 className="text-base font-bold text-[#003B75]">
            Member Fee Status
          </h2>


          <div className="
            mt-4
            rounded-xl
            bg-slate-50
            p-5
            text-center
            text-sm
            text-slate-500
          ">

            Member payment details will appear here.

          </div>


        </div>

      </section>

    </main>
  );
}