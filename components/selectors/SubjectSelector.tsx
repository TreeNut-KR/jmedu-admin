import { isAxiosError } from "axios";
import { Check, CircleAlert, Loader2 } from "lucide-react";
import * as React from "react";
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
import { Input } from "@/components/shadcn/ui/input";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import useGetSubjectsQuery from "@/hooks/queries/useGetSubjectsQuery";
import { cn } from "@/utils/shadcn";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SubjectSelectorProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SubjectSelector = React.forwardRef<HTMLInputElement, SubjectSelectorProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, type, ...props }, ref) => {
    const closeRef = React.useRef<HTMLButtonElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [value, setValue] = React.useState("");
    const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined);

    const subjects = useGetSubjectsQuery({
      page: 1,
      limit: 0,
      sort: "name",
      order: "asc",
    });

    const subject = React.useMemo(() => {
      if (subjects.data?.data) {
        return subjects.data.data.find((subject) => subject.subject_pk.toString() === value);
      }
    }, [subjects, value]);

    // ref를 통해 value가 변경되는 것을 감지하고 내부 state 반영
    React.useImperativeHandle(ref, () => {
      return {
        ...(inputRef.current as HTMLInputElement),
        set value(str: unknown) {
          const inputEl = inputRef.current;

          if (inputEl) {
            Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(
              inputEl,
              str,
            );

            const event = new Event("input", { bubbles: true });

            inputEl.dispatchEvent(event);
          }
        },
        get value(): string {
          return inputRef?.current?.value ?? "";
        },
      };
    });

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      setValue(e.currentTarget.value);

      if (props.onChange) {
        props.onChange(e);
      }
    }

    function handleChangeOpen(open: boolean) {
      if (open) {
        setSelectedId(inputRef?.current?.value);
      }
    }

    function handleChangeValue(value: string) {
      const inputEl = inputRef.current;

      if (inputEl) {
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(
          inputEl,
          value,
        );

        const event = new Event("input", { bubbles: true });

        inputEl.dispatchEvent(event);
      }
    }

    function handleSelect(e: React.MouseEvent<HTMLDivElement>) {
      const id = e.currentTarget.getAttribute("data-id");

      if (id) {
        setSelectedId(id);
      }
    }

    if (subjects.isLoading) {
      return (
        <div className="flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-adaptiveBlue-500" />
          <p className="text-sm">과목 목록을 가져오고 있어요</p>
        </div>
      );
    }

    if (subjects.error) {
      return (
        <div className="flex items-center text-red-500">
          <CircleAlert className="mr-2" size="16" strokeWidth="2.5" />
          <p className="whitespace-pre-line text-sm">
            {isAxiosError(subjects.error)
              ? subjects.error.response?.data.message
              : "과목 목록을 가져오는 중에 문제가 발생했어요."}
          </p>
        </div>
      );
    }

    // TODO: disabled에 대한 처리

    return (
      <>
        <ResponsiveDialog onOpenChange={handleChangeOpen}>
          <div className="flex items-center gap-2">
            <Input
              className={cn(
                "pointer-events-none w-auto",
                !subject?.name && "text-adaptiveGray-400",
              )}
              value={subject?.name ?? "과목을 선택해주세요"}
              readOnly
            />
            <ResponsiveDialogTrigger asChild>
              <Button type="button" variant="default" className="text-xs">
                선택하기
              </Button>
            </ResponsiveDialogTrigger>
          </div>
          <ResponsiveDialogContent className="">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>과목을 선택해주세요</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                아래 목록에서 선택한 과목이 입력됩니다.
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            <ScrollArea className="h-64 rounded-md bg-adaptiveGray-100">
              <div className="my-4 ml-2 mr-4">
                {subjects.data?.data?.map((school) => (
                  <div
                    key={school.subject_pk}
                    data-id={school.subject_pk}
                    className={cn(
                      "py-2 text-sm",
                      selectedId === school.subject_pk.toString() && "font-bold",
                      "hover:cursor-pointer hover:bg-adaptiveGray-200",
                    )}
                    onClick={handleSelect}
                  >
                    <span className="inline-block min-w-8 text-center">
                      {selectedId === school.subject_pk.toString() && (
                        <Check className="inline" size="14" strokeWidth={3} />
                      )}
                    </span>
                    <span>{school.name}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <ResponsiveDialogFooter>
              <ResponsiveDialogClose ref={closeRef} />
              <ResponsiveDialogClose asChild>
                <Button type="button" size="lg" variant="secondary">
                  취소
                </Button>
              </ResponsiveDialogClose>
              <Button
                type="submit"
                size="lg"
                onClick={() => {
                  if (selectedId) {
                    handleChangeValue(selectedId);
                  }
                  closeRef?.current?.click();
                }}
              >
                선택하기
              </Button>
            </ResponsiveDialogFooter>
          </ResponsiveDialogContent>
        </ResponsiveDialog>
        <input type="text" ref={inputRef} {...props} onChange={handleChange} hidden />
      </>
    );
  },
);

SubjectSelector.displayName = "SubjectSelector";

export default SubjectSelector;
