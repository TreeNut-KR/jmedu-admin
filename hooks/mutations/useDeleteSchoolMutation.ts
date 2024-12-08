import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import type * as API from "@/types/api";

export default function useDeleteSchoolMutation(pk: API.School["school_pk"]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/school/${pk}`],
    mutationFn: () => {
      return axios
        .delete(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/school/${pk}`)
        .then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: [`${process.env.NEXT_PUBLIC_BASE_PATH}/api/schools`],
      });
      toast.success(data.message ?? "학교를 삭제했어요.");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "학교를 삭제하지 못했어요.");
      } else if (error instanceof Error) {
        toast.error("학교를 삭제하지 못했어요.", { description: `${error}` });
      } else {
        toast.error("학교를 삭제하지 못했어요.");
      }
    },
  });
}
