import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { GetSubjectSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useGetSubjectQuery(
  pk: API.Subject["subject_pk"],
  query?: z.infer<typeof GetSubjectSchema>,
) {
  return useQuery<API.Response<API.Subject>>({
    queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/subject/${pk}`, query],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/subject/${pk}`, { params: query })
        .then((res) => res.data),
  });
}
