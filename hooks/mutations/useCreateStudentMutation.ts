import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { z } from "zod";
import { StudentSchema } from "@/schema";

export default function useCreateStudentMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student`],
    mutationFn: (data: z.infer<typeof StudentSchema>) => {
      return axios
        .post(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student`, data)
        .then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/students`],
      });
      toast.success(data.message ?? "학생을 추가했어요.");
      router.push("/student");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "학생 추가에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("학생 추가에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("학생 추가에 실패했어요.");
      }
    },
  });
}
