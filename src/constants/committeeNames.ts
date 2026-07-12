export interface CommitteeName {
  name: string;
}

export const COMMITTEE_NAMES: CommitteeName[] = [
  {
    name: "Fund Raising Committee",
  },
  {
    name: "Cultural Committee",
  },
  {
    name: "Education Committee",
  },
  {
    name: "Health Committee",
  },
  {
    name: "Environment Committee",
  },
  {
    name: "Public Relations Committee",
  },
  {
    name: "Sports Committee",
  },
  {
    name: "Disaster Relief Committee",
  },
  {
    name: "Fellowship Committee",
  },
];

export const COMMITTEE_NAME_LIST =
  COMMITTEE_NAMES.map((item) => item.name);