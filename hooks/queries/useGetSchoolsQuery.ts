import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { GetSchoolsSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useGetSchoolsQuery(query: z.infer<typeof GetSchoolsSchema>) {
  return useQuery<API.ListResponse<API.School>>({
    queryKey: ["/api/schools", query],
    queryFn: () => axios.get(`/api/schools`, { params: query }).then((res) => res.data),
  });
}
