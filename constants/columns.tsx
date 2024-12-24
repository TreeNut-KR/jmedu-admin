import { Check } from "lucide-react";
import DeleteSchoolButton from "@/components/buttons/DeleteSchoolButton";
import DeleteStudentButton from "@/components/buttons/DeleteStudentButton";
import DeleteTeacherButton from "@/components/buttons/DeleteTeacherButton";
import ShowStudentQRButton from "@/components/buttons/ShowStudentQRButton";
import UpdatePermissionButton from "@/components/buttons/UpdatePermissionButton";
import UpdateSchoolButton from "@/components/buttons/UpdateSchoolButton";
import UpdateStudentButton from "@/components/buttons/UpdateStudentButton";
import UpdateTeacherButton from "@/components/buttons/UpdateTeacherButton";
import UpdateTeacherLevelButton from "@/components/buttons/UpdateTeacherLevelButton";
import { Badge } from "@/components/shadcn/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import { formatDate, formatPhoneNumber } from "@/utils";
import { PERMISSION_DESCRIPTIONS } from "@/constants/index";
import type * as API from "@/types/api";
import type { ColumnDef } from "@/types/client";

export const STUDENT_COLUMNS: ColumnDef<API.Student> = [
  { accessor: "student_pk", hidden: true },
  {
    header: "이름",
    accessor: "name",
  },
  {
    header: "성별",
    accessor: "sex",
    renderer: (row) => {
      if (typeof row["sex"] !== "number")
        return <Badge variant="outline">올바르지 않은 값({row["sex"]})</Badge>;
      else if (row["sex"] === 0) return <Badge variant="secondary">알 수 없음</Badge>;
      else if (row["sex"] === 1) return <Badge variant="lightBlue">남자</Badge>;
      else if (row["sex"] === 2) return <Badge variant="lightRed">여자</Badge>;
      else if (row["sex"] === 9) return <Badge variant="secondary">해당 없음</Badge>;
    },
  },
  {
    header: "학교",
    accessor: "school",
    renderer: (row) => {
      if (!row.schoolObj || !row.schoolObj.name) {
        return <span className="text-adaptiveRed-500">학교을 찾을 수 없어요.</span>;
      }
      if (row.schoolObj.deleted_at) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-adaptiveGray-400">{row.schoolObj.name}</span>
              </TooltipTrigger>
              <TooltipContent>삭제된 학교입니다.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      return row.schoolObj.name;
    },
  },
  { header: "연락처", accessor: "contact", renderer: (row) => formatPhoneNumber(row["contact"]) },
  {
    header: "부모님 연락처",
    accessor: "contact_parent",
    renderer: (row) => formatPhoneNumber(row["contact_parent"]),
  },
  {
    header: "관리",
    renderer: (row) => (
      <div className="flex gap-2">
        <ShowStudentQRButton pk={row["student_pk"]} />
        <UpdateStudentButton pk={row["student_pk"]} />
        <DeleteStudentButton pk={row["student_pk"]} />
      </div>
    ),
  },
];

export const SCHOOL_COLUMNS: ColumnDef<API.School> = [
  { accessor: "school_pk", hidden: true },
  {
    header: "이름",
    accessor: "name",
  },
  {
    header: "초등학교",
    accessor: "is_elementary",
    renderer: (row) =>
      row["is_elementary"] ? (
        <Check size="14" className="text-adaptiveBlue-500" strokeWidth={3} />
      ) : null,
  },
  {
    header: "중학교",
    accessor: "is_middle",
    renderer: (row) =>
      row["is_middle"] ? (
        <Check size="14" className="text-adaptiveBlue-500" strokeWidth={3} />
      ) : null,
  },
  {
    header: "고등학교",
    accessor: "is_high",
    renderer: (row) =>
      row["is_high"] ? <Check size="14" className="text-adaptiveBlue-500" strokeWidth={3} /> : null,
  },
  {
    header: "관리",
    renderer: (row) => (
      <div className="flex gap-2">
        <UpdateSchoolButton pk={row["school_pk"]} />
        <DeleteSchoolButton pk={row["school_pk"]} />
      </div>
    ),
  },
];

