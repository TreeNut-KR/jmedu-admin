import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type * as API from "@/types/api";

export default function useGetAdminLogQuery(query: API.ListQueryOptions<API.AdminLog>) {
  return useQuery<API.ListResponse<API.AdminLog>>({
    queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/admin-log`, query],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/admin-log`, { params: query })
        .then((res) => res.data),
  });
}
