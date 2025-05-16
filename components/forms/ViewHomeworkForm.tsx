import { isAxiosError } from "axios";
import { parse } from "date-fns";
import { Loader2, Pencil } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useState } from "react";
import { useSetRecoilState } from "recoil";
import { dialogAtom } from "@/recoil";
import WithAuthorization from "@/components/WithAuthorization";
import UpdateStudentHomeworkDialog from "@/components/dialogs/UpdateStudentHomeworkDialog";
import UpdateStudentHomeworksDialog from "@/components/dialogs/UpdateStudentHomeworksDialog";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/tables/Table";
import useGetHomeworkQuery from "@/hooks/queries/useGetHomeworkQuery";
import { formatDate } from "@/utils";
import { VIEW_HOMEWORK_COLUMNS } from "@/constants/columns";
import type * as API from "@/types/api";

interface ViewHomeworkTemplateProps {
  pk: API.Homework["homework_pk"];
}

export default function ViewHomeworkForm(props: ViewHomeworkTemplateProps) {
  const setDialog = useSetRecoilState(dialogAtom);
  const [checkedIds, setCheckedIds] = useState<number[]>([]);

  const homework = useGetHomeworkQuery(props.pk);

  const checkedStudentHomeworks = useMemo(() => {
    return checkedIds
      .map((id) =>
        homework.data?.data?.student_homeworks.find((el) => el.student_homework_pk === id),
      )
      .filter((el) => el !== undefined);
  }, [checkedIds, homework.data?.data?.student_homeworks]);

  const handleChangeCheck = useCallback(
    (e: React.ChangeEvent) => {
      const id = e.currentTarget.getAttribute("data-id");

      if (typeof id === "string" && !isNaN(Number(id))) {
        if (checkedIds.find((el) => el === Number(id))) {
          setCheckedIds([...checkedIds.filter((el) => el !== Number(id))]);
        } else {
          setCheckedIds([...checkedIds, Number(id)]);
        }
      }
    },
    [checkedIds, setCheckedIds],
  );

  const handleChangeCheckAll = useCallback(() => {
    if (checkedIds.length === homework.data?.data?.student_homeworks.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds([
        ...(homework.data?.data?.student_homeworks.map((el) => el.student_homework_pk) ?? []),
      ]);
    }
  }, [checkedIds.length, homework]);

  const handleClickStateChangeCheckedStudent = useCallback(() => {
    setDialog({
      state: true,
      content: <UpdateStudentHomeworksDialog studentHomeworks={checkedStudentHomeworks} />,
    });
  }, [checkedStudentHomeworks, setDialog]);

  const handleClickStateChange = useCallback(
    (e: React.MouseEvent) => {
      const id = e.currentTarget.getAttribute("data-id");
      const studentHomework =
        typeof id === "string" &&
        !isNaN(Number(id)) &&
        homework.data?.data?.student_homeworks.find((el) => el.student_homework_pk === Number(id));

      if (studentHomework) {
        setDialog({
          state: true,
          content: <UpdateStudentHomeworkDialog studentHomework={studentHomework} />,
        });
      }
    },
    [homework.data?.data?.student_homeworks, setDialog],
  );

  if (homework.error) {
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
        <div className="whitespace-pre-line text-sm text-adaptiveGray-700">
          {isAxiosError(homework.error)
            ? (homework.error.response?.data.message ?? "알 수 없는 에러")
            : homework.error.message}
        </div>
      </div>
    );
  }

  if (homework.isLoading || !homework.data?.data) {
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        과제 정보를 불러오고 있어요.
      </div>
    );
  }

  if (homework.data?.data)
    return (
      <>
        <div className="space-y-2">
          <p className="font-semibold">과제 정보</p>
          <Table>
            <TableBody>
              {VIEW_HOMEWORK_COLUMNS.map((column, columnIdx) => {
                if (column.hidden || !homework.data.data) return;
                return (
                  <TableRow
                    key={`homework-column-${column.accessor ?? column.header ?? columnIdx}`}
                  >
                    <TableHead className="w-40">{column.header ?? column.accessor}</TableHead>
                    <TableCell className="whitespace-pre-line">
                      {column.renderer
                        ? column.renderer(homework.data.data)
                        : column.accessor
                          ? typeof homework.data.data[column.accessor] === "object"
                            ? JSON.stringify(homework.data.data[column.accessor])
                            : (homework.data.data[column.accessor] as string | number)
                          : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">제출 현황</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">
                  <input
                    type="checkbox"
                    checked={
                      !!homework.data?.data?.student_homeworks.length &&
                      checkedIds.length === homework.data?.data?.student_homeworks.length
                    }
                    onChange={handleChangeCheckAll}
                  />
                </TableHead>
                <TableHead>이름</TableHead>
                <TableHead>제출일</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>비고</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {homework.data.data.student_homeworks.map((studentHomework) => (
                <TableRow key={`student_homework-${studentHomework["student_homework_pk"]}`}>
                  <TableCell className="text-center">
                    <input
                      type="checkbox"
                      data-id={studentHomework["student_homework_pk"]}
                      checked={
                        !!checkedIds.find((el) => el === studentHomework["student_homework_pk"])
                      }
                      onChange={handleChangeCheck}
                    />
                  </TableCell>
                  <TableCell>{studentHomework["studentObj"]?.name ?? "알 수 없음"}</TableCell>
                  <TableCell>{formatDate(studentHomework["submitted_at"])}</TableCell>
                  <TableCell>
                    {studentHomework["submitted_at"] ? (
                      homework.data?.data?.due_date &&
                      parse(
                        studentHomework["submitted_at"],
                        "yyyy-MM-dd HH:mm:ss.SSSSSS",
                        new Date(),
                      ).getTime() >
                        parse(
                          homework.data.data.due_date,
                          "yyyy-MM-dd'T'HH:mm:ss",
                          new Date(),
                        ).getTime() ? (
                        <Badge variant={"lightRed"}>지연 제출</Badge>
                      ) : (
                        <Badge variant={"lightBlue"}>제출</Badge>
                      )
                    ) : (
                      <Badge variant={"lightGray"}>미제출</Badge>
                    )}
                  </TableCell>
                  <TableCell>{studentHomework["remarks"]}</TableCell>
                  <TableCell>
                    <WithAuthorization requiredPermission={"homework_edit"}>
                      <Button
                        type="button"
                        size={"sm"}
                        variant={"lightBlue"}
                        data-id={studentHomework["student_homework_pk"]}
                        onClick={handleClickStateChange}
                      >
                        <Pencil size={12} />
                        상태 수정
                      </Button>
                    </WithAuthorization>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="hidden first:table-row">
                <TableCell className="text-center" colSpan={999}>
                  제출 대상이 없어요.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="space-x-2">
            <WithAuthorization requiredPermission={"homework_edit"}>
              <Button
                type="button"
                className="text-xs"
                onClick={handleClickStateChangeCheckedStudent}
                disabled={checkedIds.length === 0}
              >
                <Pencil size={12} />
                선택 대상 상태 수정
              </Button>
            </WithAuthorization>
          </div>
        </div>
      </>
    );
}
