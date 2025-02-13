import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { z } from "zod";
import useRedirectURLQuery from "@/hooks/useRedirectURLQuery";
import { HomeworkSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useUpdateHomeworkMutation(pk: API.Homework["homework_pk"]) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { redirectURL } = useRedirectURLQuery("/homework");

  return useMutation({
    mutationKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/homework/${pk}`],
    mutationFn: (data: z.infer<typeof HomeworkSchema>) => {
      return axios
        .put(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/homework/${pk}`, data)
        .then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/homework/${pk}`],
      });
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/homeworks`],
      });
      toast.success(data.message ?? "과제를 수정했어요.");
      router.push(redirectURL ?? "/homework");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "과제 수정에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("과제 수정에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("과제 수정에 실패했어요.");
      }
    },
  });
}
