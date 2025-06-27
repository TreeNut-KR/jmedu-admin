import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { josa } from "es-hangul";
import { overlay } from "overlay-kit";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import ActionAlert from "@/components/alerts/ActionAlert";
import StudentsSelector from "@/components/selectors/StudentsSelector";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/tables/Table";
import useCreateHomeworkMutation from "@/hooks/mutations/useCreateHomeworkMutation";
import { customErrorMap } from "@/utils";
import { HomeworkSchema } from "@/schema";
import { HOMEWORK_INFO_FORM } from "@/constants/forms";

export default function CreateHomeworkForm() {
  const form = useForm<z.infer<typeof HomeworkSchema>>({
    resolver: zodResolver(HomeworkSchema, { errorMap: customErrorMap }),
    defaultValues: {
      subject_id: undefined,
      title: "",
      description: "",
      due_date: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      students: [],
    },
  });

  const { mutate, isPending } = useCreateHomeworkMutation();

  function handleSubmit(values: z.infer<typeof HomeworkSchema>) {
    overlay.open(({ isOpen, close }) => {
      return (
        <ActionAlert
          state={isOpen}
          close={close}
          title={`과제 '${values.title}'${josa.pick(values.title ?? "", "을/를")} 등록할까요?`}
          action="등록하기"
          loading="등록하는 중"
          onAction={() => mutate(values)}
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

  return (
    <FormProvider {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="space-y-2">
          <p className="font-semibold">과제 정보</p>
          <Table>
            <TableBody>
              {HOMEWORK_INFO_FORM.map((column) => (
                <TableRow key={column.key}>
                  <TableHead className="w-40">{column.label}</TableHead>
                  <TableCell>
                    {column.custom ? (
                      <column.custom
                        {...form.register(column.key, {
                          onChange: column.onChange ?? undefined,
                          valueAsNumber: column.type === "number",
                        })}
                        className={column.className}
                        disabled={isPending}
                      />
                    ) : (
                      <Input
                        type={column.type}
                        {...form.register(column.key, {
                          onChange: column.onChange ?? undefined,
                          valueAsNumber: column.type === "number",
                        })}
                        className={column.className}
                        disabled={isPending}
                      />
                    )}
                    {form.formState.errors[column.key]?.message ? (
                      <p className="my-1 text-xs text-adaptiveRed-500">
                        {form.formState.errors[column.key]?.message}
                      </p>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="space-y-2">
          <p className="font-semibold">대상 학생</p>
          <StudentsSelector {...form.register("students")} />
        </div>
        <div className="space-x-2 text-right">
          <Button type="button" variant="secondary" size="lg" onClick={handleReset}>
            다시 작성하기
          </Button>
          <Button type="submit" size="lg" disabled={!form.formState.isValid}>
            등록하기
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
