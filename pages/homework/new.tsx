import Head from "next/head";
import WithAuthorization from "@/components/WithAuthorization";
import CreateHomeworkForm from "@/components/forms/CreateHomeworkForm";

export default function NewHomeworkPage() {
  return (
    <>
      <Head>
        <title>과제 추가 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">과제 추가</h1>
        <WithAuthorization requiredPermission={"homework_add"} isFallback>
          <CreateHomeworkForm />
        </WithAuthorization>
      </div>
    </>
  );
}
