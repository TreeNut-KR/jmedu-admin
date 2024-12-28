import * as DialogPrimitive from "@radix-ui/react-dialog";
import React, { forwardRef, HTMLAttributes } from "react";

import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/shadcn/ui/dialog";
import {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
} from "@/components/shadcn/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/utils/shadcn";

// TODO: 반응형 전환시 상태 유지
export const ResponsiveDialog = (props: React.ComponentProps<typeof DialogPrimitive.Root>) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? <Dialog {...props} /> : <Drawer {...props} />;
};
ResponsiveDialog.displayName = "ResponsiveDialog";

export const ResponsiveDialogPortal = (
  props: React.ComponentProps<typeof DialogPrimitive.Portal>,
) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? <DialogPortal {...props} /> : <DrawerPortal {...props} />;
};
ResponsiveDialogPortal.displayName = "ResponsiveDialogPortal";

export const ResponsiveDialogOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>((props, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? (
    <DialogOverlay ref={ref} {...props} />
  ) : (
    <DrawerOverlay ref={ref} {...props} />
  );
});
ResponsiveDialogOverlay.displayName = "ResponsiveDialogOverlay";

export const ResponsiveDialogTrigger = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>((props, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? (
    <DialogTrigger ref={ref} {...props} />
  ) : (
    <DrawerTrigger ref={ref} {...props} />
  );
});
ResponsiveDialogTrigger.displayName = "ResponsiveDialogTrigger";

export const ResponsiveDialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? (
    <DialogContent ref={ref} className={className} {...props} />
  ) : (
    <DrawerContent
      ref={ref}
      className={cn("mx-auto max-w-xl rounded-t-2xl p-6", className)}
      {...props}
    />
  );
});
ResponsiveDialogContent.displayName = "ResponsiveDialogContent";

export const ResponsiveDialogHeader = (props: HTMLAttributes<HTMLDivElement>) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? <DialogHeader {...props} /> : <DrawerHeader {...props} />;
};
ResponsiveDialogHeader.displayName = "ResponsiveDialogHeader";

export const ResponsiveDialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>((props, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? <DialogTitle ref={ref} {...props} /> : <DrawerTitle ref={ref} {...props} />;
});
ResponsiveDialogTitle.displayName = "ResponsiveDialogTitle";

export const ResponsiveDialogDescription = forwardRef<
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
ResponsiveDialogDescription.displayName = "ResponsiveDialogDescription";

export const ResponsiveDialogFooter = (props: HTMLAttributes<HTMLDivElement>) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? <DialogFooter {...props} /> : <DrawerFooter {...props} />;
};
ResponsiveDialogFooter.displayName = "ResponsiveDialogFooter";

export const ResponsiveDialogClose = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>((props, ref) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? <DialogClose ref={ref} {...props} /> : <DrawerClose ref={ref} {...props} />;
});
ResponsiveDialogClose.displayName = "ResponsiveDialogClose";
