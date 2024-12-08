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
import useGetTeachersQuery from "@/hooks/queries/useGetTeachersQuery";
import useListQueryOptions from "@/hooks/useListQueryOptions";
import { TEACHER_COLUMN } from "@/constants/columns";
import {
  COMMON_LIMIT_OPTIONS,
  COMMON_ORDER_OPTIONS,
  TEACHER_SORT_OPTIONS,
} from "@/constants/options";
import type * as API from "@/types/api";

export default function TeacherTable() {
  const { query, handleChangeLimit, handleChangePage, handleChangeSortBy, handleChangeOrder } =
    useListQueryOptions<API.Teacher>({
      sortOptions: TEACHER_SORT_OPTIONS,
      initLimit: 10,
      initPage: 1,
      initSortBy: TEACHER_SORT_OPTIONS[0].value,
      initOrder: "asc",
    });

  const teachers = useGetTeachersQuery(query);

  if (teachers.error) {
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
          {isAxiosError(teachers.error)
            ? (teachers.error.response?.data.message ?? "알 수 없는 에러")
            : teachers.error.message}
        </div>
      </div>
    );
  }

  if (teachers.isLoading || !teachers.data) {
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        교직원 정보를 불러오고 있어요.
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
            options={TEACHER_SORT_OPTIONS}
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
            {TEACHER_COLUMN.map((column, columnIdx) => {
              if (column.hidden) return;
              return (
                <TableHead key={`${column.accessor ?? `unknown-${columnIdx}`}-header`}>
                  {column.header ?? column.accessor}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.data.data ? (
            teachers.data.data.map((teacher, teacherIdx) => (
              <TableRow
                key={
                  TEACHER_COLUMN[0].accessor
                    ? teacher[TEACHER_COLUMN[0].accessor]
                    : `school-${teacherIdx}`
                }
              >
                {TEACHER_COLUMN.map((column, columnIdx) => {
                  if (column.hidden) return;
                  return (
                    <TableCell key={column.accessor ?? `school-column-${columnIdx}`}>
                      {column.renderer
                        ? column.renderer(teacher)
                        : column.accessor
                          ? teacher[column.accessor]
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
      <Pagination
        total={teachers.data.meta.total}
        limit={query.limit}
        page={query.page}
        size={3}
        setPage={handleChangePage}
      />
    </div>
  );
}
