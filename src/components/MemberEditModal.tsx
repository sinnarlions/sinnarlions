"use client";

import React, { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { LIONS_ROLES } from "@/constants/roles";
import { isSuperAdmin as checkSuperAdmin, UserData } from "@/utils/permissions";

interface Member {
  id: string;
  memberCode: string;
  name: string;
  mobile: string;
  email?: string;
  dob?: string;
  anniversary?: string;
  bloodGroup?: string;
  profession?: string;
  company?: string;
  jobTitle?: string;
  businessCategory?: string;
  address?: string;
  skills?: string;
  currentLionsRole?: string;
  status?: string;
}

interface MemberEditModalProps {
  member: Member;
  onClose: () => void;
}

export default function MemberEditModal({ member, onClose }: MemberEditModalProps) {
  const [formData, setFormData] = useState({
    name: member.name || "",
    mobile: member.mobile || "",
    email: member.email || "",
    dob: member.dob || "",
    anniversary: member.anniversary || "",
    bloodGroup: member.bloodGroup || "",
    profession: member.profession || "",
    company: member.company || "",
    jobTitle: member.jobTitle || "",
    businessCategory: member.businessCategory || "",
    address: member.address || "",
    skills: member.skills || "",
    currentLionsRole: member.currentLionsRole || "Member",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // लोकल स्टोरेजमधून सुपर ॲडमिन परमिशन चेक करणे
  useEffect(() => {
    const storedMember = localStorage.getItem("member");
    if (storedMember) {
      try {
        const user: UserData = JSON.parse(storedMember);
        setIsSuperAdmin(checkSuperAdmin(user));
      } catch (e) {
        console.error("Error parsing user data in Edit Modal", e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // मेंबर डिलीट करण्याचे सुरक्षित फंक्शन
  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete member "${formData.name}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, "members", member.id));
      alert("Member Deleted Successfully ❌");
      onClose(); // लिस्ट रिफ्रेश करण्यासाठी मोडल बंद करणे
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("मेंबर डिलीट करताना त्रुटी आली.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const memberDocRef = doc(db, "members", member.id);
      await updateDoc(memberDocRef, formData);
      alert("Member Updated Successfully ✅");
      onClose(); 
    } catch (error) {
      console.error("Error updating member profile:", error);
      alert("माहिती अपडेट करताना त्रुटी आली.");
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
            <h2 className="text-xl font-bold text-gray-900">Edit Member Profile</h2>
            <p className="text-xs text-gray-500 mt-0.5">Editing: {member.memberCode}</p>
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
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number *</label>
                <input required type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Blood Group */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Blood Group</label>
                <input type="text" name="bloodGroup" placeholder="e.g. O+ve" value={formData.bloodGroup} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* DOB */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label>
                <input type="text" name="dob" placeholder="DD.MM.YYYY" value={formData.dob} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Anniversary */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Anniversary Date</label>
                <input type="text" name="anniversary" placeholder="DD.MM.YYYY" value={formData.anniversary} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /> 
              </div>

              {/* Profession */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Profession</label>
                <input type="text" name="profession" value={formData.profession} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Company */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Company / Business Name</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Job Title</label>
                <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Business Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Business Category</label>
                <input type="text" name="businessCategory" value={formData.businessCategory} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Lions Role */}
              {/* Lions Role */}
<div className="sm:col-span-2">
  <label className="block text-xs font-semibold text-gray-600 mb-1">
    Current Lions Role
  </label>

  <select
    name="currentLionsRole"
    value={formData.currentLionsRole}
    onChange={handleChange}
    className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    {LIONS_ROLES.map((role) => (
      <option key={role.name} value={role.name}>
        {role.name}
      </option>
    ))}
  </select>
</div>

              {/* Skills */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Skills</label>
                <input type="text" name="skills" placeholder="e.g. Public Speaking, Event Management" value={formData.skills} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                <textarea rows={3} name="address" value={formData.address} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea>
              </div>

            </div>
          </div>

          {/* Modal Footer (Action Panel) */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            
            {/* डाव्या बाजूला: फक्त Super Admin साठी Delete Button */}
            <div>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold px-4 py-2 rounded-xl transition duration-200 disabled:opacity-50 text-sm"
                >
                  Delete Member
                </button>
              )}
            </div>

            {/* उजव्या बाजूला: Cancel आणि Save Changes Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold px-5 py-2 rounded-xl transition duration-200 disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl transition duration-200 disabled:opacity-50 text-sm"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}