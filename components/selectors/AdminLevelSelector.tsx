import * as React from "react";
import Select from "@/components/selectors/Select";
import { ADMIN_LEVEL_OPTIONS } from "@/constants/options";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AdminLevelSelectorProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const AdminLevelSelector = React.forwardRef<HTMLInputElement, AdminLevelSelectorProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ className, type, ...props }, ref) => {
    const fieldsetRef = React.useRef<HTMLFieldSetElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [value, setValue] = React.useState<undefined | string | number>(undefined);

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
          placeholder="권한 레벨을 선택하세요."
          options={ADMIN_LEVEL_OPTIONS}
          value={value}
          onValueChange={(value) => setValue(value ?? 0)}
          disabled={props.disabled}
        />
        <input type="number" ref={inputRef} {...props} onChange={handleOnChange} hidden />
      </fieldset>
    );
  },
);

AdminLevelSelector.displayName = "AdminLevelSelector";

export default AdminLevelSelector;
