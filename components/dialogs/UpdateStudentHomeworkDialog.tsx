import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRecoilState, useSetRecoilState } from "recoil";
import { z } from "zod";
import { alertAtom, dialogAtom } from "@/recoil";
import ActionAlert from "@/components/alerts/ActionAlert";
import {
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/dialogs/ResponsiveDialog";
import DatetimeSelector from "@/components/selectors/DatetimeSelector";
import { Button } from "@/components/shadcn/ui/button";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import useUpdateStudentHomeworkMutation from "@/hooks/mutations/useUpdateStudentHomeworkMutation";
import { customErrorMap } from "@/utils";
import { StudentHomeworkSchema } from "@/schema";
import type * as API from "@/types/api";

export default function UpdateStudentHomeworkDialog(props: {
  studentHomework: API.StudentHomework;
}) {
  const setAlert = useSetRecoilState(alertAtom);
  const [dialog, setDialog] = useRecoilState(dialogAtom);

  const { mutate, isPending } = useUpdateStudentHomeworkMutation(
    props.studentHomework.student_homework_pk,
  );

  const form = useForm<z.infer<typeof StudentHomeworkSchema>>({
    resolver: zodResolver(StudentHomeworkSchema, { errorMap: customErrorMap }),
    defaultValues: {
      submitted_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      remarks: "",
    },
  });

  function handleSubmit(values: z.infer<typeof StudentHomeworkSchema>) {
    setAlert({
      state: true,
      content: (
        <ActionAlert
          title={`과제 제출 상태를 수정할까요?`}
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

  if (!props.studentHomework.studentObj) {
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
        <div className="text-sm text-adaptiveGray-700">학생 정보를 가져 올 수 없어요.</div>
      </div>
    );
  }

  return (
    <>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>상태 수정</ResponsiveDialogTitle>
        <ResponsiveDialogDescription>
          {props.studentHomework.studentObj.name} 학생의 과제 제출 상태를 수정합니다.
        </ResponsiveDialogDescription>
      </ResponsiveDialogHeader>
      <form className="flex flex-col gap-8" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="flex flex-col gap-4">
          <fieldset className="grid grid-cols-5 items-center gap-2">
            <Label>제출일</Label>
            <div className="col-span-4 space-y-2">
              <DatetimeSelector {...form.register("submitted_at")} />
              <div className="space-x-2">
                <Button
                  className="col-span-1"
                  variant="lightBlue"
                  size="sm"
                  type="button"
                  onClick={() =>
                    form.setValue("submitted_at", format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"))
                  }
                >
                  현재 시간
                </Button>
                <Button
                  className="col-span-1"
                  variant="lightRed"
                  size="sm"
                  type="button"
                  onClick={() => form.setValue("submitted_at", null)}
                >
                  제출일 제거
                </Button>
              </div>
            </div>
          </fieldset>
          <fieldset className="grid grid-cols-5 items-center gap-2">
            <Label>비고</Label>
            <Textarea className="col-span-4" max={255} {...form.register("remarks")} />
          </fieldset>
        </div>
      </form>
      <ResponsiveDialogFooter>
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
      </ResponsiveDialogFooter>
    </>
  );
}
