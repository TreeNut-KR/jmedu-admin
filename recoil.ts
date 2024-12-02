import { atom } from "recoil";
import type * as Client from "@/types/client";

export const dialogAtom = atom<undefined | Client.Dialog>({
  key: "dialogAtom",
  default: undefined,
});

export const alertAtom = atom<undefined | Client.Alert>({
  key: "alertAtom",
  default: undefined,
});
