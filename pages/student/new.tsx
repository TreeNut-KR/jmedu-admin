import Head from "next/head";
import WithAuthorization from "@/components/WithAuthorization";
import CreateStudentForm from "@/components/forms/CreateStudentForm";

export default function NewStudentPage() {
  return (
    <>
      <Head>
        <title>학생 추가 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">학생 추가</h1>
        <WithAuthorization requiredPermission={"student_add"} isFallback>
          <CreateStudentForm />
        </WithAuthorization>
      </div>
    </>
  );
}
