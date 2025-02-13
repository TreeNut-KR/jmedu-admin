import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { z } from "zod";
import { GetHomeworkSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useGetHomeworkQuery(
  pk: API.Homework["homework_pk"],
  query?: z.infer<typeof GetHomeworkSchema>,
) {
  return useQuery<API.Response<API.Homework>>({
    queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/homework/${pk}`, query],
    queryFn: () =>
      axios
        .get(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/homework/${pk}`, { params: query })
        .then((res) => res.data),
  });
}
