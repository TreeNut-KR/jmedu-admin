import { z } from "zod";
import { SEX } from "@/constants";
import {
  TEACHER_SORT_OPTIONS,
  SCHOOL_SORT_OPTIONS,
  STUDENT_ATTENDANCE_SORT_OPTIONS,
  STUDENT_SORT_OPTIONS,
  ADMIN_LOG_SORT_OPTIONS,
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
  level: z.number().min(0).max(3),
});

export const SchoolSchema = z.object({
  name: z.string().min(2).max(50),
  is_elementary: z.coerce.number().gte(0).lte(1),
  is_middle: z.coerce.number().gte(0).lte(1),
  is_high: z.coerce.number().gte(0).lte(1),
});

export const StudentSchema = z.object({
  name: z.string().min(2).max(20),
  sex: z.nativeEnum(SEX),
  birthday: z.string().date(),
  contact: z.string(),
  contact_parent: z.string(),
  school: z.number(),
  payday: z.coerce.number().gte(0).lte(31),
  firstreg: z.string().date(),
});

export const TeacherSchema = z.object({
  name: z.string().min(2).max(20),
  sex: z.nativeEnum(SEX),
  birthday: z.string().date(),
  contact: z.string(),
});

export const TeacherLevelSchema = z.object({ admin_level: z.number().min(0).max(3) });

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
    .default("name"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
  filter: z.enum(["name", "is_elementary", "is_middle", "is_high"]).optional(),
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
    .default("name"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
  filter: z.enum(["name", "birthday", "school", "firstreg", "created_at"]).optional(),
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
    .default("name"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
  filter: z.enum(["name"]).optional(),
  search: z.string().optional(),
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
    .default("attend_time"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
  filter: z.enum(["attend_time"]).optional(),
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
    .default("time"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
  filter: z.enum(["time"]).optional(),
  search: z.string().optional(),
});
