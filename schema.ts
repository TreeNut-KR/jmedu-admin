import { z } from "zod";
import { SEX } from "@/constants";
import {
  TEACHER_SORT_OPTIONS,
  SCHOOL_SORT_OPTIONS,
  STUDENT_ATTENDANCE_SORT_OPTIONS,
  STUDENT_SORT_OPTIONS,
  ADMIN_LOG_SORT_OPTIONS,
  SUBJECT_SORT_OPTIONS,
  COMMON_ORDER_OPTIONS,
} from "@/constants/options";

export const RegistrationSchema = z.object({
  name: z.string().min(2).max(20),
  id: z.string().min(2).max(20),
  password: z.string().min(2).max(255),
  sex: z.nativeEnum(SEX),
  birthday: z.string().date(),
  contact: z.string(),
});

export const LoginSchema = z.object({
  id: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
});

export const PermissionSchema = z.object({
  level: z.number().min(0).max(3).nullable(),
});

export const SchoolSchema = z.object({
  name: z.string().min(2).max(50).nullable(),
  is_elementary: z.coerce.number().gte(0).lte(1).nullable(),
  is_middle: z.coerce.number().gte(0).lte(1).nullable(),
  is_high: z.coerce.number().gte(0).lte(1).nullable(),
});

export const StudentSchema = z.object({
  name: z.string().min(2).max(20).nullable(),
  sex: z.nativeEnum(SEX),
  birthday: z.string().date().nullable(),
  contact: z.string().nullable(),
  contact_parent: z.string().nullable(),
  school: z.number().nullable(),
  subjects: z.number().array(),
  payday: z.coerce.number().gte(0).lte(31).nullable(),
  firstreg: z.string().date().nullable(),
});

export const TeacherSchema = z.object({
  name: z.string().min(2).max(20).nullable(),
  sex: z.nativeEnum(SEX),
  birthday: z.string().date().nullable(),
  contact: z.string().nullable(),
  admin_level: z.number().min(0).max(3).nullable(),
});

export const SubjectSchema = z.object({
  name: z.string().min(2).max(20).nullable(),
  teacher: z.string().min(36).nullable(),
  school: z.number().nullable(),
  grade: z.number().nullable(),
  is_personal: z.coerce.number().gte(0).lte(1).nullable(),
});

export const GetSchoolSchema = z.object({
  includeDefault: z.preprocess((val) => val === "true", z.boolean().optional()),
  includeDeleted: z.preprocess((val) => val === "true", z.boolean().optional()),
});

export const GetSchoolsSchema = z.object({
  page: z.coerce.number().gte(1).optional().default(1),
  limit: z.coerce.number().gte(0).optional().default(10),
  sort: z
    .enum([SCHOOL_SORT_OPTIONS[0].value, ...SCHOOL_SORT_OPTIONS.slice(1).map((el) => el.value)])
    .optional()
    .default(SCHOOL_SORT_OPTIONS[0].value),
  order: z
    .enum([COMMON_ORDER_OPTIONS[0].value, ...COMMON_ORDER_OPTIONS.slice(1).map((el) => el.value)])
    .optional()
    .default(COMMON_ORDER_OPTIONS[0].value),
  filter: z
    .enum([SCHOOL_SORT_OPTIONS[0].value, ...SCHOOL_SORT_OPTIONS.slice(1).map((el) => el.value)])
    .optional(),
  search: z.string().optional(),
  includeDefault: z.preprocess((val) => val === "true", z.boolean().optional()),
  includeDeleted: z.preprocess((val) => val === "true", z.boolean().optional()),
});

export const GetStudentSchema = z.object({
  includeDeleted: z.preprocess((val) => val === "true", z.boolean().optional()),
});

export const GetStudentsSchema = z.object({
  page: z.coerce.number().gte(1).optional().default(1),
  limit: z.coerce.number().gte(0).optional().default(10),
  sort: z
    .enum([STUDENT_SORT_OPTIONS[0].value, ...STUDENT_SORT_OPTIONS.slice(1).map((el) => el.value)])
    .optional()
    .default(STUDENT_SORT_OPTIONS[0].value),
  order: z
    .enum([COMMON_ORDER_OPTIONS[0].value, ...COMMON_ORDER_OPTIONS.slice(1).map((el) => el.value)])
    .optional()
    .default(COMMON_ORDER_OPTIONS[0].value),
  filter: z
    .enum([STUDENT_SORT_OPTIONS[0].value, ...STUDENT_SORT_OPTIONS.slice(1).map((el) => el.value)])
    .optional(),
  search: z.string().optional(),
  includeDeleted: z.preprocess((val) => val === "true", z.boolean().optional()),
});

