export type MemberStatus = "ACTIVE" | "INACTIVE";
export type EventStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type AttendanceStatus = "ATTENDING" | "ABSENT" | "PENDING";

export interface Member {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: MemberStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date | null;
  location: string | null;
  description: string | null;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  memberId: string;
  eventId: string;
  status: AttendanceStatus;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  member?: Member;
  event?: Event;
}

export interface AttendanceWithMember extends Attendance {
  member: Member;
}

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  ACTIVE: "在籍中",
  INACTIVE: "退会済み",
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  SCHEDULED: "予定",
  COMPLETED: "終了",
  CANCELLED: "中止",
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  ATTENDING: "参加予定",
  ABSENT: "欠席",
  PENDING: "未回答",
};
