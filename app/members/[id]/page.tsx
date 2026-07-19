"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "@/src/firebase/config";
import { Shield, User, Briefcase, Heart, Phone, MessageCircle, Mail, MapPin, ArrowLeft,  LucideIcon, Calendar } from "lucide-react";

const formatWithoutYear = (dateString: string) => {
  if (!dateString || dateString === "-") return "-";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const parts = dateString.split(".");
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    if (!isNaN(day) && month >= 1 && month <= 12) return `${day} ${months[month - 1]}`;
  }
  return dateString;
};

export default function MemberProfilePage() {
  const router = useRouter();
  const params = useParams();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem("member");
    if (!session) { router.push("/"); return; }
    loadMember();
  }, []);

  const loadMember = async () => {
    try {
      const targetId = params.id as string;
      const memberRef = doc(db, "members", targetId);
      const memberSnap = await getDoc(memberRef);
      if (memberSnap.exists()) { setMember({ id: memberSnap.id, ...memberSnap.data() }); return; }
      const q = query(collection(db, "members"), where("memberCode", "==", targetId), limit(1));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) setMember({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (loading) return <main className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><div className="h-10 w-10 animate-spin rounded-full border-4 border-[#003B75] border-t-transparent" /></main>;
  if (!member) return <main className="min-h-screen flex items-center justify-center p-4">Member not found</main>;

  return (
    <main className="min-h-screen bg-[#F5F7FA] pb-10 max-w-md mx-auto">
      <header className="sticky top-0 z-50 bg-[#003B75] border-b-4 border-[#F2A900] shadow-md px-4 py-2 flex items-center justify-between">
  {/* बॅक बटण */}
  <button onClick={() => router.back()} className="text-white p-1">
    <ArrowLeft size={20} />
  </button>

  {/* नाव आणि क्लब माहिती */}
  <div className="text-center">
    <h1 className="text-white text-[11px] font-black tracking-[0.2em]">
      LIONS CONNECT
    </h1>
    <p className="text-[9px] text-[#F2A900] font-bold">
      Lions Club of Sinnar City
    </p>
  </div>

  {/* लोगो */}
  <div className="w-[30px]">
    <Image src="/logo.png" alt="logo" width={30} height={30} />
  </div>
</header>

      {/* Hero Card */}
      {/* Hero Card */}

<section className="px-4 pt-3">
  <div className="relative rounded-3xl border border-[#F2A900]/30 bg-gradient-to-br from-[#002B5B] via-[#003B75] to-[#0067C5] px-5 pt-3 pb-3 text-center text-white shadow-xl overflow-hidden">

    {/* Member Code */}
    <div className="absolute top-3 right-3 rounded-full bg-[#F2A900] px-3 py-1 text-[10px] font-black text-[#003B75] shadow">
      {member.memberCode}
    </div>

    {/* Photo */}
    <div className="mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-[#F2A900] bg-white shadow-2xl ring-4 ring-white/10">
      {member.photoUrl ? (
        <Image
          src={member.photoUrl}
          alt={member.name}
          width={128}
          height={128}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-5xl font-black text-[#003B75]">
          {member.name?.charAt(0)}
        </div>
      )}
    </div>

    {/* Name */}
    <h2 className="mt-2 text-xl font-extrabold leading-tight">
      {member.name}
    </h2>

    {/* Role */}
    <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#F2A900]">
      {member.currentLionsRole || "Member"}
    </p>

    {/* Joined */}
    <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-white/70">
      <Calendar size={11} />
      Joined {member.yearJoinedLions || "-"}
    </div>

  </div>
</section>

    {/* Quick Actions */}

<section className="px-4 mt-3">
  <div className="grid grid-cols-4 gap-2">

    <ActionButton
      icon={Phone}
      label="Call"
      action={`tel:${member.mobile}`}
    />

    <ActionButton
      icon={MessageCircle}
      label="WhatsApp"
      action={`https://wa.me/91${member.mobile?.replace(/\D/g, "")}`}
    />

    <ActionButton
      icon={Mail}
      label="Email"
      action={`mailto:${member.email}`}
    />

    <ActionButton
      icon={MapPin}
      label="Map"
      action={`https://maps.google.com/?q=${encodeURIComponent(member.address || "")}`}
    />

  </div>
</section>

      {/* Content */}
      <div className="mt-4 space-y-2.5 px-4">
        <SectionCard title="Professional Info" icon={<Briefcase size={14} />}>
         <InfoRow
  label="Profession"
  value={member.profession}
/>

<InfoRow
  label="Designation"
  value={member.jobTitle}
/>

<InfoRow
  label="Company"
  value={member.companyName}
/>
        </SectionCard>

        <SectionCard title="Personal Details" icon={<User size={14} />}>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <InfoRow label="Mobile" value={member.mobile} />
            <InfoRow label="Email" value={member.email} />
          </div>
          <InfoRow label="Address" value={member.address} multiline />
          <InfoRow label="Birthday" value={formatWithoutYear(member.dob)} />
        </SectionCard>

        <SectionCard title="Family" icon={<Heart size={14} />}>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
             <InfoRow label="Spouse" value={member.spouseName} />
             <InfoRow label="Anniversary" value={formatWithoutYear(member.anniversary)} />
          </div>
          <InfoRow label="Children" value={member.childrenNames} multiline />
          <InfoRow label="Awards" value={member.awardsAchievements} multiline />
        </SectionCard>
        <SectionCard
  title="Lions Profile"
  icon={<Shield size={14} />}
>
  <InfoRow
    label="Past Positions Held"
    value={member.pastPositions}
    multiline
  />

  <InfoRow
    label="Awards"
    value={member.awardsAchievements}
    multiline
  />
</SectionCard>
      </div>
    </main>
  );
}



function ActionButton({
  icon: Icon,
  label,
  action,
}: {
  icon: LucideIcon;
  label: string;
  action: string;
}) {
  return (
    <a
      href={action}
      target="_blank"
      rel="noopener noreferrer"
      className="
        rounded-2xl
        bg-white
        py-3
        shadow-md
        border
        border-gray-100
        flex
        flex-col
        items-center
        justify-center
        gap-1
        transition-all
        hover:shadow-lg
        active:scale-95
      "
    >
      <div className="rounded-full bg-[#003B75]/10 p-2">
        <Icon size={18} className="text-[#003B75]" />
      </div>

      <span className="text-[9px] font-bold text-gray-700">
        {label}
      </span>
    </a>
  );
}

function SectionCard({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white border border-[#003B75]/10 shadow-md overflow-hidden">
      <div className="flex items-center gap-2 bg-gray-50/50 px-4 py-3 border-b border-gray-100">
        <div className="text-[#003B75]">{icon}</div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#003B75]">{title}</h3>
      </div>
      <div className="divide-y divide-[#003B75]/10">{children}</div>
    </section>
  );
}

function InfoRow({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string;
  multiline?: boolean;
}) {
  return (
    <div className="px-4 py-2.5">
      {/* Label */}
      <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#003B75]">
        {label}
      </p>

      {/* Value */}
      <p
        className={`text-[14px] font-semibold text-slate-900 ${
          multiline
            ? "whitespace-pre-wrap break-words"
            : "truncate"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}