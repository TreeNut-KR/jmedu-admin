import { isAxiosError } from "axios";
import { josa } from "es-hangul";
import { Loader2 } from "lucide-react";
import { MouseEvent, useRef } from "react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn/ui/alert-dialog";
import useDeleteStudentMutation from "@/hooks/mutations/useDeleteStudentMutation";
import useGetStudentQuery from "@/hooks/queries/useGetStudentQuery";
import type * as API from "@/types/api";

export default function DeleteStudentAlert(props: { pk: API.Student["student_pk"] }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const student = useGetStudentQuery(props.pk);

  const { mutate, isPending } = useDeleteStudentMutation(props.pk);

  async function handleDelete(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    await mutate();
    if (closeRef.current) closeRef.current.click();
  }

  if (student.error)
    return (
      <>
        <AlertDialogHeader>
          <AlertDialogTitle>에러가 발생했어요.</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line">
            {isAxiosError(student.error)
              ? (student.error.response?.data.message ?? "알 수 없는 에러")
              : student.error.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="default">닫기</AlertDialogCancel>
        </AlertDialogFooter>
      </>
    );

  if (student.isLoading || !student.data)
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        학생 정보를 불러오는 중입니다.
      </div>
    );

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>
          학생 {josa(student.data?.data?.name ?? "", "을/를")} 삭제할까요?
        </AlertDialogTitle>
        <AlertDialogDescription>삭제를 진행하게되면 되돌릴 수 없어요.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel ref={closeRef} variant="secondary">
          닫기
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
