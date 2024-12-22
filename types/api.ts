import { PERMISSIONS, SEX } from "@/constants";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Response<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ListResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T[];
  meta: { total: number };
}

export interface ListQueryOptions<T = unknown> {
  page: number;
  limit: number;
  sort: keyof T;
  order: "asc" | "desc";
}

export interface InitListQueryOptions<T = unknown> {
  sortOptions: { value: keyof T; label: string }[];
  initPage?: number;
  initLimit?: number;
  initSortBy?: keyof T;
  initOrder?: "asc" | "desc";
}

export type Task = (typeof PERMISSIONS)[number];

export interface Permission {
  task_name: Task;
  level: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type Sex = (typeof SEX)[keyof typeof SEX];

export interface Student {
  student_pk: string;
  name: string;
  sex: Sex;
  grade: number;
  birthday: string; // ISO 8601 date string
  contact: string;
  contact_parent: string;
  school: number;
  schoolObj: null | Pick<School, "name" | "deleted_at">;
  payday: number;
  firstreg: string; // ISO 8601 date string
  is_enable: number;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  deleted_at: string | null; // Can be null if not deleted
  school_name: string;
}

export interface School {
  school_pk: number;
  created_at: string;
  deleted_at: string | null;
  is_elementary: number;
  is_high: number;
  is_middle: number;
  name: string;
  updated_at: string;
}

export interface Teacher {
  teacher_pk: string;
  name: string;
  sex: Sex;
  birthday: string;
  contact: string;
  admin_level: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface StudentAttendance {
  attendance_log_pk: number;
  student: string;
  studentObj: null | Pick<Student, "name" | "deleted_at">;
  is_attend: number;
  attend_time: string; // ISO 8601 date string
  leave_time: string; // ISO 8601 date string
  sms_sent: number;
  sms_sent_time: string; // ISO 8601 date string
}

export interface AdminLog {
  admin_log_pk: number;
  teacher: string;
  teacherObj: null | Pick<Teacher, "name" | "deleted_at">;
  time: string; // ISO 8601 date string
  log: string;
}
