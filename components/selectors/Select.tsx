import { cva, VariantProps } from "class-variance-authority";
import { ReactNode, useMemo } from "react";
import * as ShadcnSelect from "@/components/shadcn/ui/select";
import { cn } from "@/utils/shadcn";

const selectVariants = cva("", {
  variants: {
    size: {
      default: "",
      sm: "text-xs",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

interface SelectProps<T> extends VariantProps<typeof selectVariants> {
  className?: string | undefined;
  value: T;
  options: { value: T; label: string }[];
  placeholder?: string;
  onValueChange?: (value?: T) => void;
  left?: ReactNode | ReactNode[];
  disabled?: boolean;
}

export default function Select<T>(props: SelectProps<T>) {
  const handleValueChange = useMemo(() => {
    return (value: string) => {
      if (props.onValueChange) {
        const parsedValue = typeof props.value === "number" ? Number(value) : value;
        props.onValueChange(parsedValue as T);
      }
    };
  }, [props]);

  return (
    <ShadcnSelect.Select
      value={`${props.value}`}
      onValueChange={handleValueChange}
      disabled={props.disabled}
    >
      <ShadcnSelect.SelectTrigger
        className={cn(["w-auto gap-2", selectVariants({ size: props.size }), props.className])}
      >
        <div className="flex items-center gap-2">
          {props.left}
          <ShadcnSelect.SelectValue placeholder={props.placeholder} />
        </div>
      </ShadcnSelect.SelectTrigger>
      <ShadcnSelect.SelectContent>
        {props.options.map((option) => (
          <ShadcnSelect.SelectItem key={`${option.value}`} value={`${option.value}`}>
            <div className={cn("flex items-center gap-2", selectVariants({ size: props.size }))}>
              <span>{option.label}</span>
            </div>
          </ShadcnSelect.SelectItem>
        ))}
      </ShadcnSelect.SelectContent>
    </ShadcnSelect.Select>
  );
}
