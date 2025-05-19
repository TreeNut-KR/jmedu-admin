import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type * as API from "@/types/api";

export default function useGetStudentHomeworkQuery(
  pk: API.Student["student_pk"],
  query: { year: number; month: number },
) {
  return useQuery<API.ListResponse<API.StudentHomework>>({
    queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student-homework/${pk}`, query],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student-homework/${pk}`, { params: query })
        .then((res) => res.data),
  });
}
