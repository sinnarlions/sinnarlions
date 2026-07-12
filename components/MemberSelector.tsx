"use client";

import { useMemo, useState } from "react";

export interface MemberOption {
  memberCode: string;
  name: string;
}

interface MemberSelectorProps {
  members: MemberOption[];

  selected: string[];

  onChange: (codes: string[]) => void;

  multiple?: boolean;
}

export default function MemberSelector({
  members,
  selected,
  onChange,
  multiple = true,
}: MemberSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredMembers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return members;

    return members.filter((member) =>
      `${member.name} ${member.memberCode}`
        .toLowerCase()
        .includes(keyword)
    );
  }, [members, search]);
    function toggleMember(memberCode: string) {
    if (multiple) {
      if (selected.includes(memberCode)) {
        onChange(
          selected.filter((code) => code !== memberCode)
        );
      } else {
        onChange([...selected, memberCode]);
      }
    } else {
      onChange([memberCode]);
    }
  }

  return (
    <div className="space-y-3">

      <input
        type="text"
        placeholder="🔍 Search Member..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm"
      />

      <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-300 bg-white">

        {filteredMembers.length === 0 ? (

          <div className="p-4 text-center text-sm text-gray-500">
            No members found.
          </div>

        ) : (

          filteredMembers.map((member) => {

            const checked = selected.includes(
              member.memberCode
            );

            return (

              <label
                key={member.memberCode}
                className="flex cursor-pointer items-center gap-3 border-b px-3 py-2 hover:bg-gray-50"
              >

                <input
                  type={
                    multiple
                      ? "checkbox"
                      : "radio"
                  }
                  checked={checked}
                  onChange={() =>
                    toggleMember(
                      member.memberCode
                    )
                  }
                />

                <div>

                  <p className="font-semibold text-gray-700">
                    {member.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {member.memberCode}
                  </p>

                </div>

              </label>

            );

          })

        )}

      </div>

    </div>
  );
}