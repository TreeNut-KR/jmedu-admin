import { isAxiosError } from "axios";
import { ArrowUpDown, List, Loader2, Plus, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import Select from "@/components/selectors/Select";
import { Button } from "@/components/shadcn/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/tables/Table";
import useGetHomeworksQuery from "@/hooks/queries/useGetHomeworksQuery";
import useListQueryOptions from "@/hooks/useListQueryOptions";
import { HOMEWORK_COLUMNS } from "@/constants/columns";
import {
  COMMON_LIMIT_OPTIONS,
  COMMON_ORDER_OPTIONS,
  HOMEWORK_SORT_OPTIONS,
} from "@/constants/options";
import type * as API from "@/types/api";

export default function HomeworkTable() {
  const { query, handleChangeLimit, handleChangeSortBy, handleChangeOrder } =
    useListQueryOptions<API.Homework>({
      sortOptions: HOMEWORK_SORT_OPTIONS,
      initLimit: 10,
      initPage: 1,
      initSortBy: "created_at",
      initOrder: "asc",
    });

  const homeworks = useGetHomeworksQuery(query);

  if (homeworks.error) {
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
          {isAxiosError(homeworks.error)
            ? (homeworks.error.response?.data.message ?? "알 수 없는 에러")
            : homeworks.error.message}
        </div>
      </div>
    );
  }

  if (homeworks.isLoading || !homeworks.data) {
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        과제 정보를 불러오고 있어요.
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
          <Button variant="secondary" asChild>
            <Link href="/homework/new" className="text-xs">
              <Plus size={14} />
              과제 추가하기
            </Link>
          </Button>
          <Select
            size="sm"
            className={"w-[130px]"}
            options={HOMEWORK_SORT_OPTIONS}
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
            {HOMEWORK_COLUMNS.map((column, columnIdx) => {
              if (column.hidden) return;
              return (
                <TableHead key={`homework-header-${column.accessor ?? column.header ?? columnIdx}`}>
                  {column.header ?? column.accessor}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {homeworks.data.data ? (
            homeworks.data.data.map((homework) => (
              <TableRow
                key={
                  typeof HOMEWORK_COLUMNS[0].accessor === "object"
                    ? JSON.stringify(homework[HOMEWORK_COLUMNS[0].accessor])
                    : (homework[HOMEWORK_COLUMNS[0].accessor] as string | number)
                }
              >
                {HOMEWORK_COLUMNS.map((column, columnIdx) => {
                  if (column.hidden) return;
                  return (
                    <TableCell
                      key={`homework-column-${column.accessor ?? column.header ?? columnIdx}`}
                    >
                      {column.renderer
                        ? column.renderer(homework)
                        : column.accessor
                          ? typeof homework[column.accessor] === "object"
                            ? JSON.stringify(homework[column.accessor])
                            : (homework[column.accessor] as string | number)
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
        total={homeworks.data.meta.total}
        limit={query.limit}
        page={query.page}
        size={3}
      />
    </div>
  );
}
