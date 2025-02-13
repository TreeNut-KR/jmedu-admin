import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import WithAuthorization from "@/components/WithAuthorization";
import { UpdateHomeworkForm } from "@/components/forms/UpdateHomeworkForm";

export default function EditHomeworkPage() {
  const router = useRouter();

  const homework_pk = useMemo(() => {
    if (typeof router.query.pk !== "string" || Number.isNaN(Number(router.query.pk))) {
      return undefined;
    }
    return Number(router.query.pk);
  }, [router.query.pk]);

  return (
    <>
      <Head>
        <title>과제 수정 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">과제 수정</h1>
        <WithAuthorization requiredPermission={"homework_edit"} isFallback>
          {homework_pk != undefined ? (
            <UpdateHomeworkForm pk={homework_pk} />
          ) : (
            <div>올바르지 않은 과제 아이디 입니다.</div>
          )}
        </WithAuthorization>
      </div>
    </>
  );
}
