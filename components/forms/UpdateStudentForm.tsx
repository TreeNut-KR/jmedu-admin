import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSetRecoilState } from "recoil";
import { z } from "zod";
import { alertAtom } from "@/recoil";
import WithAuthorization from "@/components/WithAuthorization";
import ActionAlert from "@/components/alerts/ActionAlert";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/tables/Table";
import useUpdateStudentMutation from "@/hooks/mutations/useUpdateStudentMutation";
import useGetStudentQuery from "@/hooks/queries/useGetStudentQuery";
import { customErrorMap, formatPhoneNumber, unformatPhoneNumber } from "@/utils";
import { StudentSchema } from "@/schema";
import { STUDENT_FORM } from "@/constants/forms";
import type * as API from "@/types/api";

export default function UpdateStudentForm(props: { pk: API.Student["student_pk"] }) {
  const student = useGetStudentQuery(props.pk);

  const form = useForm<z.infer<typeof StudentSchema>>({
    resolver: zodResolver(StudentSchema, { errorMap: customErrorMap }),
    defaultValues: student.data?.data
      ? {
          ...student.data.data,
          contact: formatPhoneNumber(student.data.data.contact),
          contact_parent: formatPhoneNumber(student.data.data.contact_parent),
        }
      : undefined,
  });

  useEffect(() => {
    if (student.data?.data) {
      form.reset({
        ...student.data.data,
        contact: formatPhoneNumber(student.data.data.contact),
        contact_parent: formatPhoneNumber(student.data.data.contact_parent),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student.data?.data]);

  const setAlert = useSetRecoilState(alertAtom);

  const { mutate, isPending } = useUpdateStudentMutation(props.pk);

  function handleSubmit(values: z.infer<typeof StudentSchema>) {
    setAlert({
      state: true,
      content: (
        <ActionAlert
          title={`${values.name} 학생의 정보를 수정할까요?`}
          description="수정한 내용은 즉시 반영돼요."
          action="수정하기"
          loading="수정하는 중"
          onAction={() => {
            mutate({
              ...values,
              contact: unformatPhoneNumber(values.contact),
              contact_parent: unformatPhoneNumber(values.contact_parent),
            });
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
          title="수정하던 내용을 되돌릴까요?"
          description="되돌리게되면 작성 중이던 내용이 사라져요."
          action="되돌리기"
          onAction={() => form.reset()}
        />
      ),
    });
  }

  if (student.error) {
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
        <div className="text-sm text-adaptiveGray-700">
          {isAxiosError(student.error)
            ? (student.error.response?.data.message ?? "알 수 없는 에러")
            : student.error.message}
        </div>
      </div>
    );
  }

  if (student.isLoading || !student.data || !form.formState.defaultValues) {
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        학생 정보를 불러오고 있어요.
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
        <Table>
          <TableBody>
            {STUDENT_FORM.map((column) => (
              <WithAuthorization key={column.key} requiredPermission={column.permission ?? []}>
                <TableRow>
                  <TableHead className="w-40">{column.label}</TableHead>
                  <TableCell>
                    {column.custom ? (
                      <column.custom
                        {...form.register(column.key, {
                          onChange: column.onChange ?? undefined,
                          valueAsNumber: column.type === "number",
                        })}
                        disabled={isPending}
                      />
                    ) : (
                      <Input
                        type={column.type}
                        {...form.register(column.key, {
                          onChange: column.onChange ?? undefined,
                          valueAsNumber: column.type === "number",
                        })}
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
              </WithAuthorization>
            ))}
          </TableBody>
        </Table>
        <div className="space-x-2 text-right">
          <Button type="button" variant="secondary" size="lg" onClick={handleReset}>
            다시 작성하기
          </Button>
          <Button type="submit" size="lg" disabled={!form.formState.isValid}>
            수정하기
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
