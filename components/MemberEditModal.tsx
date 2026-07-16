"use client";

import React, { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/src/firebase/config";
import { LIONS_ROLES } from "@/src/constants/roles";
import { CABINET_ROLES } from "@/src/constants/cabinetRoles";
import { isSuperAdmin as checkSuperAdmin, UserData } from "@/src/utils/permissions";

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
  companyName?: string;
  jobTitle?: string;
  businessCategory?: string;
  address?: string;
  skills?: string;
  currentLionsRole?: string;
  cabinetRole?: string;
  status?: string;
  yearJoinedLions?: string;
  pastPositions?: string;
  awardsAchievements?: string;
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
    companyName: member.companyName || "",
    jobTitle: member.jobTitle || "",
    businessCategory: member.businessCategory || "",
    address: member.address || "",
    skills: member.skills || "",
    currentLionsRole: member.currentLionsRole || "Member",
    cabinetRole: member.cabinetRole || "",
    yearJoinedLions: member.yearJoinedLions || "",
    pastPositions: member.pastPositions || "",
    awardsAchievements: member.awardsAchievements || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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

  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to permanently delete member "${formData.name}"?`);
    if (!confirmDelete) return;

    setIsSubmitting(true);
    try {
      await deleteDoc(doc(db, "members", member.id));
      alert("Member Deleted Successfully ❌");
      onClose();
    } catch (error) {
      console.error("Error deleting member:", error);
      alert("Error deleting member.");
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
      alert("Error updating information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col border border-gray-100">
        
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Member Profile</h2>
            <p className="text-xs text-gray-500 mt-0.5">Editing: {member.memberCode}</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-semibold p-1 transition">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-4 text-sm text-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Full Name *</label><input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Mobile Number *</label><input required type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Blood Group</label><input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Date of Birth</label><input type="text" name="dob" placeholder="DD.MM.YYYY" value={formData.dob} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Anniversary Date</label><input type="text" name="anniversary" placeholder="DD.MM.YYYY" value={formData.anniversary} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Profession</label><input type="text" name="profession" value={formData.profession} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Company / Business Name</label><input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Job Title</label><input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Business Category</label><input type="text" name="businessCategory" value={formData.businessCategory} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              
              {/* नवीन फील्ड्स */}
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Year Joined Lions</label><input type="text" name="yearJoinedLions" value={formData.yearJoinedLions} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              
              <div><label className="block text-xs font-semibold text-gray-600 mb-1">Current Lions Role</label><select name="currentLionsRole" value={formData.currentLionsRole} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500">{LIONS_ROLES.map((role, index) => <option key={`lions-${index}`} value={role.name}>{role.name}</option>)}</select></div>
              <div>
  <label className="block text-xs font-semibold text-gray-600 mb-1">
    Cabinet Role
  </label>

  <select
    name="cabinetRole"
    value={formData.cabinetRole}
    onChange={handleChange}
    className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">None</option>

    {CABINET_ROLES.map((role, index) => (
      <option key={`cabinet-${index}`} value={role.name}>
        {role.name}
      </option>
    ))}
  </select>
</div>
              
              <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Past Positions Held</label><textarea rows={2} name="pastPositions" value={formData.pastPositions} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea></div>
              <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Awards & Achievements</label><textarea rows={2} name="awardsAchievements" value={formData.awardsAchievements} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea></div>
              <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Skills</label><input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div className="sm:col-span-2"><label className="block text-xs font-semibold text-gray-600 mb-1">Address</label><textarea rows={3} name="address" value={formData.address} onChange={handleChange} className="w-full border border-gray-200 bg-gray-50 focus:bg-white rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"></textarea></div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <div>{isSuperAdmin && <button type="button" onClick={handleDelete} disabled={isSubmitting} className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold px-4 py-2 rounded-xl transition duration-200 disabled:opacity-50 text-sm">Delete Member</button>}</div>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold px-5 py-2 rounded-xl transition duration-200 disabled:opacity-50 text-sm">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl transition duration-200 disabled:opacity-50 text-sm">{isSubmitting ? "Saving..." : "Save Changes"}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}