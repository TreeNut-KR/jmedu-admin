import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { z } from "zod";
import { LoginSchema } from "@/schema";

export default function useLoginMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/login`],
    mutationFn: (data: z.infer<typeof LoginSchema>) => {
      return axios
        .post(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/login`, data)
        .then((res) => res.data);
    },
    onSuccess: async (data) => {
      toast.success(data.message ?? "로그인되었어요.");

      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/auth/status`],
      });

      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/permissions`],
      });

      if (router.pathname.startsWith("/authorization")) {
        router.push("/");
      }
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "로그인에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("로그인에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("로그인에 실패했어요.");
      }
    },
  });
}
