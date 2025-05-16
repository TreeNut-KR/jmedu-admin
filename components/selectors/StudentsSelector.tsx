import { isAxiosError } from "axios";
import { Check, Loader2, Minus, Plus } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useSetRecoilState } from "recoil";
import { z } from "zod";
import { alertAtom } from "@/recoil";
import ActionAlert from "@/components/alerts/ActionAlert";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/dialogs/ResponsiveDialog";
import { Button } from "@/components/shadcn/ui/button";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/tables/Table";
import useGetStudentsQuery from "@/hooks/queries/useGetStudentsQuery";
import { cn } from "@/utils/shadcn";
import { HomeworkSchema } from "@/schema";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StudentsSelectorProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const StudentsSelector = React.forwardRef<HTMLInputElement, StudentsSelectorProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (props, ref) => {
    const form = useFormContext<z.infer<typeof HomeworkSchema>>();
    const setAlert = useSetRecoilState(alertAtom);
    const closeRef = React.useRef<HTMLButtonElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [checkedIds, setCheckedIds] = useState<string[]>([]);

    const students = useGetStudentsQuery({
      page: 1,
      limit: 0,
      sort: "name",
      order: "asc",
    });

    const fields = form.watch("students");

    const selectableSubjects = useMemo(() => {
      return (
        students.data?.data?.filter((el) => !fields.find((filed) => filed === el.student_pk)) ?? []
      );
    }, [fields, students.data?.data]);

    const handleSelect = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        const id = e.currentTarget.getAttribute("data-id");

        if (typeof id === "string") {
          if (selectedIds.find((el) => el === id)) {
            setSelectedIds([...selectedIds.filter((el) => el !== id)]);
          } else {
            setSelectedIds([...selectedIds, id]);
          }
        }
      },
      [selectedIds],
    );

    const handleChangeOpen = useCallback((open: boolean) => {
      setIsOpen(open);
    }, []);

    const handleApply = useCallback(() => {
      setAlert({
        state: true,
        content: (
          <ActionAlert
            title={`선택한 학생을 추가할까요?`}
            action="추가하기"
            onAction={() => {
              form.setValue("students", [...fields, ...selectedIds]);
              setSelectedIds([]);
              setIsOpen(false);
              closeRef.current?.click();
            }}
          />
        ),
      });
    }, [form, selectedIds, setAlert, fields]);

    const handleCheckAllStudents = useCallback(() => {
      if (fields.length > 0 && checkedIds.length === fields.length) {
        setCheckedIds([]);
      } else {
        setCheckedIds([...fields]);
      }
    }, [checkedIds.length, fields]);

    const handleRemoveCheckedStudents = useCallback(() => {
      setAlert({
        state: true,
        content: (
          <ActionAlert
            title={`선택된 학생을 제외할까요?`}
            variant="destructive"
            action="제외하기"
            loading="제외하는 중"
            onAction={() => {
              form.setValue("students", [
                ...fields.filter((el) => !checkedIds.find((el2) => el2 === el)),
              ]);
              setCheckedIds([]);
            }}
          />
        ),
      });
    }, [checkedIds, form, setAlert, fields]);

    const itemCn = useMemo(
      () =>
        "rounded-sm px-3 py-2 text-sm hover:cursor-pointer hover:bg-adaptiveOpacity-100 flex items-center gap-2",
      [],
    );

    if (students.error) {
      return (
        <div>
          <div className="flex items-center gap-2">
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_PATH}/tossface/u26A0.svg`}
              width={20}
              height={20}
              alt="warning icon"
            />
            에러가 발생했어요.
          </div>
          <div className="whitespace-pre-line">
            {isAxiosError(students.error)
              ? (students.error.response?.data.message ?? "알 수 없는 에러")
              : students.error?.message}
          </div>
        </div>
      );
    }

    if (students.isLoading || !students.data) {
      return (
        <div className="flex items-center">
          <Loader2
            className="mr-2 animate-spin text-adaptiveBlue-500"
            size="16"
            strokeWidth="2.5"
          />
          학생 정보를 불러오고 있어요.
        </div>
      );
    }

    return (
      <>
        <ResponsiveDialog open={isOpen} onOpenChange={handleChangeOpen}>
          <div className="space-y-4">
            <Table>
              <TableBody>
                <TableRow>
                  <TableHead className="w-16 text-center">
                    <input
                      type="checkbox"
                      checked={fields.length > 0 && checkedIds.length === fields.length}
                      onChange={handleCheckAllStudents}
                    />
                  </TableHead>
                  <TableHead>이름</TableHead>
                </TableRow>
                {fields.map((field, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={!!checkedIds.find((el) => el === field)}
                        onChange={() => {
                          if (checkedIds.find((el) => el === field)) {
                            setCheckedIds([...checkedIds.filter((el) => el !== field)]);
                          } else {
                            setCheckedIds([...checkedIds, field]);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {students.data?.data?.find((subject) => subject.student_pk === field)?.name ??
                        "알 수 없음"}
                    </TableCell>
                  </TableRow>
                ))}
                {fields.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-center" colSpan={999}>
                      선택된 학생이 없어요.
                    </TableCell>
                  </TableRow>
                ) : (
                  <></>
                )}
              </TableBody>
            </Table>
            <div className="space-x-2">
              <ResponsiveDialogTrigger asChild>
                <Button type="button" variant="default" className="text-xs">
                  <Plus size={14} />
                  학생 추가
                </Button>
              </ResponsiveDialogTrigger>
              <Button
                type="button"
                variant="secondary"
                className="text-xs"
                onClick={handleRemoveCheckedStudents}
                disabled={!checkedIds.length}
              >
                <Minus size={14} />
                선택 학생 제외
              </Button>
            </div>
          </div>
          <ResponsiveDialogContent className="gap-4">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>추가할 학생 선택</ResponsiveDialogTitle>
              <ResponsiveDialogDescription></ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <ScrollArea className="max-h-64 rounded-md bg-adaptiveGray-100">
              <div className="m-2">
                {selectableSubjects.map((field) => (
                  <div
                    key={field.student_pk}
                    data-id={field.student_pk}
                    data-name={field.name ?? "알 수 없음"}
                    className={cn(
                      selectedIds.find((el) => el === field.student_pk) && "font-bold",
                      itemCn,
                    )}
                    onClick={handleSelect}
                  >
                    {selectedIds.find((el) => el === field.student_pk) ? (
                      <Check size="16" strokeWidth={3} />
                    ) : (
                      <Check size="16" className="opacity-0" />
                    )}
                    <span>{field.name ?? "알 수 없음"}</span>
                  </div>
                ))}
                <div
                  className={cn([
                    itemCn,
                    "hover:bg-inhert hidden text-adaptiveGray-400 first:block hover:cursor-auto",
                  ])}
                >
                  <span>선택 가능한 학생이 없습니다.</span>
                </div>
              </div>
            </ScrollArea>

            <ResponsiveDialogFooter>
              <ResponsiveDialogClose ref={closeRef} />
              <ResponsiveDialogClose asChild>
                <Button type="button" size="lg" variant="secondary">
                  취소
                </Button>
              </ResponsiveDialogClose>
              <Button type="submit" size="lg" onClick={handleApply}>
                적용하기
              </Button>
            </ResponsiveDialogFooter>
          </ResponsiveDialogContent>
        </ResponsiveDialog>
        <input ref={ref} {...props} hidden />
      </>
    );
  },
);

StudentsSelector.displayName = "StudentsSelector";

export default StudentsSelector;
