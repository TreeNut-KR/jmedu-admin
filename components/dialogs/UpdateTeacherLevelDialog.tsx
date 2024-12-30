import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
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
import useUpdateTeacherLevelMutation from "@/hooks/mutations/useUpdateTeacherLevelMutation";
import useGetTeacherQuery from "@/hooks/queries/useGetTeacherQuery";
import { customErrorMap } from "@/utils";
import { TeacherLevelSchema } from "@/schema";
import type * as API from "@/types/api";

export default function UpdateTeacherLevelDialog(props: { pk: API.Teacher["teacher_pk"] }) {
  const setAlert = useSetRecoilState(alertAtom);

  const [dialog, setDialog] = useRecoilState(dialogAtom);

  const getTeacher = useGetTeacherQuery(props.pk);

  const teacher = useMemo(() => {
    if (getTeacher.isLoading) {
      return { isLoading: true, error: undefined, data: undefined };
    }

    if (getTeacher.error) {
      return { isLoading: false, error: getTeacher.error, data: undefined };
    }

    if (typeof getTeacher.data?.data?.admin_level === "number") {
      return { isLoading: false, error: undefined, data: getTeacher.data };
    }

    return {
      isLoading: false,
      error: new Error(`권한 레벨을 찾을 수 없어요.`),
      data: undefined,
    };
  }, [getTeacher]);

  const { mutate, isPending } = useUpdateTeacherLevelMutation(props.pk);

  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<z.infer<typeof TeacherLevelSchema>>({
    resolver: zodResolver(TeacherLevelSchema, { errorMap: customErrorMap }),
    defaultValues: teacher.data?.data
      ? {
          admin_level: teacher.data.data.admin_level,
        }
      : undefined,
  });

  useEffect(() => {
    if (teacher.data?.data) {
      form.reset({
        admin_level: teacher.data.data.admin_level,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacher.data?.data]);

  function handleSubmit(values: z.infer<typeof TeacherLevelSchema>) {
    setAlert({
      state: true,
      content: (
        <ActionAlert
          title={`교직원 ${teacher.data?.data?.name}의 권한을 레벨 ${form.getValues("admin_level")}로 수정할까요?`}
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

  if (teacher.error) {
    return (
      <>
        <GlobalDialogHeader>
          <GlobalDialogTitle className="flex items-center gap-2">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/tossface/u26A0.svg`}
              width={20}
              height={20}
              alt="warning icon"
            />
            에러가 발생했어요.
          </GlobalDialogTitle>
          <GlobalDialogDescription>
            {isAxiosError(teacher.error)
              ? (teacher.error.response?.data.message ?? "알 수 없는 에러")
              : teacher.error.message}
          </GlobalDialogDescription>
        </GlobalDialogHeader>
      </>
    );
  }

  if (teacher.isLoading || !teacher.data || !form.formState.defaultValues) {
    return (
      <GlobalDialogDescription className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        교직원 정보를 불러오고 있어요.
      </GlobalDialogDescription>
    );
  }

  return (
    <>
      <GlobalDialogHeader>
        <GlobalDialogTitle>교직원 {teacher.data.data?.name} 권한 수정</GlobalDialogTitle>
        <GlobalDialogDescription>해당 교직원의 권한을 수정해요.</GlobalDialogDescription>
      </GlobalDialogHeader>
      <form
        ref={formRef}
        className="flex flex-col gap-8"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <div className="flex flex-col gap-4">
          <fieldset className="grid grid-cols-5 items-center gap-2">
            <Label>기존 값</Label>
            <Input
              className="col-span-4"
              type="number"
              value={teacher.data?.data?.admin_level ?? ""}
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
              {...form.register("admin_level", { valueAsNumber: true })}
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