export const GetTeacherSchema = z.object({
  includeDeleted: z.preprocess((val) => val === "true", z.boolean().optional()),
});

export const GetTeachersSchema = z.object({
  page: z.coerce.number().gte(1).optional().default(1),
  limit: z.coerce.number().gte(0).optional().default(10),
  sort: z
    .enum([TEACHER_SORT_OPTIONS[0].value, ...TEACHER_SORT_OPTIONS.slice(1).map((el) => el.value)])
    .optional()
    .default(TEACHER_SORT_OPTIONS[0].value),
  order: z
    .enum([COMMON_ORDER_OPTIONS[0].value, ...COMMON_ORDER_OPTIONS.slice(1).map((el) => el.value)])
    .optional()
    .default(COMMON_ORDER_OPTIONS[0].value),
  filter: z
    .enum([TEACHER_SORT_OPTIONS[0].value, ...TEACHER_SORT_OPTIONS.slice(1).map((el) => el.value)])
    .optional(),
  search: z.string().optional(),
  includeDeleted: z.preprocess((val) => val === "true", z.boolean().optional()),
});

export const GetSubjectsSchema = z.object({
  page: z.coerce.number().gte(1).optional().default(1),
  limit: z.coerce.number().gte(0).optional().default(10),
  sort: z
    .enum([SUBJECT_SORT_OPTIONS[0].value, ...SUBJECT_SORT_OPTIONS.slice(1).map((el) => el.value)])
    .optional()
    .default(SUBJECT_SORT_OPTIONS[0].value),
  order: z
    .enum([COMMON_ORDER_OPTIONS[0].value, ...COMMON_ORDER_OPTIONS.slice(1).map((el) => el.value)])
    .optional()
    .default(COMMON_ORDER_OPTIONS[0].value),
  filter: z
    .enum([SUBJECT_SORT_OPTIONS[0].value, ...SUBJECT_SORT_OPTIONS.slice(1).map((el) => el.value)])
    .optional(),
  search: z.string().optional(),
  includeDeleted: z.preprocess((val) => val === "true", z.boolean().optional()),
});

export const GetSubjectSchema = z.object({
  includeDeleted: z.preprocess((val) => val === "true", z.boolean().optional()),
});

export const GetStudentAttendanceSchema = z.object({
  page: z.coerce.number().gte(1).optional().default(1),
  limit: z.coerce.number().gte(0).optional().default(10),
  sort: z
    .enum([
      STUDENT_ATTENDANCE_SORT_OPTIONS[0].value,
      ...STUDENT_ATTENDANCE_SORT_OPTIONS.slice(1).map((el) => el.value),
    ])
    .optional()
    .default(STUDENT_ATTENDANCE_SORT_OPTIONS[0].value),
  order: z
    .enum([COMMON_ORDER_OPTIONS[0].value, ...COMMON_ORDER_OPTIONS.slice(1).map((el) => el.value)])
    .optional()
    .default(COMMON_ORDER_OPTIONS[1].value),
  filter: z
    .enum([
      STUDENT_ATTENDANCE_SORT_OPTIONS[0].value,
      ...STUDENT_ATTENDANCE_SORT_OPTIONS.slice(1).map((el) => el.value),
    ])
    .optional(),
  search: z.string().optional(),
});

export const GetAdminLogSchema = z.object({
  page: z.coerce.number().gte(1).optional().default(1),
  limit: z.coerce.number().gte(0).optional().default(10),
  sort: z
    .enum([
      ADMIN_LOG_SORT_OPTIONS[0].value,
      ...ADMIN_LOG_SORT_OPTIONS.slice(1).map((el) => el.value),
    ])
    .optional()
    .default(ADMIN_LOG_SORT_OPTIONS[0].value),
  order: z
    .enum([COMMON_ORDER_OPTIONS[0].value, ...COMMON_ORDER_OPTIONS.slice(1).map((el) => el.value)])
    .optional()
    .default(COMMON_ORDER_OPTIONS[1].value),
  filter: z
    .enum([
      ADMIN_LOG_SORT_OPTIONS[0].value,
      ...ADMIN_LOG_SORT_OPTIONS.slice(1).map((el) => el.value),
    ])
    .optional(),
  search: z.string().optional(),
});
