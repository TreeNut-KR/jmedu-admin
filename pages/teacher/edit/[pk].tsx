import Head from "next/head";
import { useRouter } from "next/router";
import WithAuthorization from "@/components/WithAuthorization";
import UpdateTeacherForm from "@/components/forms/UpdateTeacherForm";

export default function EditTeacherPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>교직원 수정 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">교직원 수정</h1>
        <WithAuthorization requiredPermission={"teacher_edit"} isFallback>
          {typeof router.query.pk === "string" ? (
            <UpdateTeacherForm pk={router.query.pk} />
          ) : (
            <div>올바르지 않은 교직원 아이디 입니다.</div>
          )}
        </WithAuthorization>
      </div>
    </>
  );
}
