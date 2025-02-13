import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { z } from "zod";
import { HomeworkSchema } from "@/schema";

export default function useCreateHomeworkMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/homework`],
    mutationFn: (data: z.infer<typeof HomeworkSchema>) => {
      return axios
        .post(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/homework`, data)
        .then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/homeworks`],
      });
      toast.success(data.message ?? "과제를 추가했어요.");
      router.push("/homework");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "과제 추가에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("과제 추가에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("과제 추가에 실패했어요.");
      }
    },
  });
}
