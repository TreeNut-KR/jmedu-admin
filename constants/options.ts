import { SEX } from "@/constants";
import type * as API from "@/types/api";
import type * as Client from "@/types/client";

export const COMMON_LIMIT_OPTIONS: Client.SelectorOption<number>[] = [
  { value: 5, label: "5줄" },
  { value: 10, label: "10줄" },
  { value: 15, label: "15줄" },
  { value: 20, label: "20줄" },
];

export const COMMON_ORDER_OPTIONS: Client.SelectorOption<"asc" | "desc">[] = [
  { value: "asc", label: "오름차순" },
  { value: "desc", label: "내림차순" },
];

export const SEX_OPTIONS: Client.SelectorOption<API.Sex>[] = Object.entries(SEX).map((arr) => ({
  label: arr[0],
  value: arr[1],
}));

export const THEME_OPTIONS: Client.SelectorOption<Client.Theme>[] = [
  { value: "light", label: "라이트 모드" },
  { value: "dark", label: "다크 모드" },
  { value: "system", label: "자동" },
];

export const SCHOOL_SORT_OPTIONS: Client.SelectorOption<keyof API.School>[] = [
  { value: "name", label: "이름" },
  { value: "school_pk", label: "학교 번호" },
  { value: "created_at", label: "생성일" },
];

export const TEACHER_SORT_OPTIONS: Client.SelectorOption<keyof API.Teacher>[] = [
  { value: "name", label: "이름" },
  { value: "sex", label: "성별" },
  { value: "created_at", label: "생성일" },
  { value: "updated_at", label: "수정일" },
];

export const STUDENT_SORT_OPTIONS: Client.SelectorOption<keyof API.Student>[] = [
  { value: "name", label: "이름" },
  { value: "school", label: "학교" },
  { value: "sex", label: "성별" },
  { value: "birthday", label: "생일" },
  { value: "firstreg", label: "등록일" },
  { value: "created_at", label: "생성일" },
];

export const STUDENT_ATTENDANCE_SORT_OPTIONS: Client.SelectorOption<keyof API.StudentAttendance>[] =
  [
    { value: "attend_time", label: "등원 시간" },
    { value: "leave_time", label: "하원 시간" },
  ];

export const ADMIN_LOG_SORT_OPTIONS: Client.SelectorOption<keyof API.AdminLog>[] = [
  { value: "time", label: "시간" },
  { value: "teacher", label: "교직원" },
];
