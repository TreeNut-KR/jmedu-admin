import * as React from "react";
import Select from "@/components/selectors/Select";
import { SEX_OPTIONS } from "@/constants/options";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SexSelectorProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const SexSelector = React.forwardRef<HTMLInputElement, SexSelectorProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, type, ...props }, ref) => {
    const fieldsetRef = React.useRef<HTMLFieldSetElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [value, setValue] = React.useState(props.value ?? 0);

    React.useImperativeHandle(ref, () => {
      return {
        ...(inputRef.current as HTMLInputElement),
        set value(str: unknown) {
          if (
            typeof str === "string" ||
            (typeof str === "number" && !Number.isNaN(str)) ||
            (Array.isArray(str) && str.every((el) => typeof el === "string" && !Number.isNaN(el)))
          ) {
            setValue(str);
          }
        },
        get value(): string {
          return inputRef?.current?.value ?? "";
        },
      };
    });

    React.useEffect(() => {
      const inputEl = fieldsetRef.current?.querySelector("input");

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
      <fieldset ref={fieldsetRef}>
        <Select
          placeholder="성별을 선택하세요."
          options={SEX_OPTIONS}
          value={value}
          onValueChange={(value) => setValue(value ?? 0)}
          disabled={props.disabled}
        />
        <input type="number" ref={inputRef} {...props} onChange={handleOnChange} hidden />
      </fieldset>
    );
  },
);

SexSelector.displayName = "SexSelector";

export default SexSelector;
