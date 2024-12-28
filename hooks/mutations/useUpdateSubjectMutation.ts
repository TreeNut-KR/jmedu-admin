import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { z } from "zod";
import useRedirectURLQuery from "@/hooks/useRedirectURLQuery";
import { SubjectSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useUpdateSubjectMutation(pk: API.Subject["subject_pk"]) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { redirectURL } = useRedirectURLQuery("/subject");

  return useMutation({
    mutationKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/subject/${pk}`],
    mutationFn: (data: z.infer<typeof SubjectSchema>) => {
      return axios
        .put(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/subject/${pk}`, data)
        .then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/subject/${pk}`],
      });
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/subjects`],
      });
      toast.success(data.message ?? "과목 정보를 수정했어요.");
      router.push(redirectURL ?? "/subject");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "과목 정보 수정에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("과목 정보 수정에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("과목 정보 수정에 실패했어요.");
      }
    },
  });
}
