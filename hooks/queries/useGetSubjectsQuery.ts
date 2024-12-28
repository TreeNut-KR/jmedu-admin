import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { GetSubjectsSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useGetSubjectsQuery(query: z.infer<typeof GetSubjectsSchema>) {
  return useQuery<API.ListResponse<API.Subject>>({
    queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/subjects`, query],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/subjects`, { params: query })
        .then((res) => res.data),
  });
}
