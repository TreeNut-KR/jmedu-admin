import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { GetStudentsSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useGetStudentsQuery(query: z.infer<typeof GetStudentsSchema>) {
  return useQuery<API.ListResponse<API.Student>>({
    queryKey: ["/api/students", query],
    queryFn: () => axios.get(`/api/students`, { params: query }).then((res) => res.data),
  });
}
