import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { TeacherLevelSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useUpdateTeacherLevelMutation(pk: API.Teacher["teacher_pk"]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/teacher/${pk}/level`],
    mutationFn: (data: z.infer<typeof TeacherLevelSchema>) => {
      return axios
        .put(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/teacher/${pk}/level`, data)
        .then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/teacher/${pk}`],
      });
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/teachers`],
      });
      toast.success(data.message ?? "교직원의 권한을 수정했어요.");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "교직원 권한 수정에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("교직원 권한 수정에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("교직원 권한 수정에 실패했어요.");
      }
    },
  });
}
