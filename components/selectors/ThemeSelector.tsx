import { CircleHelp, MonitorCog, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import Select from "@/components/selectors/Select";
import useIsClient from "@/hooks/useIsClient";
import { THEME_OPTIONS } from "@/constants/options";

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const isClient = useIsClient();

  const IconComponent = useMemo(() => {
    if (theme === "light") {
      return Sun;
    } else if (theme === "dark") {
      return Moon;
    } else if (theme === "system") {
      return MonitorCog;
    }
    return CircleHelp;
  }, [theme]);

  return (
    <Select
      className="w-full"
      size="sm"
      options={THEME_OPTIONS}
      value={theme}
      onValueChange={(value) => {
        if (value) {
          setTheme(value);
        }
      }}
      left={isClient ? <IconComponent size={14} /> : undefined}
    />
  );
}
