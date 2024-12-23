import { isAxiosError } from "axios";
import { ArrowUpDown, List, Loader2, Tag } from "lucide-react";
import Image from "next/image";
import Pagination from "@/components/Pagination";
import Select from "@/components/selectors/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/tables/Table";
import useGetStudentAttendanceQuery from "@/hooks/queries/useGetStudentAttendanceQuery";
import useListQueryOptions from "@/hooks/useListQueryOptions";
import { STUDENT_ATTENDANCE_COLUMN } from "@/constants/columns";
import {
  COMMON_LIMIT_OPTIONS,
  COMMON_ORDER_OPTIONS,
  STUDENT_ATTENDANCE_SORT_OPTIONS,
} from "@/constants/options";
import type * as API from "@/types/api";

export default function StudentAttendanceTable() {
  const { query, handleChangeLimit, handleChangeSortBy, handleChangeOrder } =
    useListQueryOptions<API.StudentAttendance>({
      sortOptions: STUDENT_ATTENDANCE_SORT_OPTIONS,
      initLimit: 10,
      initPage: 1,
      initSortBy: STUDENT_ATTENDANCE_SORT_OPTIONS[0].value,
      initOrder: "asc",
    });

  const logs = useGetStudentAttendanceQuery(query);

  if (logs.error) {
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
          {isAxiosError(logs.error)
            ? (logs.error.response?.data.message ?? "알 수 없는 에러")
            : logs.error.message}
        </div>
      </div>
    );
  }

  if (logs.isLoading || !logs.data) {
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        등하원 정보를 불러오고 있어요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          <Select
            size="sm"
            options={COMMON_LIMIT_OPTIONS}
            value={query.limit}
            onValueChange={handleChangeLimit}
            left={<List size={12} />}
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            size="sm"
            className={"w-[130px]"}
            options={STUDENT_ATTENDANCE_SORT_OPTIONS}
            value={query.sort}
            onValueChange={handleChangeSortBy}
            left={<Tag size={12} />}
          />
          <Select
            size="sm"
            className={"w-[130px]"}
            options={COMMON_ORDER_OPTIONS}
            value={query.order}
            onValueChange={handleChangeOrder}
            left={<ArrowUpDown size={12} />}
          />
        </div>
      </div>
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
          {logs.data.data ? (
            logs.data.data.map((log) => (
              <TableRow
                key={
                  typeof STUDENT_ATTENDANCE_COLUMN[0].accessor === "object"
                    ? JSON.stringify(log[STUDENT_ATTENDANCE_COLUMN[0].accessor])
                    : (log[STUDENT_ATTENDANCE_COLUMN[0].accessor] as string | number)
                }
              >
                {STUDENT_ATTENDANCE_COLUMN.map((column, columnIdx) => {
                  if (column.hidden) return;
                  return (
                    <TableCell
                      key={`student-attendance-column-${column.accessor ?? column.header ?? columnIdx}`}
                    >
                      {column.renderer
                        ? column.renderer(log)
                        : column.accessor
                          ? typeof log[column.accessor] === "object"
                            ? JSON.stringify(log[column.accessor])
                            : (log[column.accessor] as string | number)
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
      <Pagination total={logs.data.meta.total} limit={query.limit} page={query.page} size={3} />
    </div>
  );
}
