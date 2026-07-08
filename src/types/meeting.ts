export interface Meeting {
  id?: string;

  meetingTitle: string;
  meetingType: string;

  meetingDate: string;
  meetingTime: string;

  venue: string;
  announcement: string;

  status: "Upcoming" | "Completed" | "Cancelled";

  createdBy: string;
  createdByMemberCode: string;
  createdRole: string;

  createdAt?: any;
  updatedAt?: any;
}