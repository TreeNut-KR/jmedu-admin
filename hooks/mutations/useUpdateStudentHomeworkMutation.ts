import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { StudentHomeworkSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useUpdateStudentHomeworkMutation(
  pk: API.StudentHomework["student_homework_pk"],
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student-homework/${pk}`],
    mutationFn: (data: z.infer<typeof StudentHomeworkSchema>) => {
      return axios
        .put<
          API.Response<API.StudentHomework>
        >(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student-homework/${pk}`, data)
        .then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student-homework/${pk}`],
      });

      if (data.data?.homework_id) {
        await queryClient.invalidateQueries({
          queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/homework/${data.data.homework_id}`],
        });
      }

      toast.success(data.message ?? "과제 정보를 수정했어요.");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "과제 정보 수정에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("과제 정보 수정에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("과제 정보 수정에 실패했어요.");
      }
    },
  });
}
