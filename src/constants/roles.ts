export interface LionsRole {
  name: string;
  unique: boolean;
}

export const LIONS_ROLES: LionsRole[] = [
  { name: "President", unique: true },
  { name: "Secretary", unique: true },
  { name: "Treasurer", unique: true },

  { name: "Immediate Past President", unique: true },

  { name: "First Vice President", unique: true },
  { name: "Second Vice President", unique: true },
  { name: "Third Vice President", unique: true },

  { name: "Joint Secretary", unique: true },
  { name: "Joint Treasurer", unique: true },

  { name: "PRO", unique: true },

  { name: "GMT Chairperson", unique: true },
  { name: "GLT Chairperson", unique: true },
  { name: "GST Chairperson", unique: true },

  { name: "Tail Tamar", unique: true },
  { name: "Tail Twister", unique: true },

  { name: "Director", unique: false },
 
  { name: "Member", unique: false },
  { name: "District Governor", unique: false },
  { name: "Immediate Past District Governor", unique: false },
  { name: "First Vice District Governor", unique: false },
  { name: "Second Vice District Governor", unique: false },

  { name: "Region Chairperson", unique: false },
  { name: "Zone Chairperson", unique: false },

  { name: "Cabinet Secretary", unique: false },
  { name: "Cabinet Treasurer", unique: false },

  { name: "District PRO", unique: false },

  { name: "GMT Coordinator", unique: false },
  { name: "GLT Coordinator", unique: false },
  { name: "GST Coordinator", unique: false },

  { name: "LCIF Coordinator", unique: false },

  { name: "IT Chairperson", unique: false },
  { name: "Marketing Chairperson", unique: false },

  { name: "Member", unique: false },
];