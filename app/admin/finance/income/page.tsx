'use client';

import React, { useEffect, useState, useMemo } from 'react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Download } from "lucide-react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from "@/src/firebase/config";
import { useRouter } from "next/navigation";
import { canAccessFinance } from "@/src/utils/permissions";

interface MembershipFee {
  id: string;
  primaryMemberCode?: string;
  spouseMemberCode?: string;
  memberName: string;
  membershipType: string;
  lionYear: string;
  totalAmount: number;
  paymentDate: Timestamp | Date | string;
  paymentMode: 'Cash' | 'UPI' | 'Cheque' | 'NEFT / RTGS' | string;
  referenceNo?: string;
  remarks?: string;
  receiptNo: string;
  receivedAt: Timestamp | Date | string;
}

type FilterType = 'All' | 'Today' | 'This Month' | 'Lion Year';

export default function IncomeDashboard() {
  const router = useRouter();

const member =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("member") || "{}")
    : {};
  const [data, setData] = useState<MembershipFee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [selectedLionYear, setSelectedLionYear] = useState<string>('');
useEffect(() => {
  if (!canAccessFinance(member)) {
    router.replace("/");
    return;
  }
}, []);
  useEffect(() => {
    async function fetchIncomeData() {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'membershipFees'),
          orderBy('receivedAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedData: MembershipFee[] = [];
        querySnapshot.forEach((docSnap) => {
          fetchedData.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as MembershipFee);
        });
        setData(fetchedData);
        
        // Default to the latest lion year if available
        if (fetchedData.length > 0) {
          const firstYear = fetchedData.find((item) => item.lionYear)?.lionYear;
          if (firstYear) {
            setSelectedLionYear(firstYear);
          }
        }
      } catch (error) {
        console.error('Error fetching membership fees:', error);
      } finally {
        setLoading(false);
      }
    }

    if (canAccessFinance(member)) {
  fetchIncomeData();
}
  }, []);

  // Helper date checking functions
  const isToday = (dateInput: Timestamp | Date | string) => {
    const date = toDate(dateInput);
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isThisMonth = (dateInput: Timestamp | Date | string) => {
    const date = toDate(dateInput);
    if (!date) return false;
    const today = new Date();
    return (
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const toDate = (dateInput: Timestamp | Date | string): Date | null => {
    if (!dateInput) return null;
    if (dateInput instanceof Timestamp) {
      return dateInput.toDate();
    }
    if (dateInput instanceof Date) {
      return dateInput;
    }
    const parsed = new Date(dateInput);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  // Available unique lion years for filtering
  const availableLionYears = useMemo(() => {
    const years = new Set<string>();
    data.forEach((item) => {
      if (item.lionYear) years.add(item.lionYear);
    });
    return Array.from(years).sort().reverse();
  }, [data]);

  // Filtered dataset based on active pill filter
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (activeFilter === 'Today') {
        return isToday(item.paymentDate || item.receivedAt);
      }
      if (activeFilter === 'This Month') {
        return isThisMonth(item.paymentDate || item.receivedAt);
      }
      if (activeFilter === 'Lion Year') {
        return selectedLionYear ? item.lionYear === selectedLionYear : true;
      }
      return true;
    });
  }, [data, activeFilter, selectedLionYear]);

  // Summary Metrics calculations
  const totalCollection = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
  }, [filteredData]);

  const todaysCollection = useMemo(() => {
    return data
      .filter((item) => isToday(item.paymentDate || item.receivedAt))
      .reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
  }, [data]);

  const monthlyCollection = useMemo(() => {
    return data
      .filter((item) => isThisMonth(item.paymentDate || item.receivedAt))
      .reduce((sum, item) => sum + (Number(item.totalAmount) || 0), 0);
  }, [data]);

  const totalReceiptsCount = filteredData.length;

  // Payment Mode breakdown
  const paymentModes = ['Cash', 'UPI', 'Cheque', 'NEFT / RTGS'] as const;

  const paymentModeSummary = useMemo(() => {
    const summary: Record<string, { count: number; amount: number }> = {};
    paymentModes.forEach((mode) => {
      summary[mode] = { count: 0, amount: 0 };
    });

    filteredData.forEach((item) => {
      const mode = item.paymentMode;
      if (mode && summary[mode]) {
        summary[mode].count += 1;
        summary[mode].amount += Number(item.totalAmount) || 0;
      } else if (mode) {
        // Fallback for unexpected string variations
        if (!summary[mode]) {
          summary[mode] = { count: 0, amount: 0 };
        }
        summary[mode].count += 1;
        summary[mode].amount += Number(item.totalAmount) || 0;
      }
    });

    return summary;
  }, [filteredData]);

  const formatDate = (dateInput: Timestamp | Date | string) => {
    const date = toDate(dateInput);
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
const exportPDF = () => {
  const pdf = new jsPDF();

  pdf.setFontSize(18);
  pdf.text("Income Report", 14, 18);

  pdf.setFontSize(11);
  pdf.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 26);

  autoTable(pdf, {
    startY: 35,
    head: [["Receipt", "Member", "Date", "Mode", "Amount"]],
    body: filteredData.map((item) => [
      item.receiptNo,
      item.memberName,
      formatDate(item.paymentDate || item.receivedAt),
      item.paymentMode,
      item.totalAmount.toLocaleString(),
    ]),
    
  });

  pdf.save("Income_Report.pdf");
};
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#003B75] border-t-[#F2A900] rounded-full animate-spin"></div>
          <p className="text-[#003B75] font-semibold text-lg">Loading Income Dashboard...</p>
          
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-12">
        <div className="max-w-7xl mx-auto px-4 pt-4">
  <Link
    href="/admin/finance"
    className="inline-flex items-center gap-2 text-[#003B75] font-semibold hover:underline"
  >
    <ChevronLeft size={18} />
    Back to Finance
  </Link>
