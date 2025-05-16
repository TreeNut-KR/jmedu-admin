import { isAxiosError } from "axios";
import {
  Check,
  ChevronDown,
  Loader,
  Lock,
  LogIn,
  LogOut,
  LucideProps,
  MonitorSmartphone,
  Moon,
  Sun,
  TriangleAlert,
  User,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { FunctionComponent, useEffect, useMemo, useState } from "react";
import * as Client from "@/types/client";
import { Button } from "@/components/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import useLogoutMutation from "@/hooks/mutations/useLogoutMutation";
import useAuthStatusQuery from "@/hooks/queries/useAuthStatusQuery";
import { cn } from "@/utils/shadcn";

export default function Profile() {
  const authStatus = useAuthStatusQuery();
  const { mutate: logout } = useLogoutMutation();
  const { theme: currentTheme, themes, setTheme } = useTheme();

  const isInvaildTheme = useMemo(
    () => !themes.find((theme) => theme === currentTheme),
    [themes, currentTheme],
  );

  const [isOpenSub, setIsOpenSub] = useState(false);
  const [isDealyedInvaildTheme, setIsDelayedInvaildTheme] = useState(false);
  const [delayedCurrentTheme, setDelayedCurrentTheme] = useState(currentTheme);

  useEffect(() => {
    if (isOpenSub) return;

    const timer = setTimeout(() => {
      setIsDelayedInvaildTheme(!themes.find((theme) => theme === currentTheme));
    }, 150);

    return () => clearTimeout(timer);
  }, [themes, currentTheme, isOpenSub]);

  useEffect(() => {
    if (isOpenSub) return;

    const timer = setTimeout(() => {
      setDelayedCurrentTheme(currentTheme);
    }, 150);

    return () => clearTimeout(timer);
  }, [currentTheme, isOpenSub]);

  const themeOptions = useMemo<{ key: Client.Theme; label: string; Icon: FunctionComponent }[]>(
    () => [
      { key: "light", label: "밝은 화면", Icon: Sun },
      { key: "dark", label: "어두운 화면", Icon: Moon },
      { key: "system", label: "시스템 설정", Icon: MonitorSmartphone },
    ],
    [],
  );

  const triggerCn = useMemo(() => "flex items-center gap-2", []);
  const triggerLabelCn = useMemo(() => "text-xs font-normal tracking-wide", []);
  const triggerIconProps = useMemo<Partial<LucideProps>>(
    () => ({
      size: 14,
      strokeWidth: 2,
    }),
    [],
  );

  const dropdownContentCn = useMemo(() => "space-y-1 p-1.5", []);
  const dropdownItemCn = useMemo(() => "text-xs font-normal tracking-wide [&_svg]:size-3.5", []);

  const ThemeIcon = useMemo(() => {
    if (currentTheme === "light") return Sun;
    if (currentTheme === "dark") return Moon;
    if (currentTheme === "system") return MonitorSmartphone;
    return TriangleAlert;
  }, [currentTheme]);

  const TriggerComponent = useMemo(() => {
    if (authStatus.error) {
      return (
        <Button variant="outline">
          <div className={cn(triggerCn, "text-adaptiveRed-500")}>
            <TriangleAlert {...triggerIconProps} />
            <span className={triggerLabelCn}>에러</span>
          </div>
        </Button>
      );
    }

    if (authStatus.isLoading)
      return (
        <Button variant="outline" disabled>
          <div className={triggerCn}>
            <Loader className="animate-spine text-adaptiveBlue-500" {...triggerIconProps} />
            <span className={triggerLabelCn}>로딩중</span>
          </div>
        </Button>
      );

    if (authStatus.data?.success) {
      return (
        <Button variant="outline">
          <div className={triggerCn}>
            <User {...triggerIconProps} />
            <span className={triggerLabelCn}>
              {authStatus.data.success ? authStatus.data.data?.name : ""}
            </span>
          </div>
          <ChevronDown {...triggerIconProps} />
        </Button>
      );
    }

    return (
      <Button variant="outline">
        <div className={triggerCn}>
          <Lock {...triggerIconProps} />
          <span className={triggerLabelCn}>로그인이 필요해요.</span>
        </div>
        <ChevronDown {...triggerIconProps} />
      </Button>
    );
  }, [authStatus, triggerIconProps, triggerCn, triggerLabelCn]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{TriggerComponent}</DropdownMenuTrigger>
      <DropdownMenuContent className={dropdownContentCn}>
        {authStatus.error && (
          <>
            <DropdownMenuItem className={dropdownItemCn} disabled>
              <div className="max-w-48 whitespace-pre-line">
                <div className="mb-1 font-semibold">
                  {isAxiosError(authStatus.error)
                    ? "로그인 에러"
                    : (authStatus.error?.name ?? "알 수 없는 에러")}
                </div>
                {isAxiosError(authStatus.error)
                  ? (authStatus.error.response?.data.message ?? "알 수 없는 에러 메시지")
                  : (authStatus.error?.message ?? "알 수 없는 에러 메시지")}
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {(authStatus.error || authStatus.data?.success === false) && (
          <>
            <DropdownMenuItem className={dropdownItemCn} asChild>
              <Link href="/authorization">
                <LogIn {...triggerIconProps} />
                <span>로그인</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {(authStatus.error || authStatus.data?.success) && (
          <>
            <DropdownMenuItem className={dropdownItemCn} onSelect={() => logout()}>
              <LogOut {...triggerIconProps} />
              <span>로그아웃</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuSub onOpenChange={(state) => setIsOpenSub(state)}>
          <DropdownMenuSubTrigger className={dropdownItemCn}>
            <ThemeIcon
              {...triggerIconProps}
              className={cn(isDealyedInvaildTheme && "text-adaptiveRed-500")}
            />
            <span>화면 설정</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className={dropdownContentCn}>
              {isDealyedInvaildTheme && (
                <DropdownMenuItem className={cn(dropdownItemCn)} disabled>
                  <TriangleAlert {...triggerIconProps} className="text-adaptiveRed-500" />
                  <span>올바르지 않은 값 ({JSON.stringify(delayedCurrentTheme)})</span>
                  <Check
                    {...triggerIconProps}
                    className={cn("ml-auto opacity-0", isInvaildTheme && "opacity-1")}
                  />
                </DropdownMenuItem>
              )}
              {themeOptions.map(({ key, label, Icon }) => (
                <DropdownMenuItem
                  key={key}
                  className={cn(
                    dropdownItemCn,
                    currentTheme === key &&
                      "font-medium text-adaptiveBlue-500 data-[highlighted]:text-adaptiveBlue-500 [&_svg]:stroke-[2.5px]",
                  )}
                  onSelect={() => setTheme(key)}
                >
                  <Icon {...triggerIconProps} />
                  {label}
                  <Check
                    {...triggerIconProps}
                    className={cn("ml-auto opacity-0", currentTheme === key && "opacity-1")}
                  />
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
