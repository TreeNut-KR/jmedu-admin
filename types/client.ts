/* eslint-disable @typescript-eslint/no-explicit-any */
import { FunctionComponent, HTMLInputTypeAttribute, ReactNode } from "react";
import { z } from "zod";
import { THEME } from "@/constants";

export type Theme = (typeof THEME)[keyof typeof THEME];

export interface Dialog {
  state: boolean;
  content: ReactNode | ReactNode[];
}

export interface Alert {
  state: boolean;
  content: ReactNode | ReactNode[];
}

export interface SelectorOption<T> {
  value: T;
  label: string;
}

export type ColumnDef<T> = {
  header?: string;
  accessor?: keyof T;
  renderer?: (data: T) => ReactNode;
  hidden?: boolean;
}[];

export type FormDef<T extends z.ZodObject<any>> = {
  type: HTMLInputTypeAttribute;
  key: keyof z.infer<T>;
  label: string;
  custom?: FunctionComponent<React.InputHTMLAttributes<HTMLInputElement>>;
  onChange?: (event: any) => void;
}[];
