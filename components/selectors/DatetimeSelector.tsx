import * as React from "react";
import { cn } from "@/utils/shadcn";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DatetimeSelectorProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const DatetimeSelector = React.forwardRef<HTMLInputElement, DatetimeSelectorProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, type, id, ...props }, ref) => {
    return (
      <input
        type="datetime-local"
        ref={ref}
        step={1}
        className={cn(
          "flex h-10 min-w-44 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    );
  },
);

DatetimeSelector.displayName = "DatetimeSelector";

export default DatetimeSelector;
