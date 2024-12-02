import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useRouter } from "next/router";
import React, { forwardRef, HTMLAttributes, useEffect } from "react";
import { useRecoilState } from "recoil";
import { dialogAtom } from "@/recoil";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/shadcn/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function GlobalDialog() {
  const [dialog, setDialog] = useRecoilState(dialogAtom);

  const { pathname } = useRouter();

  const isDesktop = useMediaQuery("(min-width: 768px)");

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

  if (isDesktop) {
    return (
      <Dialog open={dialog.state} onOpenChange={handleOpenChange}>
        <DialogContent>
          {dialog.content}
          <DialogHeader className="sr-only">
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  } else {
    return (
      <Drawer open={dialog.state} onOpenChange={handleOpenChange}>
        <DrawerContent className="mx-auto max-w-xl rounded-t-2xl p-6">
          {dialog.content}
          <DrawerHeader className="sr-only">
            <DrawerTitle></DrawerTitle>
            <DrawerDescription></DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    );
  }
}

export const GlobalDialogHeader = (props: HTMLAttributes<HTMLDivElement>) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? <DialogHeader {...props} /> : <DrawerHeader {...props} />;
};
GlobalDialogHeader.displayName = "GlobalDialogHeader";

export const GlobalDialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>((props, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? <DialogTitle ref={ref} {...props} /> : <DrawerTitle ref={ref} {...props} />;
});
GlobalDialogTitle.displayName = "GlobalDialogTitle";

export const GlobalDialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>((props, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? (
    <DialogDescription ref={ref} {...props} />
  ) : (
    <DrawerDescription ref={ref} {...props} />
  );
});
GlobalDialogDescription.displayName = "GlobalDialogDescription";

export const GlobalDialogFooter = (props: HTMLAttributes<HTMLDivElement>) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? <DialogFooter {...props} /> : <DrawerFooter {...props} />;
};
GlobalDialogFooter.displayName = "GlobalDialogFooter";

export const GlobalDialogClose = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>((props, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? <DialogClose ref={ref} {...props} /> : <DrawerClose ref={ref} {...props} />;
});
GlobalDialogClose.displayName = "GlobalDialogClose";
