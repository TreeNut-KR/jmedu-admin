import { isAxiosError } from "axios";
import { josa } from "es-hangul";
import { Loader2, MinusSquare, PlusSquare } from "lucide-react";
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
import useGetSubjectsQuery from "@/hooks/queries/useGetSubjectsQuery";
import { cn } from "@/utils/shadcn";
import { StudentSchema } from "@/schema";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SubjectsSelectorProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SubjectsSelector = React.forwardRef<HTMLInputElement, SubjectsSelectorProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (props, ref) => {
    const form = useFormContext<z.infer<typeof StudentSchema>>();
    const setAlert = useSetRecoilState(alertAtom);
    const closeRef = React.useRef<HTMLButtonElement>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [value, setValue] = useState<number[]>([]);

    const subjects = useGetSubjectsQuery({
      page: 1,
      limit: 0,
      sort: "name",
      order: "asc",
    });

    const fields = form.watch("subjects");

    const selectableSubjects = useMemo(() => {
      return (
        subjects.data?.data?.filter((el) => !value.find((filed) => filed === el.subject_pk)) ?? []
      );
    }, [value, subjects.data?.data]);

    const handleAddSubject = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
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
                  setValue([...value, Number(id)]);
                }}
              />
            ),
          });
        }
      },
      [value, setAlert],
    );

    const handleRemoveSubject = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
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
                  setValue([...value.filter((el) => el !== Number(id))]);
                }}
              />
            ),
          });
        }
      },
      [value, setAlert],
    );

    const handleChangeOpen = useCallback(
      (open: boolean) => {
        if (open) {
          setValue([...fields]);
          setIsOpen(open);
        } else {
          setAlert({
            state: true,
            content: (
              <ActionAlert
                title={`과목 선택을 그만둘까요?`}
                variant="destructive"
                action="그만하기"
                onAction={() => {
                  setIsOpen(open);
                }}
              />
            ),
          });
        }
      },
      [fields, setAlert],
    );

    const handleApply = useCallback(() => {
      setAlert({
        state: true,
        content: (
          <ActionAlert
            title={`선택 사항을 적용할까요?`}
            action="적용하기"
            onAction={() => {
              form.setValue("subjects", value);
              setIsOpen(false);
              closeRef.current?.click();
            }}
          />
        ),
      });
    }, [form, setAlert, value]);

    const itemCn = useMemo(
      () =>
        "rounded-sm px-3 py-2 text-sm hover:cursor-pointer hover:bg-adaptiveOpacity-100 flex items-center gap-2",
      [],
    );

    if (subjects.error) {
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
          <div>
            {isAxiosError(subjects.error)
              ? (subjects.error.response?.data.message ?? "알 수 없는 에러")
              : subjects.error?.message}
          </div>
        </div>
      );
    }

    if (subjects.isLoading || !subjects.data) {
      return (
        <div className="flex items-center">
          <Loader2
            className="mr-2 animate-spin text-adaptiveBlue-500"
            size="16"
            strokeWidth="2.5"
          />
          과목 정보를 불러오고 있어요.
        </div>
      );
    }

    return (
      <>
        <ResponsiveDialog open={isOpen} onOpenChange={handleChangeOpen}>
          <div className="space-y-2">
            <ul className="flex min-w-44 flex-col items-start gap-2 py-2">
              {fields.map((field, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Image
                    alt="subject icon"
                    src={process.env.NEXT_PUBLIC_BASE_PATH + "/tossface/u1F4DA.svg"}
                    width={18}
                    height={18}
                  />
                  {subjects.data?.data?.find((subject) => subject.subject_pk === field)?.name ??
                    "알 수 없음"}
                </li>
              ))}
              <li className="hidden text-adaptiveGray-400 first:block">
                <span>수강중인 과목이 없습니다.</span>
              </li>
            </ul>
            <ResponsiveDialogTrigger asChild>
              <Button type="button" variant="default" className="text-xs">
                선택하기
              </Button>
            </ResponsiveDialogTrigger>
          </div>
          <ResponsiveDialogContent className="gap-4">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>수강 과목 선택</ResponsiveDialogTitle>
              <ResponsiveDialogDescription></ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <div className="grid gap-6">
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-md font-medium">수강 과목</p>
                  <p className="text-sm text-adaptiveGray-600">현재 수강중인 과목이에요.</p>
                </div>
                <ScrollArea className="max-h-32 rounded-md bg-adaptiveGray-100">
                  <div className="m-2">
                    {value.map((field) => (
                      <div
                        key={field}
                        data-id={field}
                        data-name={
                          subjects.data?.data?.find((subject) => subject.subject_pk === field)
                            ?.name ?? "알 수 없음"
                        }
                        className={itemCn}
                        onClick={handleRemoveSubject}
                      >
                        <MinusSquare size="16" className="text-adaptiveRed-500" />
                        <span>
                          {subjects.data?.data?.find((subject) => subject.subject_pk === field)
                            ?.name ?? "알 수 없음"}
                        </span>
                      </div>
                    ))}
                    <div
                      className={cn([
                        itemCn,
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
                  <p className="text-sm text-adaptiveGray-600">
                    아래 목록에서 과목을 추가할 수 있어요.
                  </p>
                </div>
                <ScrollArea className="max-h-32 rounded-md bg-adaptiveGray-100">
                  <div className="m-2">
                    {selectableSubjects.map((subject) => (
                      <div
                        key={subject.subject_pk}
                        data-id={subject.subject_pk}
                        data-name={subject.name}
                        className={itemCn}
                        onClick={handleAddSubject}
                      >
                        <PlusSquare size="16" className="text-adaptiveBlue-500" />
                        <span>{subject.name}</span>
                      </div>
                    ))}
                    <div
                      className={cn([
                        itemCn,
                        "hover:bg-inhert hidden text-adaptiveGray-400 first:block hover:cursor-auto",
                      ])}
                    >
                      <span>추가할 수 있는 과목이 없습니다.</span>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </div>
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

SubjectsSelector.displayName = "SubjectsSelector";

export default SubjectsSelector;
