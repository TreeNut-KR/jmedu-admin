import { isAxiosError } from "axios";
import { Check, CircleAlert, Loader2 } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import { Input } from "@/components/shadcn/ui/input";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import useGetSchoolsQuery from "@/hooks/queries/useGetSchoolsQuery";
import { cn } from "@/utils/shadcn";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SchoolSelectorProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SchoolSelector = React.forwardRef<HTMLInputElement, SchoolSelectorProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, type, ...props }, ref) => {
    const closeRef = React.useRef<HTMLButtonElement>(null);
    const fieldsetRef = React.useRef<HTMLFieldSetElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [value, setValue] = React.useState("");
    const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined);

    const schools = useGetSchoolsQuery({
      page: 1,
      limit: 0,
      sort: "school_pk",
      order: "asc",
      includeDefault: true,
    });

    const school = React.useMemo(() => {
      if (schools.data?.data) {
        return schools.data.data.find((school) => school.school_pk.toString() === value);
      }
    }, [schools, value]);

    // ref를 통해 value가 변경되는 것을 감지하고 내부 state 반영
    React.useImperativeHandle(ref, () => {
      return {
        ...(inputRef.current as HTMLInputElement),
        set value(str: unknown) {
          const inputEl = fieldsetRef.current?.querySelector("input");

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
      const inputEl = fieldsetRef.current?.querySelector("input");

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

    if (schools.isLoading) {
      return (
        <div className="flex items-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-adaptiveBlue-500" />
          <p className="text-sm">학교 목록을 가져오고 있어요</p>
        </div>
      );
    }

    if (schools.error) {
      return (
        <div className="flex items-center text-red-500">
          <CircleAlert className="mr-2" size="16" strokeWidth="2.5" />
          <p className="text-sm">
            {isAxiosError(schools.error)
              ? schools.error.response?.data.message
              : "학교 목록을 가져오는 중에 문제가 발생했어요."}
          </p>
        </div>
      );
    }

    // TODO: disabled에 대한 처리

    return (
      <>
        <Dialog onOpenChange={handleChangeOpen}>
          <div className="flex items-center gap-2">
            <Input
              className={cn("pointer-events-none w-auto", !school?.name && "text-adaptiveGray-400")}
              value={school?.name ?? "학교를 선택해주세요"}
              readOnly
            />
            <DialogTrigger asChild>
              <Button type="button" variant="default" className="text-xs">
                선택하기
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle>학교를 선택해주세요</DialogTitle>
              <DialogDescription>아래 목록에서 선택한 학교가 입력됩니다.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-64 rounded-md bg-adaptiveGray-100">
              <div className="my-4 ml-2 mr-4">
                {schools.data?.data?.map((school) => (
                  <div
                    key={school.school_pk}
                    data-id={school.school_pk}
                    className={cn(
                      "py-2 text-sm",
                      selectedId === school.school_pk.toString() && "font-bold",
                      "hover:cursor-pointer hover:bg-adaptiveGray-200",
                    )}
                    onClick={handleSelect}
                  >
                    <span className="inline-block min-w-8 text-center">
                      {selectedId === school.school_pk.toString() && (
                        <Check className="inline" size="14" strokeWidth={3} />
                      )}
                    </span>
                    <span>{school.name}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <DialogFooter>
              <DialogClose ref={closeRef} />
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  취소
                </Button>
              </DialogClose>
              <Button
                type="submit"
                onClick={() => {
                  if (selectedId) {
                    handleChangeValue(selectedId);
                  }
                  closeRef?.current?.click();
                }}
              >
                적용하기
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <fieldset ref={fieldsetRef}>
          <input type="text" ref={inputRef} {...props} onChange={handleChange} hidden />
        </fieldset>
      </>
    );
  },
);

SchoolSelector.displayName = "SchoolSelector";

export default SchoolSelector;
