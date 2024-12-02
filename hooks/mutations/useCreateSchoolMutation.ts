import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { z } from "zod";
import { SchoolSchema } from "@/schema";

export default function useCreateSchoolMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: [`/api/school`],
    mutationFn: (data: z.infer<typeof SchoolSchema>) => {
      return axios.post(`/api/school`, data).then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/schools"] });
      toast.success(data.message ?? "학교를 추가했어요.");
      router.push("/school");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "학교 추가에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("학교 추가에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("학교 추가에 실패했어요.");
      }
    },
  });
}
