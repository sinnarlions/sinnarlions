export interface LionsRole {
  name: string;
  unique: boolean;
}

export const LIONS_ROLES: LionsRole[] = [
  // Office Bearers
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

  { name: "Tail Tamer", unique: true },
  { name: "Tail Twister", unique: true },

  // Multiple Members
  { name: "Director", unique: false },
  { name: "Member", unique: false },
];