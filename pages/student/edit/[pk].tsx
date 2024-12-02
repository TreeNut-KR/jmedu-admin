import Head from "next/head";
import { useRouter } from "next/router";
import WithAuthorization from "@/components/WithAuthorization";
import UpdateStudentForm from "@/components/forms/UpdateStudentForm";

export default function EditStudentPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>학생 수정 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">학생 수정</h1>
        <WithAuthorization requiredPermission={"student_edit"} isFallback>
          {typeof router.query.pk === "string" ? (
            <UpdateStudentForm pk={router.query.pk} />
          ) : (
            <div>올바르지 않은 학생 아이디 입니다.</div>
          )}
        </WithAuthorization>
      </div>
    </>
  );
}
