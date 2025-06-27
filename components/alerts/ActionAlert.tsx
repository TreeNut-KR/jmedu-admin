import { VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { MouseEvent, useCallback, useRef, useState } from "react";
import {
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogHeader,
  AlertDialog,
  AlertDialogContent,
} from "@/components/shadcn/ui/alert-dialog";
import { buttonVariants } from "@/components/shadcn/ui/button";

export default function ActionAlert(props: {
  state: boolean;
  close: () => void;
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

  const handleChangeOpen = useCallback(
    (state: boolean) => {
      if (!state) props.close();
    },
    [props],
  );

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
      <AlertDialog open={props.state} onOpenChange={handleChangeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{error.name}</AlertDialogTitle>
            <AlertDialogDescription>{error.message}</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={props.state} onOpenChange={handleChangeOpen}>
      <AlertDialogContent>
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
      </AlertDialogContent>
    </AlertDialog>
  );
}
