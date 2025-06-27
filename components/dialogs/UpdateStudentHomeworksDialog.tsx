import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Image from "next/image";
import { overlay } from "overlay-kit";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ActionAlert from "@/components/alerts/ActionAlert";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/dialogs/ResponsiveDialog";
import DatetimeSelector from "@/components/selectors/DatetimeSelector";
import { Button } from "@/components/shadcn/ui/button";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import useUpdateStudentHomeworksMutation from "@/hooks/mutations/useUpdateStudentHomeworksMutation";
import { customErrorMap } from "@/utils";
import { StudentHomeworkSchema } from "@/schema";
import type * as API from "@/types/api";

export default function UpdateStudentHomeworksDialog(props: {
  state: boolean;
  close: () => void;
  studentHomeworks: API.StudentHomework[];
}) {
  const { mutate, isPending } = useUpdateStudentHomeworksMutation(
    props.studentHomeworks.map((el) => el.student_homework_pk),
  );

  const form = useForm<z.infer<typeof StudentHomeworkSchema>>({
    resolver: zodResolver(StudentHomeworkSchema, { errorMap: customErrorMap }),
    defaultValues: {
      submitted_at: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      remarks: "",
    },
  });

  const handleChangeOpen = useCallback(
    (state: boolean) => {
      if (!state) props.close();
    },
    [props],
  );

  function handleSubmit(values: z.infer<typeof StudentHomeworkSchema>) {
    overlay.open(({ isOpen, close }) => {
      return (
        <ActionAlert
          state={isOpen}
          close={close}
          title={`제출 상태를 일괄 수정할까요?`}
          variant="destructive"
          action="수정하기"
          loading="수정하는 중"
          onAction={async () => {
            await mutate(values);
            props.close();
          }}
        />
      );
    });
  }

  function handleReset() {
    overlay.open(({ isOpen, close }) => {
      return (
        <ActionAlert
          state={isOpen}
          close={close}
          title="처음부터 다시 작성할까요?"
          description="초기화하게 되면 작성 중이던 내용이 사라져요."
          action="다시 작성하기"
          onAction={() => form.reset()}
        />
      );
    });
  }

  if (props.studentHomeworks.find((studnetHomework) => studnetHomework.studentObj === null)) {
    return (
      <ResponsiveDialog open={props.state} onOpenChange={handleChangeOpen}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="sr-only"></ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="flex flex-col gap-2">
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
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    );
  }

  return (
    <ResponsiveDialog open={props.state} onOpenChange={handleChangeOpen}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>선택 대상 상태 수정</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {props.studentHomeworks.map((el) => el.studentObj?.name ?? "알 수 없음").join(", ")}{" "}
            학생의 과제 제출 상태를 수정합니다.
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
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
