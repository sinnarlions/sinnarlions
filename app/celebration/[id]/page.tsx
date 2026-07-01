"use client";

import { useEffect, useState } from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";

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
const [wish, setWish] =
  useState("");
 
  const [wishes, setWishes] =
  useState<any[]>([]);
  const [member, setMember] =
    useState<any>(null);
const loadWishes = async () => {

  const q = query(
    collection(db, "wishes"),
    where("memberId", "==", id),
    orderBy("createdAt", "desc")
  );

  const snapshot =
    await getDocs(q);

  const data: any[] = [];

for (const document of snapshot.docs) {

  const wish = {
    id: document.id,
    ...document.data(),
  } as any;

  

  data.push(wish);
}

setWishes(data);

};
const deleteWish = async (
  wishId: string
) => {

  await deleteDoc(
    doc(db, "wishes", wishId)
  );

  await loadWishes();
};


const toggleReaction = async (
  wishId: string,
  reactionType:
    | "heartUsers"
    | "celebrateUsers"
    | "clapUsers",
  users: string[]
) => {

  const mobile =
    localStorage.getItem(
      "memberMobile"
    );

  if (!mobile) return;

  const wishRef = doc(
    db,
    "wishes",
    wishId
  );

  if (users?.includes(mobile)) {

    await updateDoc(
      wishRef,
      {
        [reactionType]:
          arrayRemove(mobile),
      }
    );

  } else {

    await updateDoc(
      wishRef,
      {
        [reactionType]:
          arrayUnion(mobile),
      }
    );

  }

  await loadWishes();
};
  useEffect(() => {
    const loadMember = async () => {
      const snapshot =
        await getDoc(
          doc(db, "members", id)
        );

      if (snapshot.exists()) {
        setMember(snapshot.data());
      }
    };

    loadMember();
    loadWishes();
   
  }, [id]);

  if (!member) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F2F0] p-10">
      <div className="mx-auto max-w-4xl rounded-[32px] bg-white p-10 shadow-xl">

        <div className="text-6xl">
          🎉
        </div>

        <h1 className="mt-4 text-4xl font-bold text-[#2F5D62]">
          {member.name}
        </h1>

        <p className="mt-3 text-lg text-black/60">
          Celebration Page
        </p>
<div className="mt-8">

  <h2 className="mb-4 text-2xl font-bold text-[#2F5D62]">
    Leave a Wish 💝
  </h2>

  <textarea
    value={wish}
    onChange={(e) =>
      setWish(e.target.value)
    }
    placeholder="Write your wishes here..."
    className="w-full rounded-2xl border border-black/10 bg-[#F7F2F0] p-4 outline-none"
  />

  


 <button
  onClick={async () => {

    if (!wish.trim()) return;
    
const currentMemberMobile =
localStorage.getItem(
"memberMobile"
);

const alreadyWishedQuery = query(
collection(db, "wishes"),
where("memberId", "==", id),
where(
"ownerMobile",
"==",
currentMemberMobile
)
);

const alreadyWishedSnapshot =
await getDocs(
alreadyWishedQuery
);

if (
!alreadyWishedSnapshot.empty
) {
alert(
"You have already submitted a wish."
);
return;
}


    await addDoc(
      collection(db, "wishes"),
      {
        memberId: id,

        memberName:
          member.name,

        wishBy:
          localStorage.getItem(
            "memberName"
          ),
ownerMobile:
  localStorage.getItem(
    "memberMobile"
  ),
        message: wish,
         heartUsers: [],
  celebrateUsers: [],
  clapUsers: [],

        createdAt:
          serverTimestamp(),
          expiresAt: new Date(
  Date.now() + 8 * 24 * 60 * 60 * 1000
),
      }
    );
    
  
   
await loadWishes();
    setWish("");

    alert(
      "Wish Posted 🎉"
    );
  }}
  className="mt-4 cursor-pointer rounded-2xl bg-[#78B8B5] px-6 py-3 font-semibold text-white transition hover:opacity-90"
>
  Post Wish
</button>
<button
  onClick={() =>
    router.push(
      `/greeting/${id}`
    )
  }
  className="mt-4 ml-3 cursor-pointer rounded-2xl bg-[#D9A441] px-6 py-3 font-semibold text-white"
>
  Send Greeting Card 🎉
</button>
</div>
<div className="mt-10">

  <h2 className="mb-5 text-2xl font-bold text-[#2F5D62]">
  Wishes Wall 🎉 ({wishes.length})
</h2>

  {wishes.length === 0 ? (

    <div className="rounded-2xl bg-[#F7F2F0] p-5">
      No Wishes Yet
    </div>

  ) : (

    <div className="space-y-4">

      {wishes.map((item) => (

        <div
          key={item.id}
          className="rounded-2xl bg-[#F7F2F0] p-5 shadow"
        >

          <p className="text-lg text-[#1F1F1F]">
            {item.message}
          </p>
<div className="mt-3 flex gap-5 text-sm font-semibold">

  <button
  onClick={() =>
    toggleReaction(
      item.id,
      "heartUsers",
      item.heartUsers || []
    )
  }
  className="cursor-pointer"
>
  ❤️ {item.heartUsers?.length || 0}
</button>

  <button
  onClick={() =>
    toggleReaction(
      item.id,
      "celebrateUsers",
      item.celebrateUsers || []
    )
  }
  className="cursor-pointer"
>
  🎉 {item.celebrateUsers?.length || 0}
</button>

  <button
  onClick={() =>
    toggleReaction(
      item.id,
      "clapUsers",
      item.clapUsers || []
    )
  }
  className="cursor-pointer"
>
  👏 {item.clapUsers?.length || 0}
</button>

</div>
         <div className="mt-3 flex items-center justify-between">

  <p className="text-sm text-black/50">
    — {item.wishBy}
  </p>
<p className="mt-1 text-xs text-black/40">
  {item.createdAt?.toDate?.().toLocaleString()}
</p>
  {item.ownerMobile ===
    localStorage.getItem(
      "memberMobile"
    ) && (

    <button
      onClick={() =>
        deleteWish(item.id)
      }
      className="cursor-pointer rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-600 hover:bg-red-200"
    >
      Delete
    </button>

  )}

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