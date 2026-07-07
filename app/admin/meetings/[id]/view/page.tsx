"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config"; // तुमचा फायरबेस पाथ तपासा


export default function ViewMeetingPage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<any>(null);
  const [agenda, setAgenda] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const mSnap = await getDoc(doc(db, "meetings", id as string));
      const aSnap = await getDoc(doc(db, "meetingAgendas", id as string));
      if (mSnap.exists()) setMeeting(mSnap.data());
      if (aSnap.exists()) setAgenda(aSnap.data());
    };
    fetchData();
  }, [id]);

  if (!meeting) return <div>Loading...</div>;

  return (
    <div className="p-10">
      
    </div>
  );
}