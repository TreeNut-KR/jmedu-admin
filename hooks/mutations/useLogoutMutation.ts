import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";

export default function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["/api/auth/logout"],
    mutationFn: () => {
      return axios.post("/api/auth/logout").then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/status"] });
      toast.success(data.message ?? "로그아웃되었어요.");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "로그아웃에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("로그아웃에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("로그아웃에 실패했어요.");
      }
    },
  });
}
