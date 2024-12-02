import { isAxiosError } from "axios";
import { CircleAlert, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import useGetTeacherQuery from "@/hooks/queries/useGetTeacherQuery";
import type * as API from "@/types/api";

export default function TeacherName(props: { pk: API.Teacher["teacher_pk"] }) {
  const teacher = useGetTeacherQuery(props.pk, { includeDeleted: true });

  if (teacher.isLoading)
    return (
      <span className="inline-flex items-center gap-1 text-adaptiveGray-500">
        <Loader2 size={14} className="animate-spin text-adaptiveBlue-500" />
        불러오는 중
      </span>
    );
  else if (teacher.error)
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
            {isAxiosError(teacher.error)
              ? (teacher.error.response?.data.message ?? "알 수 없는 에러")
              : teacher.error.message}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  else if (!teacher.data?.success) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {teacher.data?.data ? (
              <span className="italic text-adaptiveGray-500">{teacher.data.data.name}</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-adaptiveRed-500">
                <CircleAlert size={14} />
                에러
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent>{teacher.data?.message ?? "알 수 없는 에러"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  } else if (teacher.data?.data) {
    return teacher.data.data.name;
  } else {
    return <span className="text-adaptiveRed-500">교직원을 찾을 수 없어요.</span>;
  }
}
