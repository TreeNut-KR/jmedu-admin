import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type * as API from "@/types/api";

export default function useGetStudentAttendancesQuery(
  query: API.ListQueryOptions<API.StudentAttendance>,
) {
  return useQuery<API.ListResponse<API.StudentAttendance>>({
    queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student-attendances`, query],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student-attendances`, { params: query })
        .then((res) => res.data),
  });
}
