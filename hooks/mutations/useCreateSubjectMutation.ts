import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { z } from "zod";
import { SubjectSchema } from "@/schema";

export default function useCreateSubjectMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/subject`],
    mutationFn: (data: z.infer<typeof SubjectSchema>) => {
      return axios
        .post(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/subject`, data)
        .then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/subjects`],
      });
      toast.success(data.message ?? "과목를 추가했어요.");
      router.push("/subject");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "과목 추가에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("과목 추가에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("과목 추가에 실패했어요.");
      }
    },
  });
}
