import Head from "next/head";
import WithAuthorization from "@/components/WithAuthorization";
import CreateSubjectForm from "@/components/forms/CreateSubjectForm";

export default function NewSubjectPage() {
  return (
    <>
      <Head>
        <title>과목 추가 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">과목 추가</h1>
        <WithAuthorization requiredPermission={"subject_add"} isFallback>
          <CreateSubjectForm />
        </WithAuthorization>
      </div>
    </>
  );
}
