import { MonitorSmartphone, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { FunctionComponent, useMemo } from "react";
import { Button } from "@/components/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import type * as Client from "@/types/client";

export default function ThemeToggleButton() {
  const { setTheme } = useTheme();

  const themeOptions = useMemo<{ key: Client.Theme; label: string; Icon: FunctionComponent }[]>(
    () => [
      { key: "light", label: "밝은 화면", Icon: Sun },
      { key: "dark", label: "어두운 화면", Icon: Moon },
      { key: "system", label: "시스템 설정", Icon: MonitorSmartphone },
    ],
    [],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1rem] w-[1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1rem] w-[1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="space-y-1 p-1.5" align="end">
        {themeOptions.map(({ Icon, ...option }) => (
          <DropdownMenuItem
            key={option.key}
            className="text-xs"
            onClick={() => setTheme(option.key)}
          >
            <Icon />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
