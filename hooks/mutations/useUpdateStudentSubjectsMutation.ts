import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { UpdateStudentSubjectsSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useUpdateStudentSubjectsMutation(pk: API.Student["student_pk"]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student/${pk}/subjects`],
    mutationFn: (data: z.infer<typeof UpdateStudentSubjectsSchema>) => {
      return axios
        .put(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student/${pk}/subjects`, data)
        .then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student/${pk}`],
      });
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student/${pk}/subjects`],
      });
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/students`],
      });
      toast.success(data.message ?? "학생 수강 과목 정보를 수정했어요.");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "학생 수강 과목 정보 수정에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("학생 수강 과목 정보 수정에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("학생 수강 과목 정보 수정에 실패했어요.");
      }
    },
  });
}
