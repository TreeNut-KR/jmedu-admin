import { isAxiosError } from "axios";
import { CircleAlert, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import useGetSchoolQuery from "@/hooks/queries/useGetSchoolQuery";
import type * as API from "@/types/api";

export default function SchoolName(props: { pk: API.School["school_pk"] }) {
  const school = useGetSchoolQuery(props.pk, { includeDefault: true, includeDeleted: true });

  if (school.isLoading)
    return (
      <span className="inline-flex items-center gap-1 text-adaptiveGray-500">
        <Loader2 size={14} className="animate-spin text-adaptiveBlue-500" />
        불러오는 중
      </span>
    );
  else if (school.error)
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
            {isAxiosError(school.error)
              ? (school.error.response?.data.message ?? "알 수 없는 에러")
              : school.error.message}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  else if (!school.data?.success) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {school.data?.data ? (
              <span className="italic text-adaptiveGray-500">{school.data.data.name}</span>
            ) : (
              <span className="inline-flex items-center gap-1 text-adaptiveRed-500">
                <CircleAlert size={14} />
                에러
              </span>
            )}
          </TooltipTrigger>
          <TooltipContent>{school.data?.message ?? "알 수 없는 에러"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  } else if (school.data.data) {
    return school.data.data.name;
  } else {
    return <span className="text-adaptiveRed-500">학교을 찾을 수 없어요.</span>;
  }
}
