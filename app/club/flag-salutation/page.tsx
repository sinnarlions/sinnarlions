"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function FlagSalutationPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fffaf5] via-white to-[#f7fcf7] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#003B75] text-white border-b-4 border-[#F2A900] shadow-md">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">ध्वज वंदन</h1>
            <p className="text-xs text-white/80 mt-1">
              Lions Club of Sinnar City
            </p>
          </div>

          <button
            onClick={() => router.push("/club")}
            className="bg-[#00529B] border border-[#F2A900]/40 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-[#F2A900] hover:text-[#003B75] transition-all"
          >
            Club
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-md mx-auto px-4 py-6">
      <div
  className="rounded-3xl shadow-xl border border-gray-200 p-6"
  style={{
    background:
      "linear-gradient(180deg, rgba(255,153,51,0.08) 0%, rgba(255,255,255,1) 45%, rgba(19,136,8,0.08) 100%)",
  }}
>

          {/* Flag */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/india-flag.png"
              alt="Indian National Flag"
              width={200}
              height={133}
              priority
              className="rounded-md shadow-md"
            />
          </div>

          {/* Title */}
          <h2 className="text-center text-3xl font-extrabold text-[#0B3B75] mb-6 tracking-wide">
            ध्वज वंदन
          </h2>

          {/* Salutation */}
          <div className="space-y-6 text-[18px] leading-10 text-[#243447] text-justify">

            <p>
              आम्ही आमच्या राष्ट्रध्वजाला प्रणाम करतो आणि या ध्वजाशी
              एकनिष्ठ राहू अशीही आम्ही प्रतिज्ञा घेतो.
            </p>

            <p>
              आपल्यापैकी प्रत्येकाने जबाबदार नागरिकाची कर्तव्ये
              तळमळीने व दीर्घोद्योगपूर्वक पार पाडली पाहिजेत, कारण
              त्यावरच या ध्वजाचा सन्मान नि वैभव या गोष्टी अवलंबून आहेत.
            </p>

            <p>
              आमच्या या राष्ट्राचे कीर्तीमंदिर उभारण्यासाठी आमच्या
              हातून सतत सत्कृत्य घडण्याची आवश्यकता आहे. अर्थात
              सुवर्णाक्षरात लिहिलेल्या या ध्वजाचा तेजस्वी इतिहास
              हाच आमच्या या कार्याची प्रेरकशक्ती आहे.
            </p>

            <p>
              आम्ही आमच्या राष्ट्रध्वजावरील अढळ निष्ठा उद्घोषित करतो.
              अर्थात त्याचे भवितव्य म्हणजेच आमचे भवितव्य असे आम्ही
              मानतो.
            </p>

            <p>
              आमच्यापैकी प्रत्येक व्यक्ती या ध्वजाचे तेज आणि वैभव
              वाढविण्यासाठी मनःपूर्वक प्रयत्न करील आणि त्या
              प्रयत्नातूनच आम्ही आमच्या ध्वजाला राष्ट्रमंडळात
              उंच आणि मानाने फडकवू.
            </p>

          </div>

          {/* Footer */}
          <div className="mt-10 border-t pt-6 text-center">

            <p className="text-4xl font-black text-[#0B3B75] tracking-wide">
              जय हिंद!
            </p>

            <p className="mt-2 text-sm italic text-[#B45309]">
  We Salute Our National Flag
</p>

          </div>
        </div>
      </div>
    </main>
  );
}