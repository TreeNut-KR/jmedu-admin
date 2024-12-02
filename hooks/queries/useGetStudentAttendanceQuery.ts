import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type * as API from "@/types/api";

export default function useGetStudentAttendanceQuery(
  query: API.ListQueryOptions<API.StudentAttendance>,
) {
  return useQuery<API.ListResponse<API.StudentAttendance>>({
    queryKey: ["/api/student-attendance", query],
    queryFn: () => axios.get(`/api/student-attendance`, { params: query }).then((res) => res.data),
  });
}
