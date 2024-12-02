import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { z } from "zod";
import { RegistrationSchema } from "@/schema";

export default function useRegistrationMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationKey: [`/api/auth/register`],
    mutationFn: (data: z.infer<typeof RegistrationSchema>) => {
      return axios.post(`/api/auth/register`, data).then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/teachers"] });
      toast.success(data.message ?? "교직원을 등록했어요.");
      router.push("/");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "교직원 등록에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("교직원 등록에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("교직원 등록에 실패했어요.");
      }
    },
  });
}
