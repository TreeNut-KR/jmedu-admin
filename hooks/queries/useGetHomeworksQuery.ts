import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { GetHomeworksSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useGetHomeworksQuery(query: z.infer<typeof GetHomeworksSchema>) {
  return useQuery<API.ListResponse<API.Homework>>({
    queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/homeworks`, query],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/homeworks`, { params: query })
        .then((res) => res.data),
  });
}
