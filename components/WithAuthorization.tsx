import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";
import useAuthStatusQuery from "@/hooks/queries/useAuthStatusQuery";
import useGetPermissionsQuery from "@/hooks/queries/useGetPermissionsQuery";
import type * as API from "@/types/api";

interface WithAuthorizationProps {
  children: React.ReactNode;
  requiredPermission: API.Task | API.Task[];
  isFallback?: boolean;
}

export default function WithAuthorization(props: WithAuthorizationProps) {
  const authStatus = useAuthStatusQuery();
  const permissions = useGetPermissionsQuery();

  const isFallback = useMemo(() => {
    return !!props.isFallback;
  }, [props.isFallback]);

  const isLogined = useMemo(() => {
    if (authStatus.data?.data) {
      return true;
    } else {
      return false;
    }
  }, [authStatus]);

  const condition = useMemo(() => {
    if (authStatus.data && permissions.data) {
      const requiredPermission = [props.requiredPermission].flat();
      const passedPermissions = requiredPermission.filter((requiredPermission) => {
        const permission = permissions.data?.data?.find((p) => p.task_name === requiredPermission);

        if (
          authStatus.data.data &&
          permission &&
          permission.level <= authStatus.data.data.admin_level
        ) {
          return true;
        } else {
          return false;
        }
      });

      if (requiredPermission.length === passedPermissions.length) {
        return true;
      } else {
        return false;
      }
    } else {
      // 권한 없음
      return false;
    }
  }, [authStatus, permissions, props.requiredPermission]);

  const isLoading = useMemo(() => {
    return authStatus.isLoading || permissions.isLoading;
  }, [authStatus, permissions]);

  const error = useMemo(() => {
    return authStatus.error || permissions.error;
  }, [authStatus, permissions]);

  const cn = "flex w-auto items-center gap-2 rounded-md text-sm font-medium text-adaptiveGray-800 ";

  if (isFallback) {
    if (isLoading)
      return (
        <div className={cn}>
          <Loader2 className="animate-spin text-adaptiveBlue-500" size={18} strokeWidth={2.5} />
          <span>권한을 확인중에요.</span>
        </div>
      );

    if (!isLogined)
      return (
        <div className={cn}>
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/tossface/u26A0.svg`}
            width={18}
            height={18}
            alt="warning icon"
          />
          <span>로그인이 필요해요.</span>
        </div>
      );

    if (error)
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/tossface/u26A0.svg`}
              width={20}
              height={20}
              alt="warning icon"
            />
            <span>에러가 발생했어요.</span>
          </div>
          <div className="text-sm text-adaptiveGray-700">
            {isAxiosError(error)
              ? (error.response?.data.message ?? "알 수 없는 에러")
              : error.message}
          </div>
        </div>
      );

    if (!condition)
      return (
        <div className={cn}>
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH}/tossface/u26A0.svg`}
            width={18}
            height={18}
            alt="warning icon"
          />
          <span>권한이 없어요.</span>
        </div>
      );
  }

  if (condition) return <>{props.children}</>;
}
