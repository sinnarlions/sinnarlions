export interface LionsRole {
  name: string;
  unique: boolean;
}

export const LIONS_ROLES: LionsRole[] = [
  { name: "President", unique: true },
  { name: "Immediate Past President", unique: true },

  { name: "Secretary", unique: true },
  { name: "Add. Secretary", unique: true },

  { name: "Treasurer", unique: true },
  { name: "Add. Treasurer", unique: true },

  { name: "Vice President 1", unique: true },
  { name: "Vice President 2", unique: true },
  { name: "Vice President 3", unique: true },

  { name: "Director", unique: false },

  { name: "Service Chairperson", unique: true },
  { name: "Membership Chairperson", unique: true },
  { name: "Marketing Chairperson", unique: true },

  { name: "LCIF Coordinator", unique: true },

  { name: "GMT Chairperson", unique: true },
  { name: "GLT Chairperson", unique: true },
  { name: "GST Chairperson", unique: true },

  { name: "P.R.O.", unique: true },

  { name: "Tail Twister", unique: true },
  { name: "Lion Tamer", unique: true },

  { name: "Member", unique: false },
];