"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/src/firebase/config";
import Link from "next/link";
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

  referenceNo?: string;

  remarks?: string;

  receiptNo: string;
}

export default function MembershipFeesPage() {
  const [couples, setCouples] = useState<Member[]>([]);
  const [paidMembers, setPaidMembers] = useState<Record<string, FeeData>>({});
  const [filter, setFilter] = useState<"All" | "Paid" | "Pending">("All");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCouple, setSelectedCouple] = useState<Member | null>(null);
  const [amount, setAmount] = useState(12000);
  const [regularFee, setRegularFee] = useState(12000);
const [admissionFee, setAdmissionFee] = useState(3000);
  const [paymentMode, setPaymentMode] = useState("Cash");
const [paymentDate, setPaymentDate] = useState(
  new Date().toISOString().split("T")[0]
);
const [treasurerName, setTreasurerName] = useState("");
const [secretaryName, setSecretaryName] = useState("");

const [referenceNo, setReferenceNo] = useState("");

const [remarks, setRemarks] = useState("");

const [membershipType, setMembershipType] = useState<
  "Regular" | "New"
>("Regular");

  useEffect(() => { loadData(); }, []);

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

for (const member of allDocs) {
  if (!member.spouseMemberId) continue;

  if (processed.has(member.memberCode)) continue;

  uniqueCouples.push(member);

  processed.add(member.memberCode);
  processed.add(member.spouseMemberId);
}

uniqueCouples.sort((a, b) => a.name.localeCompare(b.name));

