import * as React from "react";
import Select from "@/components/selectors/Select";
import { cn } from "@/utils/shadcn";
import { SEX_OPTIONS } from "@/constants/options";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SexSelectorProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SexSelector = React.forwardRef<HTMLInputElement, SexSelectorProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, type, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [value, setValue] = React.useState<undefined | number | string>(undefined);

    React.useImperativeHandle(ref, () => {
      return {
        ...(inputRef.current as HTMLInputElement),
        set value(str: unknown) {
          if (typeof str === "string" || (typeof str === "number" && !Number.isNaN(str))) {
            setValue(str);
          }
        },
        get value(): string {
          return inputRef?.current?.value ?? "";
        },
      };
    });

    React.useEffect(() => {
      const inputEl = inputRef.current;

      if (inputEl) {
        Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set?.call(
          inputEl,
          value,
        );

        const event = new Event("input", { bubbles: true });

        inputEl.dispatchEvent(event);
      }
    }, [value]);

    function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
      if (e.target.value !== value) {
        setValue(e.target.value);
      }

      if (props.onChange) {
        props.onChange(e);
      }
    }

    return (
      <>
        <Select
          className={cn("min-w-44", className)}
          placeholder="성별을 선택하세요."
          options={SEX_OPTIONS}
          value={value}
          onValueChange={(value) => setValue(value ?? 0)}
          disabled={props.disabled}
        />
        <input type="number" ref={inputRef} {...props} onChange={handleOnChange} hidden />
      </>
    );
  },
);

SexSelector.displayName = "SexSelector";

export default SexSelector;
