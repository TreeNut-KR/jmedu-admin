import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { z } from "zod";
import useRedirectURLQuery from "@/hooks/useRedirectURLQuery";
import { SchoolSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useUpdateSchoolMutation(pk: API.School["school_pk"]) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { redirectURL } = useRedirectURLQuery("/school");

  return useMutation({
    mutationKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/school/${pk}`],
    mutationFn: (data: z.infer<typeof SchoolSchema>) => {
      return axios
        .put(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/school/${pk}`, data)
        .then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/school/${pk}`],
      });
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/schools`],
      });
      toast.success(data.message ?? "학교 정보를 수정했어요.");
      router.push(redirectURL ?? "/school");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "학교 정보 수정에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("학교 정보 수정에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("학교 정보 수정에 실패했어요.");
      }
    },
  });
}
