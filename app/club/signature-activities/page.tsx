"use client";

import { useRouter } from "next/navigation";
import { Award, ArrowLeft } from "lucide-react";

export default function SignatureActivitiesPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-10">

      {/* Header */}

      <div className="sticky top-0 z-20 border-b-4 border-[#F2A900] bg-[#003B75] shadow-md">

        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">

          <div>
            <h1 className="text-xl font-bold text-white">
              Signature Activities
            </h1>

            <p className="text-[11px] text-white/80">
              Lions Club of Sinnar City
            </p>
          </div>

          <button
            onClick={() => router.push("/club")}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#003B75] shadow"
          >
            ← Back
          </button>

        </div>

      </div>

      <div className="mx-auto mt-5 max-w-md space-y-4 px-4">

        {/* Hero */}

        <section className="rounded-3xl bg-gradient-to-br from-[#003B75] via-[#004A93] to-[#0062C4] p-6 text-center text-white shadow-lg">

          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10">

            <Award
              size={40}
              className="text-[#F2A900]"
            />

          </div>

          <h2 className="mt-5 text-3xl font-extrabold">
            Signature Activities
          </h2>

          <p className="mt-2 text-sm text-white/90 leading-6">
            Flagship service initiatives that define the
            identity of Lions Club of Sinnar City.
          </p>

          <div className="mx-auto my-5 h-1 w-20 rounded-full bg-[#F2A900]" />

          <p className="text-base italic font-medium text-[#F2A900]">
            Service • Leadership • Community Impact
          </p>

        </section>
                {/* Adarsh Shikshak Puraskar */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-2">

            <span className="text-2xl">🏆</span>

            <h2 className="text-lg font-bold text-[#003B75]">
              Adarsh Shikshak Puraskar
            </h2>

          </div>

          <p className="leading-7 text-gray-700">
            Education is the foundation of a progressive society.
            To honour dedicated educators who shape future generations,
            Lions Club of Sinnar City proudly presents the
            <strong> Adarsh Shikshak Puraskar </strong>
            every year.
          </p>

          <p className="mt-4 leading-7 text-gray-700">
            This prestigious regional award recognizes teachers
            for their outstanding contribution to education,
            student development and community service.
          </p>

          <p className="mt-4 leading-7 text-gray-700">
            Teachers from different educational categories are
            carefully selected and honoured for their commitment,
            excellence and lifelong dedication to the teaching profession.
          </p>

        </section>

        {/* Ganeshotsav Competition */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-2">

            <span className="text-2xl">🎉</span>

            <h2 className="text-lg font-bold text-[#003B75]">
              Ganeshotsav Competition
            </h2>

          </div>

          <p className="leading-7 text-gray-700">
            Every year the club organizes a unique
            <strong> Ganeshotsav Competition </strong>
            to encourage Ganesh Mandals to promote
            meaningful social awareness through their celebrations.
          </p>

          <p className="mt-4 leading-7 text-gray-700">
            The competition recognises innovative themes based on
            environmental protection, public health,
            social harmony, civic responsibility
            and national values.
          </p>

          <p className="mt-4 leading-7 text-gray-700">
            This initiative transforms a cultural festival into
            a powerful platform for public education,
            community participation and positive social change.
          </p>

        </section>
                {/* Healthcare Excellence */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-2">

            <span className="text-2xl">🩺</span>

            <h2 className="text-lg font-bold text-[#003B75]">
              Healthcare Excellence
            </h2>

          </div>

          <p className="leading-7 text-gray-700">
            Accessible healthcare remains one of the club's highest
            priorities. Lions Club of Sinnar City regularly organizes
            comprehensive medical camps across Sinnar and nearby rural
            areas, providing quality healthcare services free of cost.
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-gray-700">
            <li>Multi-specialty Medical Camps</li>
            <li>Diabetes Screening</li>
            <li>Cardiac Health Check-up</li>
            <li>Maternal Health Awareness</li>
          </ul>

        </section>

        {/* Vision & Cataract Care */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-2">

            <span className="text-2xl">👁️</span>

            <h2 className="text-lg font-bold text-[#003B75]">
              Vision & Cataract Care
            </h2>

          </div>

          <p className="leading-7 text-gray-700">
            Regular eye screening programmes are conducted to prevent
            avoidable blindness. Free eye examinations, distribution of
            spectacles and cataract surgery camps are organized for
            deserving beneficiaries.
          </p>

        </section>

        {/* Blood Donation */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-2">

            <span className="text-2xl">🩸</span>

            <h2 className="text-lg font-bold text-[#003B75]">
              Blood Donation Drives
            </h2>

          </div>

          <p className="leading-7 text-gray-700">
            The club regularly conducts voluntary blood donation drives
            in association with local blood banks to help maintain an
            adequate blood supply during emergencies and critical
            shortages.
          </p>

        </section>

        {/* Education */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-2">

            <span className="text-2xl">📚</span>

            <h2 className="text-lg font-bold text-[#003B75]">
              Educational Empowerment
            </h2>

          </div>

          <p className="leading-7 text-gray-700">
            The club actively supports students by distributing
            educational kits, notebooks, school bags and uniforms,
            while also organizing career guidance, youth mentorship and
            leadership development programmes.
          </p>

        </section>

        {/* Environment */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-2">

            <span className="text-2xl">🌱</span>

            <h2 className="text-lg font-bold text-[#003B75]">
              Environmental Initiatives
            </h2>

          </div>

          <p className="leading-7 text-gray-700">
            Environmental conservation remains an integral part of our
            service. Tree plantation, water conservation and
            cleanliness campaigns are conducted regularly to create a
            healthier and greener community.
          </p>

        </section>

        {/* Disaster Relief */}

        <section className="rounded-2xl bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-2">

            <span className="text-2xl">🤝</span>

            <h2 className="text-lg font-bold text-[#003B75]">
              Crisis & Disaster Relief
            </h2>

          </div>

          <p className="leading-7 text-gray-700">
            During natural disasters, public health emergencies and
            unforeseen crises, Lions Club of Sinnar City responds with
            food kits, emergency medical supplies and essential relief
            materials, standing with the community whenever help is
            needed most.
          </p>

        </section>

      </div>
    </main>
  );
}