setCouples(uniqueCouples);

    const fSnap = await getDocs(query(collection(db, "membershipFees"), where("lionYear", "==", "2026-2027")));
    const status: Record<string, FeeData> = {};
    fSnap.docs.forEach((doc) => {
      const data = doc.data() as FeeData;
      status[data.primaryMemberCode] = data;
    });
    setPaidMembers(status);
  }

  // डॅशबोर्ड लॉजिक - आता हे डेटाबेसमधून डायनॅमिकली येईल
  const totalCouples = couples.length;
  const paidCount = Object.keys(paidMembers).length;
  const pendingCount = totalCouples - paidCount;

 const generatePDF = (couple: Member, data: FeeData) => {
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // =====================================
  // COLORS
  // =====================================

  const BLUE = [0, 59, 117];
  const GOLD = [242, 169, 0];
  const LIGHT = [245, 248, 252];

  // =====================================
  // HEADER
  // =====================================

  doc.setFillColor(
    BLUE[0],
    BLUE[1],
    BLUE[2]
  );

  doc.rect(
    0,
    0,
    pageWidth,
    26,
    "F"
  );

  // GOLD LINE

  doc.setFillColor(
    GOLD[0],
    GOLD[1],
    GOLD[2]
  );

  doc.rect(
    0,
    26,
    pageWidth,
    2,
    "F"
  );

  // CLUB NAME

  doc.setTextColor(255);

  doc.setFont("helvetica", "bold");

  doc.setFontSize(19);

  doc.text(
    "LIONS CLUB OF SINNAR CITY",
    pageWidth / 2,
    11,
    {
      align: "center",
    }
  );

  doc.setFontSize(10);

  doc.setFont("helvetica", "normal");

  doc.text(
    "Membership Fee Receipt",
    pageWidth / 2,
    18,
    {
      align: "center",
    }
  );

  doc.setFontSize(8);

  doc.text(
    "LionsConnect Finance Department",
    pageWidth / 2,
    23,
    {
      align: "center",
    }
  );

  // =====================================
  // RECEIPT INFO BOX
  // =====================================

  doc.setFillColor(
    LIGHT[0],
    LIGHT[1],
    LIGHT[2]
  );

  doc.roundedRect(
    12,
    34,
    186,
    40,
    3,
    3,
    "F"
  );

  doc.setDrawColor(
    BLUE[0],
    BLUE[1],
    BLUE[2]
  );

  doc.roundedRect(
    12,
    34,
    186,
    40,
    3,
    3
  );

  doc.setTextColor(0);

  doc.setFontSize(10);

  // LEFT

  doc.setFont("helvetica", "bold");

  doc.text(
    "Receipt No.",
    18,
    44
  );

  doc.setFont("helvetica", "normal");

  doc.text(
    data.receiptNo,
    48,
    44
  );

  doc.setFont("helvetica", "bold");

  doc.text(
    "Received From",
    18,
    54
  );

  doc.setFont("helvetica", "normal");

  doc.text(
    data.memberName,
    48,
    54
  );

  doc.setFont("helvetica", "bold");

  doc.text(
    "Member Code",
    18,
    64
  );

  doc.setFont("helvetica", "normal");

  doc.text(
    couple.memberCode,
    48,
    64
  );

  // RIGHT

  doc.setFont("helvetica", "bold");

  doc.text(
    "Date",
    118,
    44
  );

  doc.setFont("helvetica", "normal");

  doc.text(
    data.paymentDate,
    150,
    44
  );

  doc.setFont("helvetica", "bold");

  doc.text(
    "Lion Year",
    118,
    54
  );

  doc.setFont("helvetica", "normal");

  doc.text(
    data.lionYear,
    150,
    54
  );

  doc.setFont("helvetica", "bold");

  doc.text(
    "Membership",
    118,
    64
  );

  doc.setFont("helvetica", "normal");

  doc.text(
    data.membershipType,
    150,
    64
  );

   // =====================================
  // MEMBERSHIP FEE TABLE
  // =====================================

  autoTable(doc, {
    startY: 84,

    margin: {
      left: 12,
      right: 12,
    },

    theme: "grid",

    head: [["#", "Particular", "Amount"]],

    headStyles: {
      fillColor: [0, 59, 117],
      textColor: 255,
      halign: "center",
      fontStyle: "bold",
    },

    body: [
      [
        "1",
        `${data.membershipType} Membership Fee`,
        "Rs" + data.totalAmount.toLocaleString(),
      ],

      [
        "",
        "TOTAL RECEIVED",
        "Rs " + data.totalAmount.toLocaleString(),
      ],
    ],

    bodyStyles: {
      fontSize: 10,
    },

    columnStyles: {
      0: {
        halign: "center",
        cellWidth: 15,
      },

      2: {
        halign: "right",
        cellWidth: 45,
      },
    },
  });

  const tableEnd =
    (doc as any).lastAutoTable.finalY;

  // =====================================
  // GREEN TOTAL BOX
  // =====================================

  doc.setFillColor(228, 248, 228);

  doc.roundedRect(
    125,
    tableEnd + 8,
    65,
    20,
    3,
    3,
    "F"
  );

  doc.setDrawColor(0, 120, 0);

  doc.roundedRect(
    125,
    tableEnd + 8,
    65,
    20,
    3,
    3
  );

  doc.setFont("helvetica", "bold");

  doc.setFontSize(10);

  doc.text(
    "TOTAL PAID",
    157,
    tableEnd + 15,
    {
      align: "center",
    }
  );

  doc.setFontSize(14);

  doc.text(
    "Rs" + data.totalAmount.toLocaleString(),
    157,
    tableEnd + 22,
    {
      align: "right",
    }
  );

  // =====================================
  // PAYMENT DETAILS
  // =====================================

  const infoY = tableEnd + 40;

  doc.setFontSize(10);

  doc.setFont("helvetica", "bold");

  doc.text(
    "Payment Mode",
    18,
    infoY
  );

  doc.setFont("helvetica", "normal");

  doc.text(
    data.paymentMode,
    55,
    infoY
  );

  doc.setFont("helvetica", "bold");

  doc.text(
    "Reference No",
    18,
    infoY + 9
  );

  doc.setFont("helvetica", "normal");

  doc.text(
    data.referenceNo || "-",
    55,
    infoY + 9
  );

  doc.setFont("helvetica", "bold");

  doc.text(
    "Remarks",
    18,
    infoY + 18
  );

  doc.setFont("helvetica", "normal");

  doc.text(
    data.remarks || "-",
    55,
    infoY + 18
  );

  // =====================================
  // AMOUNT IN WORDS
  // =====================================

  doc.setFillColor(250, 250, 235);

  doc.roundedRect(
    12,
    infoY + 28,
    186,
    18,
    2,
    2,
    "F"
  );

  doc.setFont("helvetica", "bold");

  doc.text(
    "Amount Received :",
    18,
    infoY + 38
  );

  doc.setFont("helvetica", "normal");

  doc.text(
    "Rupees " +
      data.totalAmount.toLocaleString() +
      " Only",
    58,
    infoY + 38
  );
  // =====================================
  // SIGNATURE AREA
  // =====================================

  const signY = 245;

  doc.setDrawColor(120);

  // Treasurer
  doc.line(25, signY, 80, signY);

  // Secretary
  doc.line(130, signY, 185, signY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.setFont("courier", "italic");
doc.setFontSize(13);
doc.setTextColor(0, 59, 117);
doc.text(
  treasurerName,
  52,
  signY - 3,
  {
    align: "center",
  }
);

doc.text(
  secretaryName,
  157,
  signY - 3,
  {
    align: "center",
  }
);

doc.setFont("helvetica", "bold");
doc.setFontSize(10);
doc.setTextColor(0, 59, 117);
doc.text(
  "Treasurer",
  52,
  signY + 8,
  {
    align: "center",
  }
);

doc.text(
  "Secretary",
  157,
  signY + 8,
  {
    align: "center",
  }
);
doc.setTextColor(0, 0, 0);
  // =====================================
  // RECEIPT GENERATED
  // =====================================

  doc.setFontSize(8);

  doc.setFont("helvetica", "normal");

  doc.setTextColor(90);

  doc.text(
    `Generated : ${new Date().toLocaleString("en-GB")}`,
    15,
    270
  );

  // =====================================
  // QR PLACEHOLDER
  // =====================================

  

  // =====================================
  // FOOTER
  // =====================================

  doc.setFillColor(
    0,
    59,
    117
  );

  doc.rect(
    0,
    285,
    pageWidth,
    12,
    "F"
  );

  doc.setTextColor(255);

  doc.setFontSize(8);

  doc.text(
    "Computer Generated Receipt • LionsConnect Finance Module",
    pageWidth / 2,
    292,
    {
      align: "center",
    }
  );

  // =====================================
  // SAVE PDF
  // =====================================

  doc.save(
    `Receipt_${data.receiptNo}.pdf`
  );
};
  const saveFee = async () => {
    if (!selectedCouple) return;

    // १. त्या वर्षाच्या पावत्यांची संख्या मोजून पुढचा नंबर ठरवणे
    const currentYear = "2026";

const receiptSnap = await getDocs(
  query(
    collection(db, "membershipFees"),
    where("lionYear", "==", "2026-2027"),
    orderBy("receiptNo", "desc"),
    limit(1)
  )
);

let nextNumber = 1;

if (!receiptSnap.empty) {
  const lastReceipt =
    receiptSnap.docs[0].data().receiptNo as string;

  const lastNo =
    Number(lastReceipt.split("-")[1]);

  nextNumber = lastNo + 1;
}

const receiptNo =
  `R${currentYear}-${String(nextNumber).padStart(3, "0")}`;

    const feeData = {
  primaryMemberCode: selectedCouple.memberCode,
  spouseMemberCode: selectedCouple.spouseMemberId,

  memberName: `${selectedCouple.name} & ${
    selectedCouple.spouseName ?? ""
  }`,

  lionYear: "2026-2027",

  membershipType,

  totalAmount: amount,

  paymentDate,

  paymentMode,

  referenceNo,

  remarks,

  receiptNo,

  createdAt: new Date(),
};

    await addDoc(collection(db, "membershipFees"), feeData);
    await loadData();
    setShowDialog(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <Link href="/admin/finance" className="flex items-center text-[#003B75] mb-4 font-bold"><ChevronLeft size={18}/> Back</Link>

      {/* डॅशबोर्ड */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <div className="bg-blue-100 p-3 rounded-xl text-center border"><div className="text-[10px] uppercase font-bold">Total</div><div className="text-xl font-black">{totalCouples}</div></div>
        <div className="bg-green-100 p-3 rounded-xl text-center border"><div className="text-[10px] uppercase font-bold">Paid</div><div className="text-xl font-black">{paidCount}</div></div>
        <div className="bg-red-100 p-3 rounded-xl text-center border"><div className="text-[10px] uppercase font-bold">Pending</div><div className="text-xl font-black">{pendingCount}</div></div>
      </div>

      <div className="flex gap-2 mb-6">
        {(["All", "Paid", "Pending"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-bold ${filter === f ? "bg-[#003B75] text-white" : "bg-white border"}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-3">
        {couples.filter(m => filter === "All" ? true : filter === "Paid" ? !!paidMembers[m.memberCode] : !paidMembers[m.memberCode]).map((couple) => (
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
            ) : (
              <button onClick={() => {
  setSelectedCouple(couple);
  setMembershipType("Regular");setAmount(regularFee);setShowDialog(true);}} className="bg-[#003B75] text-white px-4 py-1.5 rounded-lg text-sm font-bold">Receive</button>
            )}
          </div>
        ))}
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
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
  <option value="Regular">
    Regular Couple
  </option>

  <option value="New">
    New Couple
  </option>
</select>

<label className="text-sm font-semibold">
Amount
</label>

<input
  type="number"
  value={amount}
  onChange={(e) =>
    setAmount(Number(e.target.value))
  }
  className="w-full border rounded-lg p-2 mb-3"
/>

<label className="text-sm font-semibold">
Payment Date
</label>

<input
  type="date"
  value={paymentDate}
  onChange={(e) =>
    setPaymentDate(e.target.value)
  }
  className="w-full border rounded-lg p-2 mb-3"
/>

<label className="text-sm font-semibold">
Payment Mode
</label>

<select
  value={paymentMode}
  onChange={(e) =>
    setPaymentMode(e.target.value)
  }
  className="w-full border rounded-lg p-2 mb-3"
>
  <option>Cash</option>
  <option>UPI</option>
  <option>Cheque</option>
  <option>NEFT / RTGS</option>
</select>

<label className="text-sm font-semibold">
Reference No.
</label>

<input
  value={referenceNo}
  onChange={(e) =>
    setReferenceNo(e.target.value)
  }
  className="w-full border rounded-lg p-2 mb-3"
  placeholder="Txn / Cheque No."
/>

<label className="text-sm font-semibold">
Remarks
</label>

<textarea
  value={remarks}
  onChange={(e) =>
    setRemarks(e.target.value)
  }
  rows={3}
  className="w-full border rounded-lg p-2 mb-4"
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