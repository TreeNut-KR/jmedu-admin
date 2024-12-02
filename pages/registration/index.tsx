import Head from "next/head";
import RegistrationForm from "@/components/forms/RegistrationForm";

export default function RegistrationPage() {
  return (
    <>
      <Head>
        <title>신규등록 - 제이엠에듀</title>
      </Head>
      <div className="flex flex-col gap-8 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">신규등록</h1>
        <RegistrationForm />
      </div>
    </>
  );
}
