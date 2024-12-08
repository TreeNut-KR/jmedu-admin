import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type * as API from "@/types/api";

export default function useGetPermissionsQuery() {
  return useQuery<API.ListResponse<API.Permission>>({
    queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/permissions`],
    queryFn: () =>
      axios.get(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/permissions`).then((res) => res.data),
  });
}
