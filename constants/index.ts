import type * as API from "@/types/api";

export const PERMISSIONS = [
  "permissions_view",
  "permission_edit",
  "schools_view",
  "school_view",
  "school_add",
  "school_edit",
  "school_delete",
  "students_view",
  "student_view",
  "student_add",
  "student_edit",
  "student_delete",
  "teachers_view",
  "teacher_view",
  "teacher_edit",
  "teacher_delete",
  "teacher_level_edit",
  "students_attendance_view",
  "admin_log_view",
] as const;

export const SEX = {
  "알 수 없음": 0,
  남자: 1,
  여자: 2,
  "해당 없음": 9,
} as const;

export const THEME = {
  "밝은 화면": "light",
  "어두운 화면": "dark",
  자동: "system",
} as const;

export const MENU_ITEMS = [
  { path: "/", label: "홈", icon: "/tossface/u1F3E0.svg" },
  { path: "/student", label: "학생 관리", icon: "/tossface/u1F9D2_u1F3FB.svg" },
  { path: "/school", label: "학교 관리", icon: "/tossface/u1F3EB.svg" },
  {
    path: "/teacher",
    label: "교직원 관리",
    icon: "/tossface/u1F468_u1F3FB_u200D_u1F3EB.svg",
  },
  {
    path: "/student-attendance",
    label: "등하원 기록",
    icon: "/tossface/u1F6B6_u1F3FB.svg",
  },
  { path: "/admin-log", label: "작업 기록", icon: "/tossface/u1F4CB.svg" },
  { path: "/permission", label: "작업 권한 관리", icon: "/tossface/u1F6E1.svg" },
];

export const PERMISSION_DESCRIPTIONS: { [key in API.Task]: string } = {
  // 권한 관련
  permissions_view: "작업 권한 목록을 조회합니다.",
  permission_edit: "작업 권한을 수정합니다.",
  // 학교 관련
  schools_view: "힉교 목록을 조회합니다.",
  school_view: "특정 학교 정보를 조회합니다.",
  school_add: "새로운 학교를 추가합니다.",
  school_edit: "특정 학교 정보를 수정합니다.",
  school_delete: "특정 학교를 삭제합니다.",
  // 학생 관련
  students_view: "학생 목록을 조회합니다.",
  student_view: "특정 학생 정보를 조회합니다.",
  student_add: "새로운 학생을 추가합니다.",
  student_edit: "특정 학생 정보를 수정합니다.",
  student_delete: "특정 학생을 삭제합니다.",
  // 교직원 관련
  teachers_view: "교직원 목록을 조회합니다.",
  teacher_view: "특정 교직원 정보를 조회합니다.",
  teacher_edit: "특정 교직원 정보를 수정합니다.",
  teacher_delete: "특정 교직원을 삭제합니다.",
  teacher_level_edit: "특정 교직원의 등급을 수정합니다.",
  // 학생 등하원 관련
  students_attendance_view: "학생 등하원 기록을 조회합니다.",
  // 작업 기록 관련
  admin_log_view: "작업 기록을 조회합니다.",
};

export const PERMISSION_DEFAULT_LEVELS: { [key in API.Task]: number } = {
  // 권한 관련
  permissions_view: 2,
  permission_edit: 3,
  // 학교 관련
  schools_view: 1,
  school_view: 1,
  school_add: 3,
  school_edit: 3,
  school_delete: 3,
  // 학생 관련
  students_view: 1,
  student_view: 1,
  student_add: 3,
  student_edit: 3,
  student_delete: 3,
  // 교직원 관련
  teachers_view: 1,
  teacher_view: 1,
  teacher_edit: 3,
  teacher_delete: 3,
  teacher_level_edit: 3,
  // 학생 등하원 관련
  students_attendance_view: 1,
  // 작업 기록 관련
  admin_log_view: 3,
};
