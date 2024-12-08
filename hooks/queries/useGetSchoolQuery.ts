import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { GetSchoolSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useGetSchoolQuery(
  pk: API.School["school_pk"],
  query?: z.infer<typeof GetSchoolSchema>,
) {
  return useQuery<API.Response<API.School>>({
    queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/school/${pk}`, query],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/school/${pk}`, { params: query })
        .then((res) => res.data),
  });
}
