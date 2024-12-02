import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type * as API from "@/types/api";

export default function useGetPermissionsQuery() {
  return useQuery<API.ListResponse<API.Permission>>({
    queryKey: ["/api/permissions"],
    queryFn: () => axios.get("/api/permissions").then((res) => res.data),
  });
}
