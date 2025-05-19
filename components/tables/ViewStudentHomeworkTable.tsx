import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
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
import useGetStudentHomeworkQuery from "@/hooks/queries/useGetStudentHomeworkQuery";
import useCalendarQueryOptions from "@/hooks/useCalendarQueryOptions";
import { VIEW_STUDENT_HOMEWORK_COLUMNS } from "@/constants/columns";
import { COMMON_MONTH_OPTIONS, COMMON_YEAR_OPTIONS } from "@/constants/options";
import type * as API from "@/types/api";

export default function ViewStudentHomeworkTable(props: { pk: API.Student["student_pk"] }) {
  const { query, handleChangeYear, handleChangeMonth, handlePreviousMonth, handleNextMonth } =
    useCalendarQueryOptions({
      initYear: new Date().getFullYear(),
      initMonth: new Date().getMonth() + 1,
    });

  const studentHomework = useGetStudentHomeworkQuery(props.pk, query);

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

  if (studentHomework.error) {
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
        <div className="whitespace-pre-line text-sm text-adaptiveGray-700">
          {isAxiosError(studentHomework.error)
            ? (studentHomework.error.response?.data.message ?? "알 수 없는 에러")
            : studentHomework.error.message}
        </div>
      </div>
    );
  }

  if (studentHomework.isLoading || !studentHomework.data) {
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
              {VIEW_STUDENT_HOMEWORK_COLUMNS.map((column, columnIdx) => {
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
            {studentHomework.data.data ? (
              studentHomework.data.data.map((homeworkLog) => (
                <TableRow
                  key={
                    typeof VIEW_STUDENT_HOMEWORK_COLUMNS[0].accessor === "object"
                      ? JSON.stringify(homeworkLog[VIEW_STUDENT_HOMEWORK_COLUMNS[0].accessor])
                      : (homeworkLog[VIEW_STUDENT_HOMEWORK_COLUMNS[0].accessor] as string | number)
                  }
                >
                  {VIEW_STUDENT_HOMEWORK_COLUMNS.map((column, columnIdx) => {
                    if (column.hidden) return;
                    return (
                      <TableCell
                        key={`homework-column-${column.accessor ?? column.header ?? columnIdx}`}
                      >
                        {column.renderer
                          ? column.renderer(homeworkLog)
                          : column.accessor
                            ? typeof homeworkLog[column.accessor] === "object"
                              ? JSON.stringify(homeworkLog[column.accessor])
                              : (homeworkLog[column.accessor] as string | number)
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
      </div>
      <div className="text-right">
        <Button className="print:hidden" size="lg" onClick={() => printFn()}>
          인쇄
        </Button>
      </div>
    </div>
  );
}
