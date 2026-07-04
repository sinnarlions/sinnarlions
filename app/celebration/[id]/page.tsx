"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../src/firebase/config";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  deleteDoc,
  orderBy,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

export default function CelebrationPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [wish, setWish] = useState("");
  const [wishes, setWishes] = useState<any[]>([]);
  const [member, setMember] = useState<any>(null);

  const loadWishes = async () => {
    const q = query(
      collection(db, "wishes"),
      where("memberId", "==", id),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const data: any[] = [];

    for (const document of snapshot.docs) {
      const wishData = {
        id: document.id,
        ...document.data(),
      } as any;
      data.push(wishData);
    }
    setWishes(data);
  };

  const deleteWish = async (wishId: string) => {
    if (confirm("Are you sure you want to delete this wish?")) {
      await deleteDoc(doc(db, "wishes", wishId));
      await loadWishes();
    }
  };

  const toggleReaction = async (
    wishId: string,
    reactionType: "heartUsers" | "celebrateUsers" | "clapUsers",
    users: string[]
  ) => {
    const mobile = localStorage.getItem("memberMobile");
    if (!mobile) return;

    const wishRef = doc(db, "wishes", wishId);

    if (users?.includes(mobile)) {
      await updateDoc(wishRef, {
        [reactionType]: arrayRemove(mobile),
      });
    } else {
      await updateDoc(wishRef, {
        [reactionType]: arrayUnion(mobile),
      });
    }
    await loadWishes();
  };

  // व्हॉट्सॲपवर मेसेज फॉरवर्ड करण्याचे लॉजिक
  const shareToWhatsApp = (messageText: string) => {
    if (!member?.mobile) {
      alert("Member mobile number not available.");
      return;
    }

    // नंबर फॉरमॅट करणे (उदा. ९१ जोडणे जर नसेल तर)
    let formattedMobile = member.mobile.trim();
    if (!formattedMobile.startsWith("91") && formattedMobile.length === 10) {
      formattedMobile = "91" + formattedMobile;
    }

    const templateText = `प्रिय *${member.name}*,\n\n*Lions Connect* वरून तुम्हाला शुभेच्छा:\n_"${messageText}"_`;
    const encodedText = encodeURIComponent(templateText);
    
    // अधिकृत व्हॉट्सॲप एपीआय लिंक
    window.open(`https://wa.me/${formattedMobile}?text=${encodedText}`, "_blank");
  };

  useEffect(() => {
    const loadMember = async () => {
      const snapshot = await getDoc(doc(db, "members", id));
      if (snapshot.exists()) {
        setMember(snapshot.data());
      }
    };

    loadMember();
    loadWishes();
  }, [id]);

  if (!member) {
    return (
      <div className="min-h-screen bg-[#F7F2F0] flex items-center justify-center p-6">
        <div className="text-xl font-bold text-[#2F5D62] animate-pulse">Loading Celebration Details...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F2F0] p-3 sm:p-6 md:p-10 text-slate-800">
      {/* --- BACK BUTTON BUTTON --- */}
      <div className="max-w-4xl mx-auto mb-3">
        <button
          onClick={() => router.push("/")}
          className="text-[#2F5D62] font-bold hover:opacity-80 transition-colors flex items-center gap-1 text-sm cursor-pointer"
        >
          ← Back to Home
        </button>
      </div>

      <div className="mx-auto max-w-4xl rounded-2xl sm:rounded-[32px] bg-white p-4 sm:p-8 md:p-10 shadow-xl border border-slate-100">
        
        {/* --- HERO AREA --- */}
        <div className="text-4xl sm:text-6xl animate-bounce inline-block">🎉</div>
        <h1 className="mt-2 text-2xl sm:text-4xl font-black text-[#2F5D62] tracking-tight leading-tight break-words">
          {member.name}
        </h1>
        <p className="mt-1 text-sm sm:text-lg text-black/50 font-medium">
          🦁 Celebration Page
        </p>

        {/* --- LEAVE A WISH BOX --- */}
        <div className="mt-6 sm:mt-8 border-t border-slate-100 pt-5">
          <h2 className="mb-3 text-lg sm:text-2xl font-bold text-[#2F5D62]">
            Leave a Wish 💝
          </h2>

          <textarea
            rows={4}
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            placeholder="Write your beautiful wishes here..."
            className="w-full resize-none rounded-xl border border-slate-300 bg-[#F7F2F0] p-3.5 text-slate-800 placeholder-slate-400 text-sm sm:text-base leading-relaxed outline-none transition focus:border-[#2F5D62] focus:ring-2 focus:ring-[#2F5D62]/10 break-words font-medium"
          />

          {/* रिस्पॉन्सिव्ह बटण लेआउट */}
          <div className="mt-3 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={async () => {
                if (!wish.trim()) return;

                const currentMemberMobile = localStorage.getItem("memberMobile");
                const alreadyWishedQuery = query(
                  collection(db, "wishes"),
                  where("memberId", "==", id),
                  where("ownerMobile", "==", currentMemberMobile)
                );

                const alreadyWishedSnapshot = await getDocs(alreadyWishedQuery);

                if (!alreadyWishedSnapshot.empty) {
                  alert("You have already submitted a wish.");
                  return;
                }

                await addDoc(collection(db, "wishes"), {
                  memberId: id,
                  memberName: member.name,
                  wishBy: localStorage.getItem("memberName") || "Anonymous",
                  ownerMobile: localStorage.getItem("memberMobile") || "",
                  message: wish,
                  heartUsers: [],
                  celebrateUsers: [],
                  clapUsers: [],
                  createdAt: serverTimestamp(),
                  expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
                });

                await loadWishes();
                setWish("");
                alert("Wish Posted 🎉");
              }}
              className="w-full sm:w-auto cursor-pointer rounded-xl bg-[#2F5D62] px-6 py-3 text-sm sm:text-base font-bold text-white transition hover:opacity-90 active:scale-[0.98] shadow-sm text-center"
            >
              Post Wish
            </button>
            <button
              onClick={() => router.push(`/greeting/${id}`)}
              className="w-full sm:w-auto cursor-pointer rounded-xl bg-[#D9A441] px-6 py-3 text-sm sm:text-base font-bold text-white transition hover:opacity-90 active:scale-[0.98] shadow-sm text-center"
            >
              Send Greeting Card 🎉
            </button>
          </div>
        </div>

        {/* --- WISHES WALL --- */}
        <div className="mt-8 sm:mt-10 border-t border-slate-100 pt-6">
          <h2 className="mb-4 text-xl sm:text-2xl font-bold text-[#2F5D62]">
            Wishes Wall 🎉 ({wishes.length})
          </h2>

          {wishes.length === 0 ? (
            <div className="rounded-xl bg-[#F7F2F0] p-5 text-center text-slate-500 font-medium text-sm">
              No Wishes Yet. Be the first to wish!
            </div>
          ) : (
            <div className="space-y-4">
              {wishes.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl sm:rounded-2xl bg-[#F7F2F0] p-4 sm:p-5 shadow-xs border border-slate-200/60 relative"
                >
                  {/* शुभेच्छा संदेश */}
                  <p className="whitespace-pre-wrap break-words text-sm sm:text-base text-[#1F1F1F] font-medium leading-relaxed">
                    {item.message}
                  </p>

                  {/* सोशल रिॲक्शन बार */}
                  <div className="mt-4 flex flex-wrap gap-4 text-xs sm:text-sm font-bold text-slate-600 bg-white/50 inline-flex px-3 py-1.5 rounded-full border border-slate-200/40">
                    <button
                      onClick={() => toggleReaction(item.id, "heartUsers", item.heartUsers || [])}
                      className="cursor-pointer hover:scale-110 transition-transform flex items-center gap-1"
                    >
                      ❤️ {item.heartUsers?.length || 0}
                    </button>

                    <button
                      onClick={() => toggleReaction(item.id, "celebrateUsers", item.celebrateUsers || [])}
                      className="cursor-pointer hover:scale-110 transition-transform flex items-center gap-1"
                    >
                      🎉 {item.celebrateUsers?.length || 0}
                    </button>

                    <button
                      onClick={() => toggleReaction(item.id, "clapUsers", item.clapUsers || [])}
                      className="cursor-pointer hover:scale-110 transition-transform flex items-center gap-1"
                    >
                      👏 {item.clapUsers?.length || 0}
                    </button>
                  </div>

                  {/* कार्डचा खालचा भाग (लेखक, वेळ आणि ॲक्शन बटन्स) */}
                  <div className="mt-4 pt-3 border-t border-slate-200/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-xs sm:text-sm font-bold text-slate-700">
                        — {item.wishBy}
                      </p>
                      <p className="text-[10px] text-black/40 font-medium">
                        {item.createdAt?.toDate?.().toLocaleString() || "Just now"}
                      </p>
                    </div>

                    {/* व्हॉट्सॲप आणि डिलीट बटण स्पेस */}
                    <div className="flex items-center gap-2 mt-1 sm:mt-0">
                      {/* व्हाट्सएप बटण: फक्त ज्याने मेसेज लिहिला आहे त्यालाच दिसेल */}
                      {item.ownerMobile === localStorage.getItem("memberMobile") && (
                        <>
                          <button
                            onClick={() => shareToWhatsApp(item.message)}
                            className="cursor-pointer rounded-lg bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <span>🟢</span> Share on WhatsApp
                          </button>
                          
                          <button
                            onClick={() => deleteWish(item.id)}
                            className="cursor-pointer rounded-lg bg-red-50 hover:bg-red-100 px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}