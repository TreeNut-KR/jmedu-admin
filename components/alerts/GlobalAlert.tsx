import { useRouter } from "next/router";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { alertAtom } from "@/recoil";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn/ui/alert-dialog";

export default function GlobalAlert() {
  const [alert, setAlert] = useRecoilState(alertAtom);

  const { pathname } = useRouter();

  function handleOpenChange(state: boolean) {
    if (alert) {
      setAlert({
        ...alert,
        state,
      });
    }
  }

  useEffect(() => {
    if (alert) {
      setAlert({
        ...alert,
        state: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!alert) return <></>;

  return (
    <AlertDialog open={alert.state} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        {alert.content}
        <AlertDialogHeader className="sr-only">
          <AlertDialogTitle></AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
