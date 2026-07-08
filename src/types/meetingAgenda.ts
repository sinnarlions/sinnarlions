export interface AgendaItem {
  serial: number;
  title: string;
  notes: string;
}

export interface MeetingAgenda {
  id?: string;

  meetingId: string;

  preparedBy: string;
  preparedRole: string;

  preparedDate?: any;

  published: boolean;
  publishedAt?: any;
  publishedBy?: string;

  locked: boolean;

  updatedAt?: any;

  [key: string]: any;
}