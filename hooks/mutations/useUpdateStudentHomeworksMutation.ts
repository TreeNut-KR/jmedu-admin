import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { StudentHomeworkSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useUpdateStudentHomeworksMutation(
  pks: API.StudentHomework["student_homework_pk"][],
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: pks.map((pk) => [
      `${process.env.NEXT_PUBLIC_BASE_PATH}/api/student-homework/${pk}`,
    ]),
    mutationFn: (data: z.infer<typeof StudentHomeworkSchema>) => {
      return Promise.allSettled(
        pks.map((pk) =>
          axios.put(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/student-homework/${pk}`, data),
        ),
      );
    },
    onSuccess: async (results) => {
      const successfulUpdates = results.filter((result) => result.status === "fulfilled");
      const failedUpdates = results.filter((result) => result.status === "rejected");

      if (successfulUpdates.length) {
        await queryClient.invalidateQueries({
          queryKey: [
            `${process.env.NEXT_PUBLIC_BASE_PATH}/api/homework/${successfulUpdates[0].value.data.data.homework_id}`,
          ],
        });

        toast.success(`${successfulUpdates.length}개의 과제 제출 현황이 수정되었어요.`);
      }

      if (failedUpdates.length) {
        toast.error(`${successfulUpdates.length}개의 과제 제출 현황 수정에 실패했어요.`);
      }
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "과제 제출 현황 수정에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("과제 제출 현황 수정에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("과제 제출 현황 수정에 실패했어요.");
      }
    },
  });
}
