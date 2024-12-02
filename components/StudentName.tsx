import { isAxiosError } from "axios";
import { CircleAlert, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import useGetStudentQuery from "@/hooks/queries/useGetStudentQuery";
import type * as API from "@/types/api";

export default function StudentName(props: { pk: API.Student["student_pk"] }) {
  const student = useGetStudentQuery(props.pk, { includeDeleted: true });

  if (student.isLoading)
    return (
      <span className="inline-flex items-center gap-1 text-adaptiveGray-500">
        <Loader2 size={14} className="animate-spin text-adaptiveBlue-500" />
        불러오는 중
      </span>
    );
  else if (student.error)
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span className="inline-flex items-center gap-1 text-adaptiveRed-500">
              <CircleAlert size={14} />
              에러
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {isAxiosError(student.error)
              ? (student.error.response?.data.message ?? "알 수 없는 에러")
              : student.error.message}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  else if (!student.data?.success) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {student.data?.data ? (
              <span className="italic text-adaptiveGray-500">{student.data.data.name}</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-adaptiveRed-500">
                <CircleAlert size={14} />
                에러
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent>{student.data?.message ?? "알 수 없는 에러"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  } else if (student.data?.data) {
    return student.data.data.name;
  } else {
    return <span className="text-adaptiveRed-500">학생을 찾을 수 없어요.</span>;
  }
}
