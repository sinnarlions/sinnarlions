"use client";

import React from "react";

interface Member {
  id: string;
  memberCode: string;
  name: string;
  mobile: string;
  email?: string;
  dob?: string;
  weddingDate?: string;
  bloodGroup?: string;
  profession?: string;
  companyName?: string;
  jobTitle?: string;
  businessCategory?: string;
  address?: string;
  skills?: string;
  currentLionsRole?: string;
  status?: string;
}

interface MemberViewModalProps {
  member: Member;
  onClose: () => void;
}

export default function MemberViewModal({ member, onClose }: MemberViewModalProps) {
  // रिकाम्या फील्ड्ससाठी 'Not Available' सुरक्षितपणे दाखवणारे हेल्पर फंक्शन
  const renderValue = (value: string | undefined) => {
    if (!value || value.trim() === "" || value === "-") {
      return <span className="text-gray-400 font-normal italic text-xs">Not Available</span>;
    }
    return <span className="text-gray-900 font-medium">{value}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      {/* Main Modal Card with Scale-Up Animation */}
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-100 transform transition-all duration-300 scale-100 animate-[scaleUp_0.2s_ease-out]">
        
        {/* Modal Top Header Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>🔍</span> Member Profile Overview
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 text-2xl font-semibold p-1 hover:bg-gray-100 rounded-lg h-8 w-8 flex items-center justify-center transition-colors duration-200"
          >
            &times;
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 md:space-y-8 bg-gradient-to-b from-gray-50/30 to-white">
          
          {/* 1. Beautiful Premium Profile Header */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-5 transition-all duration-200 hover:shadow-md">
            {/* Future-Ready Profile Photo Avatar Placeholder */}
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 flex items-center justify-center text-3xl shadow-inner shrink-0 text-blue-600 transition-transform duration-300 hover:scale-105">
              👤
            </div>
            
            {/* Member Identity & Badges */}
            <div className="text-center sm:text-left space-y-2 w-full">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{member.name || "Unknown Member"}</h3>
                <p className="text-xs font-mono font-bold text-gray-400 mt-0.5 tracking-wider">MEMBER CODE: {member.memberCode || "N/A"}</p>
              </div>
              
              {/* Responsive Badges Container */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {member.status?.toLowerCase() === "inactive" ? (
                  <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-100 shadow-sm">
                    🔴 Inactive
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100 shadow-sm">
                    🟢 Active
                  </span>
                )}
                
                <span className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-blue-700">
                  👑 {member.currentLionsRole || "Member"}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Grouped Information Sections */}

          {/* SECTION A: Lions Club Info */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm transition-all duration-200 hover:shadow-md">
            <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <span>🦁</span> Lions Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="text-xs font-semibold text-gray-400 block">Member Code</label>
                <p className="mt-1 font-mono font-semibold text-gray-700">{member.memberCode || "N/A"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block">Current Lions Role</label>
                <p className="mt-1 font-semibold text-gray-800">{member.currentLionsRole || "Member"}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block">Account Status</label>
                <p className="mt-1 font-semibold text-gray-800">{member.status || "Active"}</p>
              </div>
            </div>
          </div>

          {/* SECTION B: Personal Info */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm transition-all duration-200 hover:shadow-md">
            <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <span>👤</span> Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <label className="text-xs font-semibold text-gray-400 block">Full Name</label>
                <div className="mt-1">{renderValue(member.name)}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block">Mobile Number</label>
                <div className="mt-1">{renderValue(member.mobile)}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block">Email Address</label>
                <div className="mt-1 truncate max-w-full">{renderValue(member.email)}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block">Date of Birth</label>
                <div className="mt-1">{renderValue(member.dob)}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block">Wedding Date</label>
                <div className="mt-1">{renderValue(member.weddingDate)}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block">Blood Group</label>
                <div className="mt-1 font-bold text-red-600">{renderValue(member.bloodGroup)}</div>
              </div>
            </div>
          </div>

          {/* SECTION C: Professional Info */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm transition-all duration-200 hover:shadow-md">
            <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <span>💼</span> Professional Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-xs font-semibold text-gray-400 block">Profession</label>
                <div className="mt-1">{renderValue(member.profession)}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block">Company / Business Name</label>
                <div className="mt-1">{renderValue(member.companyName)}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block">Job Title</label>
                <div className="mt-1">{renderValue(member.jobTitle)}</div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 block">Business Category</label>
                <div className="mt-1">{renderValue(member.businessCategory)}</div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-gray-400 block">Skills</label>
                <div className="mt-1">{renderValue(member.skills)}</div>
              </div>
            </div>
          </div>

          {/* SECTION D: Residential Address (Full Width) */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm transition-all duration-200 hover:shadow-md">
            <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <span>🏠</span> Address
            </h4>
            <div className="text-sm">
              <label className="text-xs font-semibold text-gray-400 block mb-1">Residential Address</label>
              <div className="text-gray-800 leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                {renderValue(member.address)}
              </div>
            </div>
          </div>

          {/* Future Expansion Anchors Container */}
          {/* भविष्यकाळात येणारे फिचर्स (Reset PIN, Family details इ.) विना-रीडिझाईन येथे थेट नवीन कार्ड म्हणून जोडता येतील. */}

        </div>

        {/* Modal Action Buttons (Footer) */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 font-bold px-6 py-2.5 rounded-xl text-sm transition-colors duration-200 shadow-sm"
          >
            Close Profile
          </button>
        </div>

      </div>

      {/* Embedded CSS Keyframes for Subtle Animation */}
      <style jsx global>{`
        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}