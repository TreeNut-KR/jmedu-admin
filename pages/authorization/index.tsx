import Head from "next/head";
import LoginForm from "@/components/forms/LoginForm";

export default function AuthorizationPage() {
  return (
    <>
      <Head>
        <title>로그인 - 제이엠에듀</title>
      </Head>
      <div className="absolute inset-0 h-full w-full bg-adaptiveGray-50">
        <div className="mx-auto mt-[20vh] flex w-full max-w-md flex-col gap-4 p-8">
          <h1 className="text-2xl font-bold">로그인</h1>
          <LoginForm />
        </div>
      </div>
    </>
  );
}
