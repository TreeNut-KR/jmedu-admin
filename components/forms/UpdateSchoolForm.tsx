import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSetRecoilState } from "recoil";
import { z } from "zod";
import { alertAtom } from "@/recoil";
import ActionAlert from "@/components/alerts/ActionAlert";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/tables/Table";
import useUpdateSchoolMutation from "@/hooks/mutations/useUpdateSchoolMutation";
import useGetSchoolQuery from "@/hooks/queries/useGetSchoolQuery";
import { customErrorMap } from "@/utils";
import { SchoolSchema } from "@/schema";
import { SCHOOL_FORM } from "@/constants/forms";
import type * as API from "@/types/api";

export default function UpdateSchoolForm(props: { pk: API.School["school_pk"] }) {
  const school = useGetSchoolQuery(props.pk);

  const form = useForm<z.infer<typeof SchoolSchema>>({
    resolver: zodResolver(SchoolSchema, { errorMap: customErrorMap }),
    defaultValues: school.data?.data
      ? {
          ...school.data.data,
        }
      : undefined,
  });

  useEffect(() => {
    if (school.data?.data) {
      form.reset({
        ...school.data.data,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school.data?.data]);

  const setAlert = useSetRecoilState(alertAtom);

  const { mutate, isPending } = useUpdateSchoolMutation(props.pk);

  function handleSubmit(values: z.infer<typeof SchoolSchema>) {
    setAlert({
      state: true,
      content: (
        <ActionAlert
          title={`${values.name}의 정보를 수정할까요?`}
          description="수정한 내용은 즉시 반영돼요."
          action="수정하기"
          loading="수정하는 중"
          onAction={() => mutate(values)}
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
          onAction={() => form.reset()}
        />
      ),
    });
  }

  if (school.error) {
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
          {isAxiosError(school.error)
            ? (school.error.response?.data.message ?? "알 수 없는 에러")
            : school.error.message}
        </div>
      </div>
    );
  }

  if (school.isLoading || !school.data || !form.formState.defaultValues) {
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        학교 정보를 불러오고 있어요.
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
      <Table>
        <TableBody>
          {SCHOOL_FORM.map((column) => (
            <TableRow key={column.key}>
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
  );
}
