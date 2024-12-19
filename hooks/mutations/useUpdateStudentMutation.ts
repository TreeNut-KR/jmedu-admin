import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { z } from "zod";
import useRedirectURLQuery from "@/hooks/useRedirectURLQuery";
import { StudentSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useUpdateStudentMutation(pk: API.Student["student_pk"]) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { redirectURL } = useRedirectURLQuery("/student");

  return useMutation({
    mutationKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student/${pk}`],
    mutationFn: (data: z.infer<typeof StudentSchema>) => {
      return axios
        .put(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student/${pk}`, data)
        .then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/students`],
      });
      toast.success(data.message ?? "학생 정보를 수정했어요.");
      router.push(redirectURL ?? "/student");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "학생 정보 수정에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("학생 정보 수정에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("학생 정보 수정에 실패했어요.");
      }
    },
  });
}
