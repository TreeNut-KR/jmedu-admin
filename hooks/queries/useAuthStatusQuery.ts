import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type * as API from "@/types/api";

export default function useAuthStatusQuery() {
  return useQuery<API.Response<API.Teacher>>({
    queryKey: ["/api/auth/status"],
    queryFn: () => {
      return axios.get("/api/auth/status").then((res) => res.data);
    },
    refetchInterval: 10 * 1000,
  });
}
