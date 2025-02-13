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
  filter?: keyof T;
  search?: string;
}

export interface LocalListQueryOptions<T = unknown> {
  [key: string]: Partial<ListQueryOptions<T>> | null;
}

export interface InitListQueryOptions<T> {
  sortOptions: [{ value: keyof T; label: string }, ...{ value: keyof T; label: string }[]];
  initPage?: number;
  initLimit?: number;
  initSortBy?: keyof T;
  initOrder?: "asc" | "desc";
}

export type Task = (typeof PERMISSIONS)[number];

export interface Permission {
  task_name: Task;
  level: null | number;
  created_at: null | string;
  updated_at: null | string;
  deleted_at: null | string;
}

export type Sex = (typeof SEX)[keyof typeof SEX];

export interface Student {
  student_pk: string;
  name: null | string;
  sex: Sex;
  grade: null | number;
  birthday: null | string; // ISO 8601 date string
  contact: null | string;
  contact_parent: null | string;
  school: null | number;
  schoolObj: null | Pick<School, "name" | "deleted_at">;
  subjects: number[];
  payday: null | number;
  firstreg: null | string; // ISO 8601 date string
  is_enable: null | number;
  created_at: null | string; // ISO 8601 date string
  updated_at: null | string; // ISO 8601 date string
  deleted_at: null | string; // Can be null if not deleted
}

export interface School {
  school_pk: number;
  name: null | string;
  is_elementary: null | number;
  is_high: null | number;
  is_middle: null | number;
  created_at: null | string;
  updated_at: null | string;
  deleted_at: null | string;
}

export interface Teacher {
  teacher_pk: string;
  name: null | string;
  sex: Sex;
  birthday: null | string;
  contact: null | string;
  admin_level: null | number;
  created_at: null | string;
  updated_at: null | string;
  deleted_at: null | string;
}

export interface Subject {
  subject_pk: number;
  name: null | string;
  teacher: null | string;
  teacherObj: null | Pick<Teacher, "name" | "deleted_at">;
  school: null | number;
  schoolObj: null | Pick<School, "name" | "deleted_at">;
  grade: null | number;
  is_personal: null | number;
  created_at: null | string;
  updated_at: null | string;
  deleted_at: null | string;
}

export interface Homework {
  homework_pk: number;
  subject_id: null | number;
  subjectObj: null | Pick<Subject, "name" | "deleted_at">;
  students: string[];
  student_homeworks: StudentHomework[];
  title: null | string;
  description: null | string;
  due_date: null | string;
  created_at: null | string;
  updated_at: null | string;
  deleted_at: null | string;
}

export interface StudentSubject {
  student_subject_pk: number;
  student_id: null | string;
  subject_id: null | number;
  subjectObj: null | Subject;
  created_at: null | string;
  updated_at: null | string;
  deleted_at: null | string;
}

export interface StudentHomework {
  student_homework_pk: number;
  homework_id: null | number;
  student_id: null | string;
  studentObj: null | Pick<Student, "name" | "deleted_at">;
  remarks: null | string;
  submitted_at: null | string;
  created_at: null | string;
  updated_at: null | string;
  deleted_at: null | string;
}

export interface StudentAttendance {
  attendance_log_pk: number;
  student: null | string;
  studentObj: null | Pick<Student, "name" | "deleted_at">;
  is_attend: null | number;
  attend_time: null | string; // ISO 8601 date string
  leave_time: null | string; // ISO 8601 date string
  sms_sent: null | number;
  sms_sent_time: null | string; // ISO 8601 date string
}

export interface AdminLog {
  admin_log_pk: number;
  teacher: null | string;
  teacherObj: null | Pick<Teacher, "name" | "deleted_at">;
  time: null | string; // ISO 8601 date string
  log: null | string;
}
