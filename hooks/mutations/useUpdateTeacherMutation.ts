import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { z } from "zod";
import { TeacherSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useUpdateTeacherMutation(pk: API.Teacher["teacher_pk"]) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: [`/api/teacher/${pk}`],
    mutationFn: (data: z.infer<typeof TeacherSchema>) => {
      return axios.put(`/api/teacher/${pk}`, data).then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast.success(data.message ?? "교직원 정보를 수정했어요.");
      router.push("/teacher");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "교직원 정보 수정에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("교직원 정보 수정에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("교직원 정보 수정에 실패했어요.");
      }
    },
  });
}
