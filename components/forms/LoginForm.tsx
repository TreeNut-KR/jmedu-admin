import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import useLoginMutation from "@/hooks/mutations/useLoginMutation";
import { customErrorMap } from "@/utils";
import { cn } from "@/utils/shadcn";
import { LoginSchema } from "@/schema";

interface LoginFormProps {
  className?: string;
}

export default function LoginForm(props: LoginFormProps) {
  const { mutate, isPending } = useLoginMutation();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema, { errorMap: customErrorMap }),
    defaultValues: {
      id: "",
      password: "",
    },
  });

  function handleSumbit(data: z.infer<typeof LoginSchema>) {
    mutate(data);
  }

  return (
    <form
      className={cn("flex flex-col gap-6", props.className)}
      onSubmit={form.handleSubmit(handleSumbit)}
    >
      <div className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2">
          <Label htmlFor="id">아이디</Label>
          <Input type="text" id="id" placeholder="아이디" {...form.register("id")} />
          {form.formState.errors["id"]?.message ? (
            <p className="text-xs leading-6 text-adaptiveRed-500">
              {form.formState.errors["id"]?.message}
            </p>
          ) : null}
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            type="password"
            id="password"
            placeholder="비밀번호"
            {...form.register("password")}
          />
          {form.formState.errors["password"]?.message ? (
            <p className="text-xs leading-6 text-adaptiveRed-500">
              {form.formState.errors["password"]?.message}
            </p>
          ) : null}
        </fieldset>
      </div>
      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" disabled={!form.formState.isValid || isPending}>
          로그인
        </Button>
        <Button type="button" size="lg" variant="secondary" asChild>
          <Link href="/registration">신규등록</Link>
        </Button>
      </div>
    </form>
  );
}
