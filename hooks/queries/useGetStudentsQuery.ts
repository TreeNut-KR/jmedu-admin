import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { GetStudentsSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useGetStudentsQuery(query: z.infer<typeof GetStudentsSchema>) {
  return useQuery<API.ListResponse<API.Student>>({
    queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/students`, query],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/students`, { params: query })
        .then((res) => res.data),
  });
}