</div>
      {/* Header Banner */}
      <header className="bg-[#003B75] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#F2A900]"></span>
              <span className="text-xs uppercase tracking-wider font-bold text-[#F2A900]">LionsConnect Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">Membership Fee Collection</h1>
          </div>
          
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 bg-white/10 p-1.5 rounded-xl backdrop-blur-sm">
            {(['All', 'Today', 'This Month', 'Lion Year'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-[#F2A900] text-[#003B75] shadow'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {filter}
              </button>
            ))}

            {activeFilter === 'Lion Year' && availableLionYears.length > 0 && (
              <select
                value={selectedLionYear}
                onChange={(e) => setSelectedLionYear(e.target.value)}
                className="bg-white text-[#003B75] text-xs sm:text-sm px-2 py-1.5 rounded-lg font-semibold focus:outline-none"
              >
                {availableLionYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Collection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-[#003B75] flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-gray-400">Total Collection</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#003B75] mt-2">
                {formatCurrency(totalCollection)}
              </h3>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span>Filtered Scope</span>
              <span className="font-semibold text-[#003B75]">{activeFilter}</span>
            </div>
          </div>

          {/* Today's Collection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-[#F2A900] flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-gray-400">Today's Collection</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(todaysCollection)}
              </h3>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span>Real-time tracking</span>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
          </div>

          {/* This Month Collection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-[#003B75] flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-gray-400">This Month Collection</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(monthlyCollection)}
              </h3>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span>Current Calendar Month</span>
            </div>
          </div>

          {/* Total Receipts */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-[#F2A900] flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-gray-400">Total Receipts</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#003B75] mt-2">
                {totalReceiptsCount}
              </h3>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
              <span>Generated Transactions</span>
              <span className="font-semibold">{activeFilter}</span>
            </div>
          </div>
        </div>

        {/* Payment Mode Summary Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#003B75]">Payment Mode Summary</h2>
            <span className="text-xs text-gray-500">Breakdown by channel</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {paymentModes.map((mode) => {
              const stats = paymentModeSummary[mode] || { count: 0, amount: 0 };
              return (
                <div key={mode} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 text-[#003B75]">
                      {mode}
                    </span>
                    <span className="text-xs font-semibold text-gray-400">{stats.count} Receipts</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.amount)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Collections Table Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-lg font-bold text-[#003B75]">Recent Collections</h2>
              <p className="text-xs text-gray-500">Complete transaction ledger sorted newest first</p>
            </div>
           
            <div className="flex items-center gap-3">
  <span className="text-xs bg-[#003B75]/10 text-[#003B75] font-semibold px-3 py-1 rounded-lg">
    Showing {filteredData.length} records
  </span>

  <button
    onClick={exportPDF}
    className="flex items-center gap-2 bg-[#003B75] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#002b57]"
  >
    <Download size={16} />
    Export PDF
  </button>
</div>
          </div>

          {filteredData.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xl">
                !
              </div>
              <p className="text-gray-600 font-medium">No membership fee records found for the selected filter.</p>
              <button
                onClick={() => setActiveFilter('All')}
                className="text-xs font-bold text-[#003B75] hover:underline"
              >
                Reset filter to view all records
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="py-4 px-6 font-semibold">Receipt No</th>
                    <th className="py-4 px-6 font-semibold">Member Name</th>
                    <th className="py-4 px-6 font-semibold">Payment Date</th>
                    <th className="py-4 px-6 font-semibold">Payment Mode</th>
                    <th className="py-4 px-6 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6 font-medium text-[#003B75]">
                        {item.receiptNo || 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{item.memberName || 'Unnamed Member'}</div>
                        <div className="text-xs text-gray-400">
                          {item.membershipType} {item.lionYear ? `(${item.lionYear})` : ''}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {formatDate(item.paymentDate || item.receivedAt)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-md ${
                          item.paymentMode === 'Cash'
                            ? 'bg-amber-50 text-amber-700'
                            : item.paymentMode === 'UPI'
                            ? 'bg-blue-50 text-blue-700'
                            : item.paymentMode === 'Cheque'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {item.paymentMode || 'Other'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-gray-900">
                        {formatCurrency(Number(item.totalAmount) || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}