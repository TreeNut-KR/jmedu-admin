import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import WithAuthorization from "@/components/WithAuthorization";
import useGetStudentQuery from "@/hooks/queries/useGetStudentQuery";
import { cn } from "@/utils/shadcn";
import { STUDENT_SUMMARY_COLUMNS } from "@/constants/columns";
import type * as API from "@/types/api";

export default function StudentInfoSummaryTable(props: { pk: API.Student["student_pk"] }) {
  const student = useGetStudentQuery(props.pk);

  if (student.error) {
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
          {isAxiosError(student.error)
            ? (student.error.response?.data.message ?? "알 수 없는 에러")
            : student.error.message}
        </div>
      </div>
    );
  }

  if (student.isLoading || !student.data) {
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        학생 정보를 불러오고 있어요.
      </div>
    );
  }

  return (
    <WithAuthorization requiredPermission={"student_view"}>
      <div className="grid grid-cols-2 border-t">
        {STUDENT_SUMMARY_COLUMNS.map((column) => {
          if (column.hidden) return;
          return (
            <div
              key={column.accessor}
              className={cn(
                "flex w-full divide-x border-b even:border-l",
                STUDENT_SUMMARY_COLUMNS.filter((el) => !el.hidden).length % 2 !== 0 &&
                  "last:col-span-2",
              )}
            >
              <div className="flex min-h-12 w-28 items-center bg-adaptiveGray-100 px-4 py-2 text-left text-sm font-bold text-adaptiveGray-600">
                {column.header ?? column.accessor}
              </div>
              <div className="flex min-h-12 items-center px-4 py-2 text-sm">
                {student.data.data && column.renderer
                  ? column.renderer(student.data.data)
                  : student.data.data && column.accessor
                    ? typeof student.data.data[column.accessor] === "object"
                      ? JSON.stringify(student.data.data[column.accessor])
                      : (student.data.data[column.accessor] as string | number)
                    : null}
              </div>
            </div>
          );
        })}
      </div>
    </WithAuthorization>
  );
}
