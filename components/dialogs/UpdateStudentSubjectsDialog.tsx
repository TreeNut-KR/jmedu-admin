import { isAxiosError } from "axios";
import { josa } from "es-hangul";
import { Loader2, MinusSquare, PlusSquare } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
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
import { Button } from "@/components/shadcn/ui/button";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import useUpdateStudentSubjectsMutation from "@/hooks/mutations/useUpdateStudentSubjectsMutation";
import useGetStudentQuery from "@/hooks/queries/useGetStudentQuery";
import useGetSubjectsQuery from "@/hooks/queries/useGetSubjectsQuery";
import { cn } from "@/utils/shadcn";
import { UpdateStudentSubjectsSchema } from "@/schema";
import type * as API from "@/types/api";

const itmeCn =
  "rounded-sm px-3 py-2 text-sm hover:cursor-pointer hover:bg-adaptiveOpacity-100 flex items-center gap-2";

export default function UpdateStudentSubjectsDialog(props: { pk: API.Student["student_pk"] }) {
  const setAlert = useSetRecoilState(alertAtom);

  const [dialog, setDialog] = useRecoilState(dialogAtom);

  const student = useGetStudentQuery(props.pk);

  const studentSubjects = useMemo(() => {
    if (student.isLoading) {
      return { isLoading: true, error: undefined, data: undefined };
    }

    if (student.error) {
      return { isLoading: false, error: student.error, data: undefined };
    }

    const filted = student.data?.data?.studentSubjectArray.filter(
      (studentSubject) => !studentSubject.deleted_at,
    );

    return { isLoading: false, error: undefined, data: filted };
  }, [student.data?.data?.studentSubjectArray, student.error, student.isLoading]);

  const subjects = useGetSubjectsQuery({
    page: 1,
    limit: 0,
    sort: "name",
    order: "asc",
  });

  const [addedSubjects, setAddedSubjects] = useState<API.Subject["subject_pk"][]>([]);
  const [removedSubjects, setRemovedSubjects] = useState<API.Subject["subject_pk"][]>([]);

  const isDirty = useMemo(
    () => addedSubjects.length || removedSubjects.length,
    [addedSubjects, removedSubjects],
  );

  const { mutate, isPending } = useUpdateStudentSubjectsMutation(props.pk);

  function handleAddSubject(e: React.MouseEvent<HTMLDivElement>) {
    const id = e.currentTarget.getAttribute("data-id");
    const name = e.currentTarget.getAttribute("data-name");

    if (typeof id === "string" && !Number.isNaN(Number(id))) {
      setAlert({
        state: true,
        content: (
          <ActionAlert
            title={`과목 '${name ?? ""}'${josa.pick(name ?? "", "을/를")} 추가할까요?`}
            action="추가하기"
            onAction={() => {
              if (!studentSubjects.data?.find((el) => el.subject_id === Number(id))) {
                setAddedSubjects([...addedSubjects, Number(id)]);
              }
              setRemovedSubjects([...removedSubjects.filter((el) => el !== Number(id))]);
            }}
          />
        ),
      });
    }
  }

  function handleRemoveSubject(e: React.MouseEvent<HTMLDivElement>) {
    const id = e.currentTarget.getAttribute("data-id");
    const name = e.currentTarget.getAttribute("data-name");

    if (typeof id === "string" && !Number.isNaN(Number(id))) {
      setAlert({
        state: true,
        content: (
          <ActionAlert
            title={`과목 '${name ?? ""}'${josa.pick(name ?? "", "을/를")} 제거할까요?`}
            variant="destructive"
            action="제거하기"
            onAction={() => {
              if (studentSubjects.data?.find((el) => el.subject_id === Number(id))) {
                setRemovedSubjects([...removedSubjects, Number(id)]);
              }
              setAddedSubjects([...addedSubjects.filter((el) => el !== Number(id))]);
            }}
          />
        ),
      });
    }
  }

  function handleSubmit() {
    updateStudentSubject({
      removed_subjects: removedSubjects,
      added_subjects: addedSubjects,
    });
  }

  function updateStudentSubject(values: z.infer<typeof UpdateStudentSubjectsSchema>) {
    setAlert({
      state: true,
      content: (
        <ActionAlert
          title={`학생 '${student.data?.data?.name}'의 수강 과목 정보를 수정할까요?`}
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
          onAction={() => {
            setAddedSubjects([]);
            setRemovedSubjects([]);
          }}
        />
      ),
    });
  }

  if (student.error) {
    const error = student.error || subjects.error;

    return (
      <>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/tossface/u26A0.svg`}
              width={20}
              height={20}
              alt="warning icon"
            />
            에러가 발생했어요.
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {isAxiosError(error)
              ? (error.response?.data.message ?? "알 수 없는 에러")
              : error.message}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
      </>
    );
  }

  if (studentSubjects.isLoading || !studentSubjects.data || subjects.isLoading || !subjects.data) {
    return (
      <ResponsiveDialogDescription className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        학생 정보를 불러오고 있어요.
      </ResponsiveDialogDescription>
    );
  }

  return (
    <>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>{`학생 '${student.data?.data?.name}'의 수강 과목`}</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>
      <div className="my-4 space-y-6">
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-md font-medium">수강 과목</p>
            <p className="text-sm text-adaptiveGray-600">현재 수강중인 과목이에요.</p>
          </div>
          <ScrollArea className="rounded-md bg-adaptiveGray-100">
            <div className="m-2">
              {studentSubjects.data?.map((el) => {
                if (removedSubjects.find((removedSubject) => removedSubject === el.subject_id))
                  return null;
                return (
                  <div
                    key={el.subject_id}
                    data-id={el.subject_id}
                    data-name={
                      subjects.data?.data?.find((subject) => subject.subject_pk === el.subject_id)
                        ?.name ?? "알 수 없음"
                    }
                    className={itmeCn}
                    onClick={handleRemoveSubject}
                  >
                    <MinusSquare size="16" className="text-adaptiveRed-500" />
                    <span>
                      {subjects.data?.data?.find((subject) => subject.subject_pk === el.subject_id)
                        ?.name ?? "알 수 없음"}
                    </span>
                  </div>
                );
              })}
              {addedSubjects.map((addedSubject) => {
                if (studentSubjects.data?.find((el) => el.subject_id === addedSubject)) return null;
                return (
                  <div
                    key={addedSubject}
                    data-id={addedSubject}
                    data-name={
                      subjects.data?.data?.find((subject) => subject.subject_pk === addedSubject)
                        ?.name ?? "알 수 없음"
                    }
                    className={itmeCn}
                    onClick={handleRemoveSubject}
                  >
                    <MinusSquare size="16" className="text-adaptiveRed-500" />
                    <span>
                      {subjects.data?.data?.find((subject) => subject.subject_pk === addedSubject)
                        ?.name ?? "알 수 없음"}
                    </span>
                  </div>
                );
              })}
              <div
                className={cn([
                  itmeCn,
                  "hover:bg-inhert hidden text-adaptiveGray-400 first:block hover:cursor-auto",
                ])}
              >
                <span>수강중인 과목이 없습니다.</span>
              </div>
            </div>
          </ScrollArea>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <p className="text-md font-medium">과목 추가</p>
            <p className="text-sm text-adaptiveGray-600">아래 목록에서 과목을 추가할 수 있어요.</p>
          </div>
          <ScrollArea className="max-h-40 rounded-md bg-adaptiveGray-100">
            <div className="m-2">
              {subjects.data?.data?.map((subject) => {
                if (
                  studentSubjects.data?.find((el) => el.subject_id === subject.subject_pk) &&
                  !removedSubjects.find((removedSubject) => removedSubject === subject.subject_pk)
                )
                  return null;
                if (addedSubjects.find((addedSubject) => addedSubject === subject.subject_pk))
                  return null;
                return (
                  <div
                    key={subject.subject_pk}
                    data-id={subject.subject_pk}
                    data-name={subject.name}
                    className={itmeCn}
                    onClick={handleAddSubject}
                  >
                    <PlusSquare size="16" className="text-adaptiveBlue-500" />
                    <span>{subject.name}</span>
                  </div>
                );
              })}
              <div
                className={cn([
                  itmeCn,
                  "hover:bg-inhert hidden text-adaptiveGray-400 first:block hover:cursor-auto",
                ])}
              >
                <span>과목이 없습니다.</span>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
      <ResponsiveDialogFooter>
        <Button
          type="button"
          variant="secondary"
          size="lg"
          disabled={isPending || !isDirty}
          onClick={handleReset}
        >
          초기화
        </Button>
        <Button type="button" size="lg" disabled={isPending || !isDirty} onClick={handleSubmit}>
          수정하기
        </Button>
      </ResponsiveDialogFooter>
    </>
  );
}
