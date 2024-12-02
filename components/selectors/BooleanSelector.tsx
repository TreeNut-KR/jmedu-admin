import * as React from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BooleanSelectorProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const BooleanSelector = React.forwardRef<HTMLInputElement, BooleanSelectorProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, type, ...props }, ref) => {
    return <input type="checkbox" ref={ref} {...props} />;
  },
);

BooleanSelector.displayName = "BooleanSelector";

export default BooleanSelector;
