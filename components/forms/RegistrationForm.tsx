import { zodResolver } from "@hookform/resolvers/zod";
import { josa } from "es-hangul";
import { overlay } from "overlay-kit";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ActionAlert from "@/components/alerts/ActionAlert";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/tables/Table";
import useRegistrationMutation from "@/hooks/mutations/useRegistrationMutation";
import { customErrorMap, unformatPhoneNumber } from "@/utils";
import { RegistrationSchema } from "@/schema";
import { REGISTRATION_FORM } from "@/constants/forms";

export default function RegistrationForm() {
  const form = useForm<z.infer<typeof RegistrationSchema>>({
    resolver: zodResolver(RegistrationSchema, { errorMap: customErrorMap }),
    defaultValues: {
      name: "",
      id: "",
      password: "",
      sex: 0,
      birthday: new Date(Date.now()).toISOString().split("T")[0],
      contact: "",
    },
  });

  const { mutate, isPending } = useRegistrationMutation();

  function handleSubmit(values: z.infer<typeof RegistrationSchema>) {
    overlay.open(({ isOpen, close }) => {
      return (
        <ActionAlert
          state={isOpen}
          close={close}
          title={`교직원 ${values.name}${josa.pick(values.name, "을/를")} 등록할까요?`}
          description="등록 후에도 수정할 수 있어요."
          action="등록하기"
          loading="등록하는 중"
          onAction={() => {
            mutate({
              ...values,
              contact: unformatPhoneNumber(values.contact),
            });
          }}
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
    <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
      <Table>
        <TableBody>
          {REGISTRATION_FORM.map((column) => (
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
