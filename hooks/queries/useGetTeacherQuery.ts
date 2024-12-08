import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { GetTeacherSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useGetTeacherQuery(
  pk: API.Teacher["teacher_pk"],
  query?: z.infer<typeof GetTeacherSchema>,
) {
  return useQuery<API.Response<API.Teacher>>({
    queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/teacher/${pk}`, query],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/teacher/${pk}`, { params: query })
        .then((res) => res.data),
  });
}
