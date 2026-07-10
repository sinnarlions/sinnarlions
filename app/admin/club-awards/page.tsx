"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/src/firebase/config";

interface ClubAward {
  id: string;
  title: string;
  year: string;
  level: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
}

export default function ClubAwardsAdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState("");

  const [awards, setAwards] = useState<ClubAward[]>([]);

  const [title, setTitle] = useState("");
  const [year, setYear] = useState("");
  const [level, setLevel] = useState("District");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    loadAwards();
  }, []);

  async function loadAwards() {
    try {
      const snap = await getDocs(
        collection(db, "clubAwards")
      );

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<ClubAward, "id">),
      }));

      data.sort(
        (a, b) =>
          (b.displayOrder || 0) -
          (a.displayOrder || 0)
      );

      setAwards(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function clearForm() {
    setEditingId("");
    setTitle("");
    setYear("");
    setLevel("District");
    setDescription("");
    setImageUrl("");
  }
    async function handleSave() {
    if (!title || !year) {
      alert("Please fill Award Title and Year.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await updateDoc(doc(db, "clubAwards", editingId), {
          title,
          year,
          level,
          description,
          imageUrl,
        });

        alert("Award Updated Successfully ✅");
      } else {
        await addDoc(collection(db, "clubAwards"), {
          title,
          year,
          level,
          description,
          imageUrl,
          displayOrder: Number(year.substring(0, 4)),
          createdAt: serverTimestamp(),
        });

        alert("Award Added Successfully ✅");
      }

      clearForm();
      loadAwards();
    } catch (err) {
      console.error(err);
      alert("Unable to save award.");
    }

    setSaving(false);
  }

  function handleEdit(item: ClubAward) {
    setEditingId(item.id);

    setTitle(item.title);
    setYear(item.year);
    setLevel(item.level);
    setDescription(item.description);
    setImageUrl(item.imageUrl);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleDelete(id: string) {
    const ok = confirm(
      "Delete this award?"
    );

    if (!ok) return;

    try {
      await deleteDoc(
        doc(db, "clubAwards", id)
      );

      loadAwards();
    } catch (err) {
      console.error(err);
      alert("Unable to delete award.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-10">

      {/* Header */}

      <div className="sticky top-0 z-20 border-b-4 border-[#F2A900] bg-[#003B75] shadow-md">

        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-4">

          <div>

            <h1 className="text-xl font-bold text-white">
              Club Awards
            </h1>

            <p className="text-[11px] text-white/80">
              Super Admin
            </p>

          </div>

          <button
            onClick={() => router.push("/admin")}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#003B75] shadow"
          >
            ← Back
          </button>

        </div>

      </div>

      <div className="mx-auto mt-5 max-w-md space-y-4 px-4">
            {/* Award Form */}

      <div className="rounded-2xl bg-white p-5 shadow-sm">

        <h2 className="mb-4 text-lg font-bold text-[#003B75]">
          {editingId ? "Edit Award" : "Add New Award"}
        </h2>

        <div className="space-y-4">

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              Award Title
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border p-3"
              placeholder="Best Club Award"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              Award Year
            </label>

            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full rounded-xl border p-3"
              placeholder="2024-25"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              Award Level
            </label>

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full rounded-xl border p-3"
            >
              <option>Club</option>
              <option>Zone</option>
              <option>Region</option>
              <option>District</option>
              <option>Multiple</option>
              <option>International</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              Description
            </label>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              Image URL (Optional)
            </label>

            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </div>

          <div className="flex gap-3">

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-xl bg-[#003B75] py-3 font-bold text-white"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Award"
                : "Save Award"}
            </button>

            {editingId && (
              <button
                onClick={clearForm}
                className="rounded-xl bg-gray-200 px-5 font-bold"
              >
                Cancel
              </button>
            )}

          </div>

        </div>

      </div>

      {/* Awards List */}

      <div className="space-y-3">

        {awards.length === 0 ? (

          <div className="rounded-xl bg-white p-5 text-center text-gray-500 shadow-sm">
            No Awards Added Yet
          </div>

        ) : (

          awards.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">

                <div>
                  <h3 className="text-lg font-bold text-[#003B75]">
                    {item.title}
                  </h3>

                  <p className="text-sm font-semibold text-gray-600">
                    {item.year}
                  </p>

                  <p className="mt-1 inline-block rounded-full bg-[#F2A900]/20 px-3 py-1 text-xs font-bold text-[#003B75]">
                    {item.level}
                  </p>
                </div>

              </div>

              {item.description && (
                <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                  {item.description}
                </p>
              )}

              <div className="mt-4 flex gap-2">

                <button
                  onClick={() => handleEdit(item)}
                  className="rounded-lg bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="rounded-lg bg-red-100 px-4 py-2 text-sm font-bold text-red-700"
                >
                  Delete
                </button>

              </div>

            </div>
          ))

        )}

      </div>

    </div>

  </main>
);
}