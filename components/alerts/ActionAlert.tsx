import { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { MouseEvent, useRef, useState } from "react";
import {
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
} from "@/components/shadcn/ui/alert-dialog";
import { buttonVariants } from "@/components/shadcn/ui/button";

export default function ActionAlert(props: {
  title: string;
  description?: string;
  action?: string;
  loading?: string;
  onAction: (arg?: unknown) => void;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<undefined | Error>(undefined);

  async function handleAction(e: MouseEvent<HTMLButtonElement>) {
    try {
      e.preventDefault();
      setIsLoading(true);

      if (props.onAction) {
        await props.onAction();
      }
    } catch (error) {
      // console.log(error);
      if (error instanceof Error) {
        setError(error);
      } else {
        setError(new Error("알 수 없는 에러"));
      }
    } finally {
      setIsLoading(false);
      closeRef.current?.click();
    }
  }

  if (error) {
    return (
      <>
        <AlertDialogHeader>
          <AlertDialogTitle>{error.name}</AlertDialogTitle>
          <AlertDialogDescription>{error.message}</AlertDialogDescription>
        </AlertDialogHeader>
      </>
    );
  }

  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle>{props.title}</AlertDialogTitle>
        <AlertDialogDescription>{props.description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel className="hidden" ref={closeRef} />
        <AlertDialogCancel variant="secondary" disabled={isLoading}>
          아니요
        </AlertDialogCancel>
        <AlertDialogAction variant={props.variant} onClick={handleAction} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 inline animate-spin" size="16" strokeWidth="2.5" />
              {props.loading ?? "처리 중"}
            </>
          ) : (
            (props.action ?? "계속하기")
          )}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}
