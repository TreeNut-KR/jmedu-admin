import { zodResolver } from "@hookform/resolvers/zod";
import { josa } from "es-hangul";
import { useForm } from "react-hook-form";
import { useSetRecoilState } from "recoil";
import { z } from "zod";
import { alertAtom } from "@/recoil";
import ActionAlert from "@/components/alerts/ActionAlert";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/tables/Table";
import useCreateSchoolMutation from "@/hooks/mutations/useCreateSchoolMutation";
import { customErrorMap } from "@/utils";
import { SchoolSchema } from "@/schema";
import { SCHOOL_FORM } from "@/constants/forms";

export default function CreateSchoolForm() {
  const form = useForm<z.infer<typeof SchoolSchema>>({
    resolver: zodResolver(SchoolSchema, { errorMap: customErrorMap }),
    defaultValues: {
      name: "",
      is_elementary: 0,
      is_high: 0,
      is_middle: 0,
    },
  });

  const setAlert = useSetRecoilState(alertAtom);

  const { mutate, isPending } = useCreateSchoolMutation();

  function handleSubmit(values: z.infer<typeof SchoolSchema>) {
    setAlert({
      state: true,
      content: (
        <ActionAlert
          title={`${values.name}${josa(values.name, "을/를")} 등록할까요?`}
          description="등록 후에도 수정할 수 있어요."
          action="등록하기"
          loading="등록하는 중"
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
          등록하기
        </Button>
      </div>
    </form>
  );
}
