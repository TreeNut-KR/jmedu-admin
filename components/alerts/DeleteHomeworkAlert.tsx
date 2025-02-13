import { isAxiosError } from "axios";
import { josa } from "es-hangul";
import { Loader2 } from "lucide-react";
import { MouseEvent, useRef } from "react";
import {
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
} from "@/components/shadcn/ui/alert-dialog";
import useDeleteHomeworkMutation from "@/hooks/mutations/useDeleteHomeworkMutation";
import useGetHomeworkQuery from "@/hooks/queries/useGetHomeworkQuery";
import type * as API from "@/types/api";

export default function DeleteHomeworkAlert(props: { pk: API.Homework["homework_pk"] }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const homework = useGetHomeworkQuery(props.pk);
  const { mutate, isPending } = useDeleteHomeworkMutation(props.pk);

  async function handleDelete(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    await mutate();
    if (closeRef.current) closeRef.current.click();
  }

  if (homework.error)
    return (
      <>
        <AlertDialogHeader>
          <AlertDialogTitle>에러가 발생했어요.</AlertDialogTitle>
          <AlertDialogDescription>
            {isAxiosError(homework.error)
              ? (homework.error.response?.data.message ?? "알 수 없는 에러")
              : homework.error.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="default">닫기</AlertDialogCancel>
        </AlertDialogFooter>
      </>
    );

  if (homework.isLoading || !homework.data)
    return (
      <>
        <AlertDialogDescription className="flex items-center">
          <Loader2
            className="mr-2 animate-spin text-adaptiveBlue-500"
            size="16"
            strokeWidth="2.5"
          />
          과제 정보를 불러오는 중입니다.
        </AlertDialogDescription>
      </>
    );

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {`과제 '${homework.data.data?.title ?? ""}'${josa.pick(homework.data.data?.title ?? "", "을/를")} 삭제할까요?`}
        </AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="hidden" ref={closeRef} />
        <AlertDialogCancel variant="secondary" disabled={isPending}>
          아니요
        </AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={handleDelete} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 inline animate-spin" size="16" strokeWidth="2.5" />
              삭제하는 중
            </>
          ) : (
            "삭제하기"
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}
