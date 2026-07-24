"use client";

import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/src/firebase/config";


interface MemberAddModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function MemberAddModal({ onClose, onSuccess }: MemberAddModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    dob: "",
    anniversary: "",
    bloodGroup: "",
    profession: "",
    companyName: "",
    jobTitle: "",
    businessCategory: "",
    address: "",
    skills: "",
    currentLionsRole: "Member",
    yearJoinedLions: "",
    spouseName: "",
    status: "Active",
    
  });

  const [generatedCode, setGeneratedCode] = useState<string>("LC001");
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  // डिलीट केलेले मेंबर लक्षात ठेवून नवीन सुरक्षित कोड तयार करणे
  useEffect(() => {
    const generateNextCode = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "members"));
        
        let maxNumber = 0;

        // आजपर्यंत तयार झालेले सर्व कोड तपासणे (Deleted मेंबर्सचे कोड पुन्हा वापरले जाऊ नयेत म्हणून)
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.memberCode) {
            // 'LC015' मधून फक्त '15' हा आकडा वेगळा काढणे
            const numStr = data.memberCode.replace("LC", "");
            const num = parseInt(numStr, 10);
            if (!isNaN(num) && num > maxNumber) {
              maxNumber = num;
            }
          }
        });

        // जो सर्वात मोठा नंबर मिळाला असेल, त्याच्या पुढील नंबर देणे (उदा. १५ नंतर १६)
        const nextNumber = maxNumber + 1;
        const formattedCode = `LC${String(nextNumber).padStart(3, "0")}`; // LC016 असे फॉरमॅट करेल
        setGeneratedCode(formattedCode);
      } catch (error) {
        console.error("Error generating member code:", error);
      }
    };

    generateNextCode();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalData = {
  ...formData,

  memberCode: generatedCode,

  loginPin: "1234",
  isPinChanged: false,

  role: "member",
status: "Active",
  isActive: true,
  isLoggedIn: false,
  sessionId: "",
  lastLogin: null,

  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  pastPositions: "",
  cabinetRole: "",
  awardsAchievements: "",
  specialSkills: "",
  };

      await setDoc(
  doc(db, "members", generatedCode),
  finalData
);
     alert(`Member Added Successfully ✅\nAssigned Code: ${generatedCode}`);

onSuccess();
onClose();
    } catch (error) {
      console.error("Error adding member:", error);
      alert("मेंबर जोडताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col border border-gray-100">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Member</h2>
            <p className="text-xs text-blue-600 font-semibold mt-0.5">Auto Assigned Code: {generatedCode}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-semibold p-1 transition">&times;</button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label>
                <input required type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number *</label>
                <input required type="text" name="mobile" placeholder="10 Digit Mobile" value={formData.mobile} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                <input type="email" name="email" placeholder="example@mail.com" value={formData.email} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Blood Group</label>
                <input type="text" name="bloodGroup" placeholder="e.g. B+ve" value={formData.bloodGroup} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* DOB */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                <input
type="date"
name="dob"
value={formData.dob}
onChange={handleChange}
className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
              </div>

              {/* Anniversary */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Anniversary Date</label>
                <input
type="date"
name="anniversary"
value={formData.anniversary}
onChange={handleChange}
className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
/> 
              </div>

              {/* Profession */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Profession</label>
                <input type="text" name="profession" placeholder="e.g. Engineer, Business" value={formData.profession} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Company */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Company / Business Name</label>
                <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Job Title</label>
                <input type="text" name="jobTitle" placeholder="e.g. Director, Manager" value={formData.jobTitle} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Business Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Business Category</label>
                <input type="text" name="businessCategory" placeholder="e.g. IT, Manufacturing" value={formData.businessCategory} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
<div>
  <label className="block text-xs font-semibold text-gray-600 mb-1">
    Year Joined Lions
  </label>

  <select
    name="yearJoinedLions"
    value={formData.yearJoinedLions}
    onChange={handleChange}
    className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Select Year</option>

    {Array.from(
      { length: new Date().getFullYear() - 1999 + 1 },
      (_, i) => {
        const year = new Date().getFullYear() - i;

        return (
          <option key={year} value={year}>
            {year}
          </option>
        );
      }
    )}
  </select>
</div>
</div>   ← Year Joined Lions संपतो

<div>
  <label className="block text-xs font-semibold text-gray-600 mb-1">
    Spouse Name
  </label>

  <input
    type="text"
    name="spouseName"
    value={formData.spouseName}
    onChange={handleChange}
    placeholder="Spouse Name"
    className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>

{/* Current Lions Role */}
<div className="sm:col-span-2">
              {/* Current Lions Role */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Current Lions Role</label>
                <select name="currentLionsRole" value={formData.currentLionsRole} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Member">Member</option>
                  <option value="President">President</option>
                  <option value="Secretary">Secretary</option>
                  <option value="Treasurer">Treasurer</option>
                  <option value="Vice President">Vice President</option>
                </select>
              </div>

              {/* Skills */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Skills</label>
                <input type="text" name="skills" placeholder="e.g. Public Speaking, Management" value={formData.skills} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                <textarea rows={3} name="address" placeholder="Full Residential Address" value={formData.address} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
              </div>

            </div>
          </div>

          {/* Modal Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold px-5 py-2 rounded-xl transition duration-200 disabled:opacity-50 text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl transition duration-200 disabled:opacity-50 flex items-center gap-2 text-xs sm:text-sm"
            >
              {isSubmitting ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}