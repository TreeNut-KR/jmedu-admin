import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { GetStudentSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useGetStudentQuery(
  pk: API.Student["student_pk"],
  query?: z.infer<typeof GetStudentSchema>,
) {
  return useQuery<API.Response<API.Student>>({
    queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student/${pk}`, query],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student/${pk}`, {
          params: query,
        })
        .then((res) => res.data),
  });
}
