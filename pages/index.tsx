import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { MENU_ITEMS } from "@/constants";

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>홈 - 제이엠에듀</title>
      </Head>
      <div className="flex flex-col gap-8 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">홈</h1>
        <div className="grid grid-cols-4 gap-4">
          {MENU_ITEMS.slice(1).map((item) => (
            <Link href={item.path} key={item.label}>
              <div className="flex items-center gap-2 rounded-md border p-4">
                <Image
                  src={process.env.NEXT_PUBLIC_BASE_PATH + item.icon}
                  alt={`${item.label} icon`}
                  width={36}
                  height={36}
                />
                <p className="text-md font-semibold">{item.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
