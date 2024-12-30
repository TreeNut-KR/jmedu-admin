import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRecoilState, useSetRecoilState } from "recoil";
import { z } from "zod";
import { alertAtom, dialogAtom } from "@/recoil";
import ActionAlert from "@/components/alerts/ActionAlert";
import {
  GlobalDialogDescription,
  GlobalDialogFooter,
  GlobalDialogHeader,
  GlobalDialogTitle,
} from "@/components/dialogs/GlobalDialog";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import useUpdatePermissionMutation from "@/hooks/mutations/useUpdatePermissionMutation";
import useGetPermissionsQuery from "@/hooks/queries/useGetPermissionsQuery";
import { customErrorMap } from "@/utils";
import { PermissionSchema } from "@/schema";
import type * as API from "@/types/api";

export default function UpdatePermissionDialog(props: { name: API.Permission["task_name"] }) {
  const setAlert = useSetRecoilState(alertAtom);
  const [dialog, setDialog] = useRecoilState(dialogAtom);

  const permissions = useGetPermissionsQuery();

  const permission = useMemo(() => {
    if (permissions.isLoading) {
      return { isLoading: true, error: undefined, data: undefined };
    }

    if (permissions.error) {
      return { isLoading: false, error: permissions.error, data: undefined };
    }

    const findPermission = permissions.data?.data?.find(
      (permission) => permission.task_name === props.name,
    );

    if (typeof findPermission?.level === "number") {
      return { isLoading: false, error: undefined, data: findPermission };
    }

    return {
      isLoading: false,
      error: new Error(`권한을 찾을 수 없어요. (${props.name})`),
      data: undefined,
    };
  }, [permissions, props.name]);

  const { mutate, isPending } = useUpdatePermissionMutation(props.name);

  const form = useForm<z.infer<typeof PermissionSchema>>({
    resolver: zodResolver(PermissionSchema, { errorMap: customErrorMap }),
    defaultValues: permission.data
      ? {
          level: permission.data?.level,
        }
      : undefined,
  });

  useEffect(() => {
    if (permission.data) {
      form.reset({
        level: permission.data.level,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission.data]);

  function handleSubmit(values: z.infer<typeof PermissionSchema>) {
    setAlert({
      state: true,
      content: (
        <ActionAlert
          title={`${permission.data?.task_name} 권한의 레벨을 ${form.getValues("level")}로 수정할까요?`}
          description="수정 내용을 즉시 반영되며, 변경된 권한 레벨로 인해 기능을 제한 받을 수 있어요."
          variant="destructive"
          action="수정하기"
          loading="수정하는 중"
          onAction={async () => {
            await mutate(values);
            setDialog(dialog ? { ...dialog, state: false } : undefined);
          }}
        />
      ),
    });
  }

  function handleReset() {
    setAlert({
      state: true,
      content: (
        <ActionAlert
          title="처음부터 다시 작성할까요?"
          description="초기화하게 되면 작성 중이던 내용이 사라져요."
          action="다시 작성하기"
          onAction={() => form.reset()}
        />
      ),
    });
  }

  if (permission.error) {
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
          {isAxiosError(permission.error)
            ? (permission.error.response?.data.message ?? "알 수 없는 에러")
            : permission.error.message}
        </div>
      </div>
    );
  }

  if (permission.isLoading || !permission.data || !form.formState.defaultValues) {
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        권한 정보를 불러오고 있어요.
      </div>
    );
  }

  return (
    <>
      <GlobalDialogHeader>
        <GlobalDialogTitle>{props.name} 권한 레벨 수정</GlobalDialogTitle>
        <GlobalDialogDescription>해당 권한의 레벨을 수정합니다.</GlobalDialogDescription>
      </GlobalDialogHeader>
      <form className="flex flex-col gap-8" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex flex-col gap-4">
          <fieldset className="grid grid-cols-5 items-center gap-2">
            <Label>기존 값</Label>
            <Input
              className="col-span-4"
              type="number"
              value={permission.data?.level ?? ""}
              disabled
            />
          </fieldset>
          <fieldset className="grid grid-cols-5 items-center gap-2">
            <Label>새로운 값</Label>
            <Input
              className="col-span-4"
              type="number"
              min={0}
              max={3}
              {...form.register("level", { valueAsNumber: true })}
            />
          </fieldset>
        </div>
      </form>
      <GlobalDialogFooter>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled={isPending}
          onClick={handleReset}
        >
          초기화
        </Button>
        <Button
          type="button"
          size="lg"
          disabled={isPending}
          onClick={form.handleSubmit(handleSubmit)}
        >
          수정하기
        </Button>
      </GlobalDialogFooter>
    </>
  );
}
