import { Check, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/utils/shadcn";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BooleanSelectorProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const BooleanSelector = React.forwardRef<HTMLInputElement, BooleanSelectorProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, type, id, ...props }, ref) => {
    const uniqueId = React.useId();
    const checkboxId = React.useMemo(() => id ?? uniqueId, [id, uniqueId]);

    return (
      <fieldset
        className={cn([
          "inline-grid w-auto min-w-44 cursor-pointer grid-cols-2 gap-1 rounded-sm bg-adaptiveGray-100 p-1",
          className,
        ])}
      >
        <input type="checkbox" ref={ref} id={checkboxId} className="peer sr-only" {...props} />
        <label
          htmlFor={checkboxId}
          className="cursor-pointer rounded-sm px-3 py-1.5 text-center text-sm font-medium text-adaptiveGray-400 transition-colors peer-checked:pointer-events-none peer-checked:bg-adaptiveBackground peer-checked:text-adaptiveBlue-500 peer-checked:shadow-sm"
        >
          <Check className="mr-1 inline h-4 w-4" strokeWidth={2.5} />
        </label>
        <label
          htmlFor={checkboxId}
          className="pointer-events-none cursor-pointer rounded-sm bg-adaptiveBackground px-3 py-1.5 text-center text-sm font-medium text-adaptiveRed-500 shadow-sm transition-colors peer-checked:pointer-events-auto peer-checked:bg-inherit peer-checked:text-adaptiveGray-400 peer-checked:shadow-none"
        >
          <X className="mr-1 inline h-4 w-4" strokeWidth={2.5} />
        </label>
      </fieldset>
    );
  },
);

BooleanSelector.displayName = "BooleanSelector";

export default BooleanSelector;
