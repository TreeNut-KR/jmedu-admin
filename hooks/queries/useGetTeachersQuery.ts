import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { GetTeachersSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useGetTeachersQuery(query: z.infer<typeof GetTeachersSchema>) {
  return useQuery<API.ListResponse<API.Teacher>>({
    queryKey: ["/api/teachers", query],
    queryFn: () => axios.get(`/api/teachers`, { params: query }).then((res) => res.data),
  });
}
