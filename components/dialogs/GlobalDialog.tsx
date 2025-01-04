import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { dialogAtom } from "@/recoil";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/dialogs/ResponsiveDialog";

export default function GlobalDialog() {
  const [dialog, setDialog] = useRecoilState(dialogAtom);

  const { pathname } = useRouter();

  function handleOpenChange(state: boolean) {
    if (dialog) {
      setDialog({
        ...dialog,
        state,
      });
    }
  }

  useEffect(() => {
    if (dialog) {
      setDialog({
        ...dialog,
        state: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!dialog) return <></>;

  return (
    <ResponsiveDialog open={dialog.state} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent>
        {dialog.content}
        <ResponsiveDialogHeader className="sr-only">
          <ResponsiveDialogTitle></ResponsiveDialogTitle>
          <ResponsiveDialogDescription></ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
