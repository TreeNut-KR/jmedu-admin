import Head from "next/head";
import WithAuthorization from "@/components/WithAuthorization";
import CreateSchoolForm from "@/components/forms/CreateSchoolForm";

export default function NewSchoolPage() {
  return (
    <>
      <Head>
        <title>학교 추가 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">학교 추가</h1>
        <WithAuthorization requiredPermission={"school_add"} isFallback>
          <CreateSchoolForm />
        </WithAuthorization>
      </div>
    </>
  );
}
