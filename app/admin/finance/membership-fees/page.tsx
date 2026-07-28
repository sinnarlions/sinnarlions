"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/src/firebase/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  canAccessFinance,
  canManageFinance,
} from "@/src/utils/permissions";
import { ChevronLeft, Download, Send, CheckCircle, Clock, Users } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Member {
  id: string;
  memberCode: string;
  name: string;
  spouseName?: string;
  spouseMemberId?: string;
  phone?: string;
  currentLionsRole?: string;
  currentCabinetRole?: string;
}

interface FeeData {
  primaryMemberCode: string;
  spouseMemberCode?: string;
  memberName: string;
  membershipType: "Regular" | "New";
  lionYear: string;
  totalAmount: number;
  paymentDate: string;
  paymentMode: string;
  transactionDate: string;
  referenceNo?: string;
  bankName?: string;
  remarks?: string;
  receiptNo: string;
  receivedBy?: string;
  receivedByName?: string;
  receivedAt?: any;
  status: "Paid" | "Cancelled"; // Cancel support साठी जोडले
  cancelledAt?: any;
  cancelledBy?: string;
  cancelReason?: string;
}

export default function MembershipFeesPage() {
  const router = useRouter();

  const member =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("member") || "{}")
      : {};
      
  const [couples, setCouples] = useState<Member[]>([]);
  const [paidMembers, setPaidMembers] = useState<Record<string, FeeData>>({});
  const [filter, setFilter] = useState<"All" | "Paid" | "Pending">("All");
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCouple, setSelectedCouple] = useState<Member | null>(null);
  const [amount, setAmount] = useState(12000);
  const [regularFee, setRegularFee] = useState(12000);
  const [admissionFee, setAdmissionFee] = useState(3000);
  const [paymentMode, setPaymentMode] = useState("Cash");

  const [cashDate, setCashDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [chequeDate, setChequeDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [upiDate, setUpiDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [bankDate, setBankDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [treasurerName, setTreasurerName] = useState("");
  const [secretaryName, setSecretaryName] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [membershipType, setMembershipType] = useState<"Regular" | "New">("Regular");

  useEffect(() => {
    if (!canAccessFinance(member)) {
      router.replace("/");
      return;
    }
    loadData();
  }, []);

  async function loadData() {
    const settingsSnap = await getDoc(
      doc(db, "membershipFeeSettings", "2026-2027")
    );

    if (settingsSnap.exists()) {
      const settings = settingsSnap.data();
      setRegularFee(settings.regularMemberFee ?? 12000);
      setAdmissionFee(settings.admissionFee ?? 3000);
    }

    const mSnap = await getDocs(collection(db, "members"));
    const allDocs = mSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    })) as Member[];

    const treasurer = allDocs.find(
      (m) => m.currentLionsRole === "Treasurer"
    );
    const secretary = allDocs.find(
      (m) => m.currentLionsRole === "Secretary"
    );

    setTreasurerName(treasurer?.name ?? "");
    setSecretaryName(secretary?.name ?? "");

    const processed = new Set<string>();
    const uniqueCouples: Member[] = [];

    for (const m of allDocs) {
      if (!m.spouseMemberId) continue;
      if (processed.has(m.memberCode)) continue;
      uniqueCouples.push(m);
      processed.add(m.memberCode);
      processed.add(m.spouseMemberId);
    }

    uniqueCouples.sort((a, b) => a.name.localeCompare(b.name));
    setCouples(uniqueCouples);

   const fSnap = await getDocs(
  query(
    collection(db, "membershipFees"),
    where("lionYear", "==", "2026-2027")
  )
);

    const status: Record<string, FeeData> = {};

fSnap.docs.forEach((d) => {
  const data = d.data() as FeeData;

  if (data.status !== "Cancelled") {
    status[data.primaryMemberCode] = data;
  }
});
console.log("Paid Status:", status);
    setPaidMembers(status);
    console.log("Paid Status:", status);
console.log("Paid Count:", Object.keys(status).length);
  }
console.log("Couples:", couples.length);
console.log("Paid Members:", Object.keys(paidMembers).length);
  const totalCouples = couples.length;
  const paidCount = Object.keys(paidMembers).length;
  const pendingCount = totalCouples - paidCount;

  const generatePDF = (couple: Member, data: FeeData) => {
    const docPdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = docPdf.internal.pageSize.getWidth();

    const BLUE = [0, 59, 117];
    const GOLD = [242, 169, 0];
    const LIGHT = [245, 248, 252];

    docPdf.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
    docPdf.rect(0, 0, pageWidth, 26, "F");

    docPdf.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
    docPdf.rect(0, 26, pageWidth, 2, "F");

    docPdf.setTextColor(255);
    docPdf.setFont("helvetica", "bold");
    docPdf.setFontSize(19);
    docPdf.text("LIONS CLUB OF SINNAR CITY", pageWidth / 2, 11, { align: "center" });

    docPdf.setFontSize(10);
    docPdf.setFont("helvetica", "normal");
    docPdf.text("Membership Fee Receipt", pageWidth / 2, 18, { align: "center" });

    docPdf.setFontSize(8);
    docPdf.text("LionsConnect Finance Department", pageWidth / 2, 23, { align: "center" });

    docPdf.setFillColor(LIGHT[0], LIGHT[1], LIGHT[2]);
    docPdf.roundedRect(12, 34, 186, 40, 3, 3, "F");
    docPdf.setDrawColor(BLUE[0], BLUE[1], BLUE[2]);
    docPdf.roundedRect(12, 34, 186, 40, 3, 3);

    docPdf.setTextColor(0);
    docPdf.setFontSize(10);

    docPdf.setFont("helvetica", "bold");
    docPdf.text("Receipt No.", 18, 44);
    docPdf.setFont("helvetica", "normal");
    docPdf.text(data.receiptNo, 48, 44);

    docPdf.setFont("helvetica", "bold");
docPdf.text("Received From", 18, 54);

docPdf.setFontSize(11);

const memberLines = docPdf.splitTextToSize(data.memberName, 55);
docPdf.text(memberLines, 48, 54);

docPdf.setFontSize(10);
docPdf.setFont("helvetica", "normal");
    docPdf.setFont("helvetica", "bold");
    docPdf.text("Member Code", 18, 72);
    docPdf.setFont("helvetica", "normal");
    docPdf.text(couple.memberCode, 48, 72);

    docPdf.setFont("helvetica", "bold");
    docPdf.text("Date", 118, 44);
    docPdf.setFont("helvetica", "normal");
    const formattedDate = new Date(data.paymentDate).toLocaleDateString('en-GB');
    docPdf.text(formattedDate, 160, 44);

    docPdf.setFont("helvetica", "bold");
    docPdf.text("Lion Year", 118, 54);
    docPdf.setFont("helvetica", "normal");
    docPdf.text(data.lionYear, 160, 54);

    docPdf.setFont("helvetica", "bold");
    docPdf.text("Membership", 118, 64);
    docPdf.setFont("helvetica", "normal");
    docPdf.text(data.membershipType, 160, 64);
// Trigger Vercel deployment
    autoTable(docPdf, {
      startY: 75,
      margin: { left: 12, right: 12 },
      theme: "grid",
      head: [["#", "Particular", "Amount"]],
      headStyles: { fillColor: [0, 59, 117], textColor: 255, halign: "center", fontStyle: "bold" },
      body: [
        ["1", `${data.membershipType} Membership Fee`, "Rs " + data.totalAmount.toLocaleString()],
        ["", "TOTAL RECEIVED", "Rs " + data.totalAmount.toLocaleString()],
      ],
      bodyStyles: { fontSize: 10 },
      columnStyles: { 0: { halign: "center", cellWidth: 15 }, 2: { halign: "right", cellWidth: 45 } },
    });

    const tableEnd = (docPdf as any).lastAutoTable.finalY;

    docPdf.setFillColor(228, 248, 228);
    docPdf.roundedRect(125, tableEnd + 8, 65, 20, 3, 3, "F");
    docPdf.setDrawColor(0, 120, 0);
    docPdf.roundedRect(125, tableEnd + 8, 65, 20, 3, 3);

    const boxCenter = 157.5;
    docPdf.setFont("helvetica", "bold");
    docPdf.setFontSize(10);
    docPdf.text("TOTAL PAID", boxCenter, tableEnd + 15, { align: "center" });

    docPdf.setFontSize(14);
    docPdf.text("Rs " + data.totalAmount.toLocaleString(), boxCenter, tableEnd + 22, { align: "center" });

    const infoY = tableEnd + 40;
    docPdf.setFontSize(10);
    docPdf.setFont("helvetica", "bold");
    docPdf.text("Payment Mode", 18, infoY);
docPdf.setFont("helvetica", "normal");
docPdf.text(data.paymentMode || "-", 55, infoY);
   if (data.paymentMode !== "Cash") {
  docPdf.setFont("helvetica", "bold");

  docPdf.text(
    data.paymentMode === "UPI"
      ? "UPI Txn ID"
      : data.paymentMode === "Cheque"
      ? "Cheque No"
      : "UTR No",
    18,
    infoY + 9
  );

  docPdf.setFont("helvetica", "normal");
  docPdf.text(data.referenceNo || "-", 55, infoY + 9);

  if (data.paymentMode === "Cheque") {
    docPdf.setFont("helvetica", "bold");
    docPdf.text("Bank", 118, infoY + 9);

    docPdf.setFont("helvetica", "normal");
    docPdf.text(data.bankName || "-", 140, infoY + 9);
  }
}

    if (data.paymentMode === "Cheque") {
      docPdf.setFont("helvetica", "bold");
      docPdf.text("Bank", 118, infoY + 9);
      docPdf.setFont("helvetica", "normal");
      docPdf.text(data.bankName || "-", 140, infoY + 9);
    }

    docPdf.setFont("helvetica", "bold");
    docPdf.text("Remarks", 18, infoY + 18);
    docPdf.setFont("helvetica", "normal");
    docPdf.text(data.remarks || "-", 55, infoY + 18);

    docPdf.setFillColor(250, 250, 235);
    docPdf.roundedRect(12, infoY + 28, 186, 18, 2, 2, "F");
    docPdf.setFont("helvetica", "bold");
    docPdf.text("Amount Received :", 18, infoY + 38);
    docPdf.setFont("helvetica", "normal");

    const numToWords = (n: number): string => {
      const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
      const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? "-" + a[n % 10] : "");
      if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + (n % 100 !== 0 ? "and " + numToWords(n % 100) : "");
      if (n < 1000000) return numToWords(Math.floor(n / 1000)) + " Thousand " + (n % 1000 !== 0 ? numToWords(n % 1000) : "");
      return n.toString();
    };

    docPdf.text("Rupees " + numToWords(data.totalAmount) + " Only", 58, infoY + 38);

    const signY = 245;
    docPdf.setDrawColor(120);
    docPdf.line(25, signY, 80, signY);
    docPdf.line(130, signY, 185, signY);

    docPdf.setFont("courier", "italic");
    docPdf.setFontSize(13);
    docPdf.setTextColor(0, 59, 117);
    docPdf.text(treasurerName, 52, signY - 3, { align: "center" });
    docPdf.text(secretaryName, 157, signY - 3, { align: "center" });

    docPdf.setFont("helvetica", "bold");
    docPdf.setFontSize(10);
    docPdf.text("Treasurer", 52, signY + 8, { align: "center" });
    docPdf.text("Secretary", 157, signY + 8, { align: "center" });
    docPdf.setTextColor(0, 0, 0);

    docPdf.setFontSize(8);
    docPdf.setFont("helvetica", "normal");
    docPdf.setTextColor(90);
    docPdf.text(`Generated : ${new Date().toLocaleString("en-GB")}`, 15, 270);

    docPdf.setFillColor(0, 59, 117);
    docPdf.rect(0, 285, pageWidth, 12, "F");
    docPdf.setTextColor(255);
    docPdf.setFontSize(8);
    docPdf.text("Computer Generated Receipt • LionsConnect Finance Module", pageWidth / 2, 292, { align: "center" });

    docPdf.save(`Receipt_${data.receiptNo}.pdf`);
  };

  const saveFee = async () => {
    if (!canManageFinance(member)) {
      alert("You are not authorized to collect membership fees.");
      return;
    }
    if (!selectedCouple) return;

    try {
      const counterRef = doc(db, "receiptCounters", "2026-2027");
     
const statusDocRef = doc(
  db,
  "membershipFeeStatus",
  `2026-2027_${selectedCouple.memberCode}`
);
     

      await runTransaction(db, async (transaction) => {
        const existingFeeSnap = await transaction.get(statusDocRef);
        
        // जर आधीपासून रेकॉर्ड असेल आणि तो "Paid" असेल तरच डुप्लिकेट एरर द्या.
        // जर तो आधी "Cancelled" असेल, तर मात्र नवीन रिसिप्ट तयार करता येईल (पुन्हा भरण्याची सोय).
        if (existingFeeSnap.exists()) {
          const existingData = existingFeeSnap.data() as FeeData;
          if (existingData.status !== "Cancelled") {
            throw new Error("Membership Fee is already received for this Lion Year.");
          }
        }

        const counterSnap = await transaction.get(counterRef);
        let nextNumber = 1;

        if (counterSnap.exists()) {
          nextNumber = counterSnap.data().nextReceiptNo ?? 1;
        }

        const receiptNo = `R2026-${String(nextNumber).padStart(3, "0")}`;

        transaction.set(
          counterRef,
          {
            nextReceiptNo: nextNumber + 1,
            updatedAt: serverTimestamp(), // सर्व्हर टाईमस्टॅम्प वापरला
          },
          { merge: true }
        );
const feeDocRef = doc(db, "membershipFees", receiptNo);
        const feeData = {
          primaryMemberCode: selectedCouple.memberCode,
          spouseMemberCode: selectedCouple.spouseMemberId,
          memberName: `${selectedCouple.name} & ${selectedCouple.spouseName ?? ""}`,
          lionYear: "2026-2027",
          membershipType,
          totalAmount: amount,
          paymentDate:
            paymentMode === "Cash"
              ? cashDate
              : paymentMode === "UPI"
              ? upiDate
              : paymentMode === "Cheque"
              ? chequeDate
              : bankDate,
          paymentMode,
          transactionDate:
            paymentMode === "Cash"
              ? cashDate
              : paymentMode === "UPI"
              ? upiDate
              : paymentMode === "Cheque"
              ? chequeDate
              : bankDate,
          referenceNo,
          bankName: paymentMode === "Cheque" ? bankName : "",
          remarks,
          receiptNo,
          receivedBy: member.id || member.memberCode || "Unknown",
          receivedByName: member.name || "Admin",
          receivedAt: serverTimestamp(), // सर्व्हर टाईमस्टॅम्प वापरला
          status: "Paid" as const, // Cancel Support साठी Paid फ्लॅग
          cancelledAt: null,
          cancelledBy: "",
          cancelReason: "",
        };
console.log("Fee Data:", feeData);
        transaction.set(feeDocRef, feeData);
        transaction.set(statusDocRef, {
  receiptNo,
  status: "Paid",
  updatedAt: serverTimestamp(),
});
      });

      await loadData();
      setShowDialog(false);
      setReferenceNo("");
      setBankName("");
      setRemarks("");
    } catch (error: any) {
      alert(error.message || "Failed to save membership fee.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <Link href="/admin/finance" className="flex items-center text-[#003B75] mb-4 font-bold"><ChevronLeft size={18}/> Back</Link>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[#003B75]">
          Membership Fees
        </h1>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-[#003B75] text-white p-3 rounded-xl text-center shadow-md">
          <div className="text-[9px] uppercase font-bold opacity-80">Total</div>
          <div className="text-xl font-black">{totalCouples}</div>
        </div>
        <div className="bg-[#15803d] text-white p-3 rounded-xl text-center shadow-md">
          <div className="text-[9px] uppercase font-bold opacity-80">Paid</div>
          <div className="text-xl font-black">{paidCount}</div>
        </div>
        <div className="bg-[#b91c1c] text-white p-3 rounded-xl text-center shadow-md">
          <div className="text-[9px] uppercase font-bold opacity-80">Pending</div>
          <div className="text-xl font-black">{pendingCount}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(["All", "Paid", "Pending"] as const).map((f) => (
          <button 
            key={f} 
            onClick={() => setFilter(f)} 
            className={`flex-1 py-2 rounded-lg text-[11px] font-bold border transition-all ${
              filter === f 
                ? "bg-[#003B75] text-white border-[#003B75]" 
                : "bg-white text-gray-600 border-gray-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>
<input
  type="text"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search by Name / Member Code"
  className="w-full mb-5 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003B75]"
/>
      
      
      <div className="space-y-3">
       {couples
  .filter((m) => {
    const statusMatch =
      filter === "All"
        ? true
        : filter === "Paid"
        ? !!paidMembers[m.memberCode]
        : !paidMembers[m.memberCode];

    const searchMatch =
      search.trim() === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.spouseName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      m.memberCode.toLowerCase().includes(search.toLowerCase());

    return statusMatch && searchMatch;
  })
  .map((couple) => (
          <div key={couple.memberCode} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#003B75]">
            <div>
              <p className="font-bold text-[#003B75]">{couple.name} & {couple.spouseName}</p>
              <p className="text-xs text-gray-500">Code: {couple.memberCode}</p>
            </div>
            
            {paidMembers[couple.memberCode] ? (
              <div className="flex items-center gap-3">
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase">Paid</span>
                <button onClick={() => generatePDF(couple, paidMembers[couple.memberCode])} className="text-[#003B75]"><Download size={20}/></button>
              </div>
            ) : canManageFinance(member) ? (
              <button
                onClick={() => {
                  setSelectedCouple(couple);
                  setMembershipType("Regular");
                  setAmount(regularFee);
                  setShowDialog(true);
                }}
                className="bg-[#003B75] text-white px-4 py-1.5 rounded-lg text-sm font-bold"
              >
                Receive
              </button>
            ) : (
              <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                View Only
              </span>
            )}
          </div>
        ))}
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-[#003B75] mb-4">
              Receive Membership Fee
            </h2>

            <p className="text-sm mb-4 font-semibold">
              {selectedCouple?.name} & {selectedCouple?.spouseName}
            </p>

            <label className="text-sm font-semibold">
              Membership Type
            </label>

            <select
              value={membershipType}
              onChange={(e) => {
                const type = e.target.value as "Regular" | "New";
                setMembershipType(type);
                if (type === "Regular") {
                  setAmount(regularFee);
                } else {
                  setAmount(regularFee + admissionFee);
                }
              }}
              className="w-full border rounded-lg p-2 mb-3"
            >
              <option value="Regular">Regular Couple</option>
              <option value="New">New Couple</option>
            </select>

            <label className="text-sm font-semibold">
              Amount
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full border rounded-lg p-2 mb-3"
            />

            <label className="text-sm font-semibold">
              Payment Mode
            </label>
             
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full border rounded-lg p-2 mb-3"
            >
              <option>Cash</option>
              <option>UPI</option>
              <option>Cheque</option>
              <option>NEFT / RTGS</option>
            </select>

            {paymentMode === "Cash" && (
              <>
                <label className="text-sm font-semibold">Received Date</label>
                <input
                  type="date"
                  value={cashDate}
                  onChange={(e) => setCashDate(e.target.value)}
                  className="w-full border rounded-lg p-2 mb-3"
                />
              </>
            )}

            {paymentMode === "UPI" && (
              <>
                <label className="text-sm font-semibold">UPI Transaction Date</label>
                <input
                  type="date"
                  value={upiDate}
                  onChange={(e) => setUpiDate(e.target.value)}
                  className="w-full border rounded-lg p-2 mb-3"
                />
              </>
            )}

            {paymentMode === "Cheque" && (
              <>
                <label className="text-sm font-semibold">Cheque Date</label>
                <input
                  type="date"
                  value={chequeDate}
                  onChange={(e) => setChequeDate(e.target.value)}
                  className="w-full border rounded-lg p-2 mb-3"
                />
              </>
            )}

            {paymentMode === "NEFT / RTGS" && (
              <>
                <label className="text-sm font-semibold">Bank Transaction Date</label>
                <input
                  type="date"
                  value={bankDate}
                  onChange={(e) => setBankDate(e.target.value)}
                  className="w-full border rounded-lg p-2 mb-3"
                />
              </>
            )}

            {paymentMode !== "Cash" && (
              <>
                <label className="text-sm font-semibold">
                  {paymentMode === "UPI"
                    ? "UPI Transaction ID"
                    : paymentMode === "Cheque"
                    ? "Cheque Number"
                    : "UTR / Reference Number"}
                </label>

                <input
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full border rounded-lg p-2 mb-3"
                  placeholder={
                    paymentMode === "UPI"
                      ? "Enter UPI Transaction ID"
                      : paymentMode === "Cheque"
                      ? "Enter Cheque Number"
                      : "Enter UTR / Reference Number"
                  }
                />
              </>
            )}

            {paymentMode === "Cheque" && (
              <>
                <label className="text-sm font-semibold">Bank Name</label>
                <input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full border rounded-lg p-2 mb-3"
                  placeholder="Enter Bank Name"
                />
              </>
            )}

            <label className="text-sm font-semibold">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full border rounded-lg p-2 mb-4"
              placeholder="Optional remarks..."
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowDialog(false)}
                className="flex-1 border rounded-lg py-2"
              >
                Cancel
              </button>

              <button
                onClick={saveFee}
                className="flex-1 rounded-lg bg-[#003B75] text-white py-2 font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}