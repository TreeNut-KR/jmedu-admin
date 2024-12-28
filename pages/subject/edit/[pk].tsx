import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import WithAuthorization from "@/components/WithAuthorization";
import { UpdateSubjectForm } from "@/components/forms/UpdateSubjectForm";

export default function EditSubjectPage() {
  const router = useRouter();

  const subject_pk = useMemo(() => {
    if (typeof router.query.pk !== "string" || Number.isNaN(Number(router.query.pk))) {
      return undefined;
    }
    return Number(router.query.pk);
  }, [router.query.pk]);

  return (
    <>
      <Head>
        <title>과목 수정 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">과목 수정</h1>
        <WithAuthorization requiredPermission={"subject_edit"} isFallback>
          {subject_pk != undefined ? (
            <UpdateSubjectForm pk={subject_pk} />
          ) : (
            <div>올바르지 않은 과목 아이디 입니다.</div>
          )}
        </WithAuthorization>
      </div>
    </>
  );
}
