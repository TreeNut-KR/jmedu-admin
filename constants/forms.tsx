import BooleanSelector from "@/components/selectors/BooleanSelector";
import SchoolSelector from "@/components/selectors/SchoolSelector";
import SexSelector from "@/components/selectors/SexSelector";
import TeacherSelector from "@/components/selectors/TeacherSelector";
import { handlePhoneNumber } from "@/utils";
import {
  RegistrationSchema,
  SchoolSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "@/schema";
import type { FormDef } from "@/types/client";

export const TEACHER_LEVEL_EDIT_FORM = [{ id: "old", type: "number" }];

export const REGISTRATION_FORM: FormDef<typeof RegistrationSchema> = [
  {
    type: "string",
    key: "name",
    label: "이름",
  },
  {
    type: "string",
    key: "id",
    label: "아이디",
  },
  {
    type: "password",
    key: "password",
    label: "비밀번호",
  },
  {
    type: "number",
    key: "sex",
    label: "성별",
    custom: SexSelector,
  },
  {
    type: "date",
    key: "birthday",
    label: "생일",
  },
  {
    type: "string",
    key: "contact",
    label: "연락처",
    onChange: handlePhoneNumber,
  },
];

export const STUDENT_FORM: FormDef<typeof StudentSchema> = [
  {
    type: "string",
    key: "name",
    label: "이름",
  },
  {
    type: "number",
    key: "sex",
    label: "성별",
    custom: SexSelector,
  },
  {
    label: "생일",
    key: "birthday",
    type: "date",
  },
  {
    label: "연락처",
    key: "contact",
    type: "string",
    onChange: handlePhoneNumber,
  },
  {
    label: "부모님 연락처",
    key: "contact_parent",
    type: "string",
    onChange: handlePhoneNumber,
  },
  {
    type: "number",
    key: "school",
    label: "학교",
    custom: SchoolSelector,
  },
  {
    label: "결제일",
    key: "payday",
    type: "number",
  },
  {
    label: "등록일",
    key: "firstreg",
    type: "date",
  },
];

export const SCHOOL_FORM: FormDef<typeof SchoolSchema> = [
  {
    type: "string",
    key: "name",
    label: "이름",
  },
  {
    type: "number",
    key: "is_elementary",
    label: "초등학교",
    custom: BooleanSelector,
  },
  {
    type: "number",
    key: "is_middle",
    label: "중학교",
    custom: BooleanSelector,
  },
  {
    type: "number",
    key: "is_high",
    label: "고등학교",
    custom: BooleanSelector,
  },
];

export const TEACHER_FORM: FormDef<typeof TeacherSchema> = [
  {
    type: "string",
    key: "name",
    label: "이름",
  },
  {
    type: "number",
    key: "sex",
    label: "성별",
    custom: SexSelector,
  },
  {
    type: "date",
    key: "birthday",
    label: "생일",
  },
  {
    type: "string",
    key: "contact",
    label: "연락처",
    onChange: handlePhoneNumber,
  },
];

export const SUBJECT_FORM: FormDef<typeof SubjectSchema> = [
  {
    type: "string",
    key: "name",
    label: "이름",
  },
  {
    type: "string",
    key: "teacher",
    label: "담당 강사",
    custom: TeacherSelector,
  },
  {
    type: "number",
    key: "school",
    label: "대상 학교",
    custom: SchoolSelector,
  },
  {
    type: "number",
    key: "grade",
    label: "대학 학년",
  },
  {
    type: "number",
    key: "is_personal",
    label: "1대1 과외 여부",
    custom: BooleanSelector,
  },
];
