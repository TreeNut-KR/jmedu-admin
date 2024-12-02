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
import useDeleteSchoolMutation from "@/hooks/mutations/useDeleteSchoolMutation";
import useGetSchoolQuery from "@/hooks/queries/useGetSchoolQuery";
import type * as API from "@/types/api";

export default function DeleteSchoolAlert(props: { pk: API.School["school_pk"] }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const school = useGetSchoolQuery(props.pk);
  const { mutate, isPending } = useDeleteSchoolMutation(props.pk);

  async function handleDelete(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    await mutate();
    if (closeRef.current) closeRef.current.click();
  }

  if (school.error)
    return (
      <>
        <AlertDialogHeader>
          <AlertDialogTitle>에러가 발생했어요.</AlertDialogTitle>
          <AlertDialogDescription>
            {isAxiosError(school.error)
              ? (school.error.response?.data.message ?? "알 수 없는 에러")
              : school.error.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="default">닫기</AlertDialogCancel>
        </AlertDialogFooter>
      </>
    );

  if (school.isLoading || !school.data)
    return (
      <>
        <AlertDialogDescription className="flex items-center">
          <Loader2
            className="mr-2 animate-spin text-adaptiveBlue-500"
            size="16"
            strokeWidth="2.5"
          />
          학교 정보를 불러오는 중입니다.
        </AlertDialogDescription>
      </>
    );

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>
          {josa(school.data.data?.name ?? "", "을/를")} 삭제할까요?
        </AlertDialogTitle>
        <AlertDialogDescription>삭제를 진행하게되면 되돌릴 수 없어요.</AlertDialogDescription>
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
