"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CreditCard,
  IndianRupee,
  Receipt,
  BarChart3,
  ChevronRight,
} from "lucide-react";

const financeCards = [
  {
    title: "Membership Fees",
    description: "Manage member fee collection.",
    href: "/admin/finance/membership-fees",
    icon: CreditCard,
  },
  {
    title: "Income",
    description: "Add income transactions.",
    href: "/admin/finance/income",
    icon: IndianRupee,
  },
  {
    title: "Expense",
    description: "Add expense transactions.",
    href: "/admin/finance/expense",
    icon: Receipt,
  },
  {
    title: "Transactions",
    description: "View all financial transactions.",
    href: "/admin/finance/transactions",
    icon: Receipt,
  },
  {
    title: "Categories",
    description: "Manage income & expense categories.",
    href: "/admin/finance/categories",
    icon: BarChart3,
  },
  {
    title: "Reports",
    description: "Financial reports and summaries.",
    href: "/admin/finance/reports",
    icon: BarChart3,
  },
];

export default function FinancePage() {
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
            <h1 className="text-xl md:text-2xl font-black text-white uppercase leading-none tracking-tight">
              Lions Connect
            </h1>

            <h2 className="text-[10px] md:text-xs font-black text-[#F2A900] leading-none truncate mt-0.5">
              Lions Club of Sinnar City
            </h2>

            <p className="text-[7px] md:text-[8px] tracking-[0.25em] font-bold text-white/40 uppercase mt-1 leading-none">
              CONNECT • SERVE • CELEBRATE
            </p>
          </div>
        </header>
      </div>

      {/* Page Title */}
      <section className="mx-auto max-w-4xl px-4 pt-6">
        <div className="rounded-2xl bg-white border border-[#F2A900]/20 shadow-sm p-5">
          <h1 className="text-xl font-bold text-[#003B75]">
            Finance Administration
          </h1>

          <p className="mt-2 text-sm text-slate-600 leading-6">
            Manage club financial activities, membership fees,
            receipts and reports.
          </p>

          <div className="mt-4 h-1 w-16 rounded-full bg-[#F2A900]" />
        </div>
      </section>

      {/* Finance Cards */}
    {/* Finance Cards */}
<section className="mx-auto max-w-4xl px-4 py-5">
  <div className="grid gap-3 sm:grid-cols-2">
    {financeCards.map((item) => {
      const Icon = item.icon;

      return (
        <Link
          key={item.title}
          href={item.href}
          className="
            group
            rounded-2xl
            bg-white
            border border-slate-200
            p-4
            shadow-sm
            transition-all
            duration-200
            hover:border-[#F2A900]
            hover:shadow-lg
          "
        >
          <div className="flex items-center justify-between">
            
            <div
              className="
                h-11
                w-11
                rounded-xl
                bg-[#003B75]
                flex
                items-center
                justify-center
                text-white
                shadow
                group-hover:bg-[#F2A900]
                transition
              "
            >
              <Icon size={22} />
            </div>

            <ChevronRight
              size={20}
              className="
                text-slate-300
                group-hover:text-[#F2A900]
                transition
              "
            />
          </div>

          <h2
            className="
              mt-3
              text-base
              font-bold
              text-[#003B75]
            "
          >
            {item.title}
          </h2>

          <p
            className="
              mt-1
              text-xs
              leading-5
              text-slate-500
            "
          >
            {item.description}
          </p>

        </Link>
      );
    })}
  </div>
</section>
    </main>
  );
}