export const STUDENT_ATTENDANCE_COLUMN: ColumnDef<API.StudentAttendance> = [
  { accessor: "attendance_log_pk", hidden: true },
  {
    header: "학생",
    accessor: "student",
    renderer: (row) => {
      if (!row.studentObj || !row.studentObj.name) {
        return <span className="text-adaptiveRed-500">학생을 찾을 수 없어요.</span>;
      }
      if (row.studentObj.deleted_at) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-adaptiveGray-400">{row.studentObj.name}</span>
              </TooltipTrigger>
              <TooltipContent>삭제된 학생입니다.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      return row.studentObj.name;
    },
  },
  {
    header: "출석 여부",
    accessor: "is_attend",
    renderer: (row) =>
      row["is_attend"] ? (
        <Check size="14" className="text-adaptiveBlue-500" strokeWidth={3} />
      ) : null,
  },
  {
    header: "등원 시간",
    accessor: "attend_time",
    renderer: (row) => formatDate(row["attend_time"]),
  },
  {
    header: "하원 시간",
    accessor: "leave_time",
    renderer: (row) => formatDate(row["leave_time"]),
  },
  {
    header: "문자 발송 여부",
    accessor: "sms_sent",
    renderer: (row) =>
      row["sms_sent"] ? (
        <Check size="14" className="text-adaptiveBlue-500" strokeWidth={3} />
      ) : null,
  },
  {
    header: "문자 발송 시간",
    accessor: "sms_sent_time",
    renderer: (row) => formatDate(row["sms_sent_time"]),
  },
];

export const TEACHER_COLUMN: ColumnDef<API.Teacher> = [
  { accessor: "teacher_pk", hidden: true },
  {
    header: "이름",
    accessor: "name",
  },
  {
    header: "성별",
    accessor: "sex",
    renderer: (row) => {
      if (typeof row["sex"] !== "number")
        return <Badge variant="outline">올바르지 않은 값({row["sex"]})</Badge>;
      else if (row["sex"] === 0) return <Badge variant="secondary">알 수 없음</Badge>;
      else if (row["sex"] === 1) return <Badge variant="lightBlue">남자</Badge>;
      else if (row["sex"] === 2) return <Badge variant="lightRed">여자</Badge>;
      else if (row["sex"] === 9) return <Badge variant="secondary">해당 없음</Badge>;
    },
  },
  { header: "연락처", accessor: "contact", renderer: (row) => formatPhoneNumber(row["contact"]) },
  {
    header: "생일",
    accessor: "birthday",
  },
  {
    header: "권한 등급",
    accessor: "admin_level",
  },
  {
    header: "관리",
    renderer: (row) => (
      <div className="flex gap-2">
        <UpdateTeacherButton pk={row["teacher_pk"]} />
        <UpdateTeacherLevelButton pk={row["teacher_pk"]} />
        <DeleteTeacherButton pk={row["teacher_pk"]} />
      </div>
    ),
  },
];

export const PERMISSION_COLUMN: ColumnDef<API.Permission> = [
  { header: "권한", accessor: "task_name" },
  {
    header: "설명",
    renderer: (row) => {
      return PERMISSION_DESCRIPTIONS.hasOwnProperty(row["task_name"])
        ? PERMISSION_DESCRIPTIONS[row["task_name"] as API.Task]
        : "";
    },
  },
  {
    header: "레벨",
    accessor: "level",
  },
  {
    header: "관리",
    renderer: (row) => (
      <div className="flex gap-2">
        <UpdatePermissionButton name={row["task_name"]} />
      </div>
    ),
  },
];

export const ADMIN_LOG_COLUMN: ColumnDef<API.AdminLog> = [
  { header: "색인", accessor: "admin_log_pk" },
  {
    header: "내용",
    accessor: "log",
  },
  {
    header: "교직원",
    accessor: "teacher",
    renderer: (row) => {
      if (!row.teacherObj || !row.teacherObj.name) {
        return <span className="text-adaptiveRed-500">교직원을 찾을 수 없어요.</span>;
      }
      if (row.teacherObj.deleted_at) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-adaptiveGray-400">{row.teacherObj.name}</span>
              </TooltipTrigger>
              <TooltipContent>삭제된 교직원입니다.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
      return row.teacherObj.name;
    },
  },
  {
    header: "시간",
    accessor: "time",
    renderer: (row) => formatDate(row["time"]),
  },
];
