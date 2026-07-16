export interface CabinetRole {
  name: string;
}

export const CABINET_ROLES: CabinetRole[] = [
  {
    name: "",
  },

  {
    name: "District Governor",
  },

  {
    name: "Immediate Past District Governor",
  },

  {
    name: "First Vice District Governor",
  },

  {
    name: "Second Vice District Governor",
  },

  {
    name: "Cabinet Secretary",
  },

  {
    name: "Cabinet Treasurer",
  },

  {
    name: "Region Chairperson",
  },
    {
    name: "Zone Chairperson",
  },

  {
    name: "District PRO",
  },

  {
    name: "GMT Coordinator",
  },

  {
    name: "GLT Coordinator",
  },

  {
    name: "GST Coordinator",
  },

  {
    name: "LCIF Coordinator",
  },

  {
    name: "IT Chairperson",
  },
{
  name: "District Chairperson – Diabetes Awareness",
},
  {
    name: "Marketing Chairperson",
  },
];

export const CABINET_ROLE_NAMES = CABINET_ROLES.map(
  (role) => role.name
).filter(Boolean);