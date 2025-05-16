import { isAxiosError } from "axios";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSunday,
  isSaturday,
  format,
} from "date-fns";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import Select from "@/components/selectors/Select";
import { Button } from "@/components/shadcn/ui/button";
import StudentInfoSummaryTable from "@/components/tables/StudentInfoSummaryTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/tables/Table";
import useGetStudentAttendanceQuery from "@/hooks/queries/useGetStudentAttendanceQuery";
import useCalendarQueryOptions from "@/hooks/useCalendarQueryOptions";
import { cn } from "@/utils/shadcn";
// import { STUDENT_ATTENDANCE_COLUMN } from "@/constants/columns";
import { COMMON_MONTH_OPTIONS, COMMON_YEAR_OPTIONS } from "@/constants/options";
import type * as API from "@/types/api";

export default function ViewStudentAttendanceTable(props: { pk: API.Student["student_pk"] }) {
  const { query, handleChangeYear, handleChangeMonth, handlePreviousMonth, handleNextMonth } =
    useCalendarQueryOptions({
      initYear: new Date().getFullYear(),
      initMonth: new Date().getMonth() + 1,
    });

  const studentAttendance = useGetStudentAttendanceQuery(props.pk, query);

  // 달력
  const startDate = useMemo(() => startOfMonth(new Date(query.year, query.month - 1)), [query]);
  const endDate = useMemo(() => endOfMonth(new Date(query.year, query.month - 1)), [query]);

  const eachWeekOfMonth = useMemo(
    () => eachWeekOfInterval({ start: startDate, end: endDate }),
    [startDate, endDate],
  );

  const lines = useMemo(() => {
    return eachWeekOfMonth.map((firstDateOfWeek) => {
      const startDateOfWeek = startOfWeek(firstDateOfWeek);
      const endDateOfWeek = endOfWeek(firstDateOfWeek);

      return eachDayOfInterval({ start: startDateOfWeek, end: endDateOfWeek });
    });
  }, [eachWeekOfMonth]);

  const attendanceObj = useMemo(() => {
    if (studentAttendance.data?.data) {
      const obj: Record<string, { type: "ATTEND" | "LEAVE"; date: string }[]> = {};

      studentAttendance.data.data.forEach((attendanceLog) => {
        if (attendanceLog.attend_time) {
          const key = format(attendanceLog.attend_time, "yyyy-MM-dd");
          if (!obj[key]) obj[key] = [];
          obj[key] = [...obj[key], { type: "ATTEND", date: attendanceLog.attend_time }];
        }
        if (attendanceLog.leave_time) {
          const key = format(attendanceLog.leave_time, "yyyy-MM-dd");
          if (!obj[key]) obj[key] = [];
          obj[key] = [...obj[key], { type: "LEAVE", date: attendanceLog.leave_time }];
        }
      });

      return obj;
    }
    return {};
  }, [studentAttendance]);

  // 인쇄
  const printContentRef = useRef<HTMLDivElement>(null);
  const printFn = useReactToPrint({
    contentRef: printContentRef,
    pageStyle: `
      @page {
        size: auto;
        margin: 15mm;
      }
    `,
  });

  if (studentAttendance.error) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/tossface/u26A0.svg`}
            width={20}
            height={20}
            alt="warning icon"
          />
          <span>에러가 발생했어요.</span>
        </div>
        <div className="text-sm text-adaptiveGray-700">
          {isAxiosError(studentAttendance.error)
            ? (studentAttendance.error.response?.data.message ?? "알 수 없는 에러")
            : studentAttendance.error.message}
        </div>
      </div>
    );
  }

  if (studentAttendance.isLoading || !studentAttendance.data) {
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        학생 출결 정보를 불러오고 있어요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-10" ref={printContentRef}>
      <div className="flex flex-col gap-y-4">
        <h2 className="text-md font-semibold">학생 정보</h2>
        <StudentInfoSummaryTable pk={props.pk} />
      </div>
      <div className="flex flex-col gap-y-4">
        <h2 className="text-md font-semibold">월별</h2>
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
            <Select
              size="default"
              options={COMMON_YEAR_OPTIONS}
              value={query.year}
              onValueChange={handleChangeYear}
            />
            <Select
              size="default"
              options={COMMON_MONTH_OPTIONS}
              value={query.month}
              onValueChange={handleChangeMonth}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="default"
              variant="outline"
              onClick={handlePreviousMonth}
              disabled={query.year <= 2024 && query.month <= 1}
            >
              이전
            </Button>
            <Button
              size="default"
              variant="outline"
              onClick={handleNextMonth}
              disabled={
                query.year >= new Date().getFullYear() && query.month >= new Date().getMonth() + 1
              }
            >
              다음
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              {["일", "월", "화", "수", "목", "금", "토"].map((column, columnIdx) => {
                return (
                  <TableHead key={column ?? columnIdx} className="w-[14.28%]">
                    {column}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((week, weekIdx) => (
              <TableRow key={`week-${weekIdx}`}>
                {week.map((day) => (
                  <TableCell key={day.toISOString()}>
                    <div className="flex h-full w-full flex-col gap-2">
                      <h3
                        className={cn(
                          "font-semibold",
                          isSunday(day) && "text-adaptiveRed-500",
                          isSaturday(day) && "text-adaptiveBlue-500",
                          !isSameMonth(day, startDate) && "text-adaptiveGray-300",
                        )}
                      >
                        {day.getDate()}
                      </h3>
                      <div className="flex flex-col gap-1 self-end text-xs">
                        {Array.isArray(attendanceObj[format(day, "yyyy-MM-dd")]) &&
                          attendanceObj[format(day, "yyyy-MM-dd")].map((log, logIdx) => (
                            <div key={`${log.type}-${log.date}-${logIdx}`}>
                              <span>{log.type === "ATTEND" ? "등원" : "하원"}</span>
                              <span> - </span>
                              <span>{format(log.date, "HH:mm")}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* <div className="flex flex-col gap-y-4">
        <h2 className="text-md font-semibold">당월 출석 내역</h2>
        <Table>
          <TableHeader>
            <TableRow>
              {STUDENT_ATTENDANCE_COLUMN.map((column, columnIdx) => {
                if (column.hidden) return;
                return (
                  <TableHead
                    key={`student-attendance-header-${column.accessor ?? column.header ?? columnIdx}`}
                  >
                    {column.header ?? column.accessor}
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentAttendance.data.data ? (
              studentAttendance.data.data.map((attendanceLog) => (
                <TableRow
                  key={
                    typeof STUDENT_ATTENDANCE_COLUMN[0].accessor === "object"
                      ? JSON.stringify(attendanceLog[STUDENT_ATTENDANCE_COLUMN[0].accessor])
                      : (attendanceLog[STUDENT_ATTENDANCE_COLUMN[0].accessor] as string | number)
                  }
                >
                  {STUDENT_ATTENDANCE_COLUMN.map((column, columnIdx) => {
                    if (column.hidden) return;
                    return (
                      <TableCell
                        key={`teacher-column-${column.accessor ?? column.header ?? columnIdx}`}
                      >
                        {column.renderer
                          ? column.renderer(attendanceLog)
                          : column.accessor
                            ? typeof attendanceLog[column.accessor] === "object"
                              ? JSON.stringify(attendanceLog[column.accessor])
                              : (attendanceLog[column.accessor] as string | number)
                            : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={999}>데이터가 없습니다.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div> */}
      <div className="text-right">
        <Button className="print:hidden" size="lg" onClick={() => printFn()}>
          인쇄
        </Button>
      </div>
    </div>
  );
}
