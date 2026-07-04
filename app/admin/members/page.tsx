"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/src/firebase/config";
import { canAccessAdmin, isSuperAdmin as checkSuperAdmin, UserData } from "@/src/utils/permissions";
import MemberViewModal from "@/components/MemberViewModal";
import MemberEditModal from "@/components/MemberEditModal";
import MemberAddModal from "@/components/MemberAddModal";

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

export default function MemberManagementPage() {
  const router = useRouter();

  // State Management
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedViewMember, setSelectedViewMember] = useState<Member | null>(null);
  const [selectedEditMember, setSelectedEditMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(false);

  // Function to load members using getDocs
  const loadMembers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "members"));
      const fetchedMembers: Member[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedMembers.push({
          id: doc.id,
          memberCode: data.memberCode || "",
          name: data.name || "",
          mobile: data.mobile || "",
          email: data.email || "",
          dob: data.dob || "",
          anniversary: data.anniversary || "",
          bloodGroup: data.bloodGroup || "",
          profession: data.profession || "",
          company: data.company || "",
          jobTitle: data.jobTitle || "",
          businessCategory: data.businessCategory || "",
          address: data.address || "",
          skills: data.skills || "",
          currentLionsRole: data.currentLionsRole || "Member",
          status: data.status || "Active",
        });
      });

      // Alphabetical sort by name
      fetchedMembers.sort((a, b) => a.name.localeCompare(b.name));
      setMembers(fetchedMembers);
    } catch (error) {
      console.error("Error loading members from Firestore:", error);
    } finally {
      setLoading(false);
    }
  };

  // Authentication and Authorization via localStorage
  useEffect(() => {
    const storedMember = localStorage.getItem("member");
    if (!storedMember) {
      router.replace("/login");
      return;
    }

    try {
      const user: UserData = JSON.parse(storedMember);
      console.log("Logged In User Object:", user);
      
      const superAdminStatus = checkSuperAdmin(user);
      console.log("Strict Resolved isSuperAdmin =", superAdminStatus);
      
      setIsSuperAdmin(superAdminStatus);

      if (!canAccessAdmin(user)) {
        alert("Access Denied");
        router.replace("/");
        return;
      }
      setAuthorized(true);
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      router.replace("/login");
    }
  }, [router]);

  // Initial Fetch when authorized
  useEffect(() => {
    if (authorized) {
      loadMembers();
    }
  }, [authorized]);

  // Real-time filtered list matching: Name, Code, Mobile
  const filteredMembers = members.filter((member) => {
    const term = search.toLowerCase();
    return (
      member.name.toLowerCase().includes(term) ||
      member.memberCode.toLowerCase().includes(term) ||
      member.mobile.includes(term)
    );
  });

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#F7F2F0" }}>
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent mx-auto" style={{ borderColor: "#2F5D62" }}></div>
          <p className="mt-4 font-medium" style={{ color: "#2F5D62" }}>Checking Permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#F7F2F0" }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: "#2F5D62" }}>
              <span>👥</span> Member Management
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Total Members: <span className="font-bold text-gray-800">{loading ? "Loading..." : members.length}</span>
            </p>
          </div>
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl shadow-sm transition duration-200 w-fit">
            ← Admin Dashboard
          </Link>
        </div>

        {/* Search & Action Panel */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search Box */}
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by name, member code, or mobile number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition duration-200 text-gray-800 text-sm"
                style={{ "--tw-ring-color": "#2F5D62" } as React.CSSProperties}
              />
            </div>

            {/* Super Admin Add Button Element */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-[#003B75] hover:bg-[#002A54] text-white font-bold transition-all shadow-sm whitespace-nowrap flex items-center justify-center gap-2"
              >
                <span>➕</span> Add Member
              </button>
            )}

          </div>
        </div>

        {/* Members Layout Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          
          {loading ? (
            <div className="text-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent mx-auto mb-3" style={{ borderColor: "#2F5D62" }}></div>
              <p className="text-sm text-gray-500">Loading members list...</p>
            </div>
          ) : (
            <>
              {/* Desktop Responsive Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs font-semibold uppercase tracking-wider">
                      <th className="px-6 py-4">Member Code</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Mobile</th>
                      <th className="px-6 py-4">Lions Role</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50/50 transition duration-150">
                          <td className="px-6 py-4 font-mono font-medium text-gray-600">{member.memberCode}</td>
                          <td className="px-6 py-4 font-semibold text-gray-900">{member.name}</td>
                          <td className="px-6 py-4">{member.mobile}</td>
                          <td className="px-6 py-4">
                            <span className="bg-gray-100 text-gray-800 font-medium px-2.5 py-1 rounded-md text-xs border border-gray-200">
                              {member.currentLionsRole || "Member"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => setSelectedViewMember(member)}
                              className="text-xs font-semibold bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition duration-150"
                            >
                              View
                            </button>
                            <button
                              onClick={() => setSelectedEditMember(member)}
                              className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition duration-150 shadow-sm hover:opacity-90"
                              style={{ backgroundColor: "#2F5D62" }}
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-gray-400">
                          No matching records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout View */}
              <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <div key={member.id} className="border border-gray-100 bg-gray-50/50 p-4 rounded-xl space-y-3 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-mono font-bold text-gray-400 block">{member.memberCode}</span>
                          <h3 className="font-bold text-gray-900 mt-0.5">{member.name}</h3>
                        </div>
                        <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                          {member.currentLionsRole || "Member"}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>📱 <span className="font-medium">Mobile:</span> {member.mobile}</p>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-gray-100 flex-wrap">
                        <button
                          onClick={() => setSelectedViewMember(member)}
                          className="flex-1 min-w-[60px] text-center text-xs font-semibold text-gray-700 bg-white border border-gray-200 py-2 rounded-lg hover:bg-gray-50 transition duration-150"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setSelectedEditMember(member)}
                          className="flex-1 min-w-[60px] text-center text-xs font-semibold text-white py-2 rounded-lg transition duration-150 shadow-sm hover:opacity-90"
                          style={{ backgroundColor: "#2F5D62" }}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No matching records found.
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </div>

      {/* Render Modular Overlays */}
      {selectedViewMember && (
        <MemberViewModal member={selectedViewMember} onClose={() => setSelectedViewMember(null)} />
      )}
      
      {selectedEditMember && (
        <MemberEditModal 
          member={selectedEditMember} 
          onClose={() => {
            setSelectedEditMember(null);
            loadMembers(); // मेंबर एडिट किंवा डिलीट केल्यानंतर लिस्ट लगेच अपडेट होईल
          }} 
        />
      )}

      
      {isAddModalOpen && (
        <MemberAddModal 
          onClose={() => setIsAddModalOpen(false)} 
          onSuccess={() => {
            setIsAddModalOpen(false);
            loadMembers();
          }} 
        />
      )}
    </div>
  );
}