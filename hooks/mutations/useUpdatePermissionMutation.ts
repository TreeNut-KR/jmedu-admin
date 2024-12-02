import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";
import { z } from "zod";
import { PermissionSchema } from "@/schema";
import type * as API from "@/types/api";

export default function useUpdatePermissionMutation(name: API.Permission["task_name"]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [`/api/permission/${name}`],
    mutationFn: (data: z.infer<typeof PermissionSchema>) => {
      return axios.put(`/api/permission/${name}`, data).then((res) => res.data);
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: [`/api/permission/${name}`] });
      await queryClient.invalidateQueries({ queryKey: ["/api/permissions"] });
      toast.success(data.message ?? "권한을 수정했어요.");
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.message ?? "권한 수정에 실패했어요.");
      } else if (error instanceof Error) {
        toast.error("권한 수정에 실패했어요.", { description: `${error}` });
      } else {
        toast.error("권한 수정에 실패했어요.");
      }
    },
  });
}
