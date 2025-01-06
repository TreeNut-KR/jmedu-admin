import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import WithAuthorization from "@/components/WithAuthorization";
import { cn } from "@/utils/shadcn";
import { MENU_ITEMS } from "@/constants";

export default function Navigation(props: { className?: string }) {
  const router = useRouter();
  const { pathname: path } = router;

  return (
    <nav
      className={cn(
        "sticky top-0 flex h-screen w-52 flex-col border-r border-adaptiveGray-200 bg-adaptiveGray-50 px-8",
        props.className,
      )}
    >
      <div className="flex h-[68px] items-end py-4"></div>
      <div className="mt-6 space-y-2">
        {MENU_ITEMS.map((item) => {
          const isActive = `/${path.split("/")[1]}` === item.path;

          return (
            <WithAuthorization key={item.label} requiredPermission={item.permission ?? []}>
              <Link
                href={item.path}
                className={cn([
                  "font-semibold text-adaptiveGray-700",
                  isActive && "font-bold text-adaptiveBlue-500",
                  "py-2",
                  "flex",
                  "items-center",
                  "gap-2",
                ])}
              >
                <Image
                  src={process.env.NEXT_PUBLIC_BASE_PATH + item.icon}
                  alt={`${item.label} icon`}
                  className="mr-1"
                  width={28}
                  height={28}
                />
                <span className="text-md text-nowrap">{item.label}</span>
              </Link>
            </WithAuthorization>
          );
        })}
      </div>
    </nav>
  );
}
