import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import WithAuthorization from "@/components/WithAuthorization";
import ViewHomeworkForm from "@/components/forms/ViewHomeworkForm";

export default function ViewHomeworkPage() {
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
        <title>과제 관리 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">과제 관리</h1>
        <WithAuthorization requiredPermission={"homework_view"} isFallback>
          {homework_pk != undefined ? (
            <ViewHomeworkForm pk={homework_pk} />
          ) : (
            <div>올바르지 않은 과제 아이디 입니다.</div>
          )}
        </WithAuthorization>
      </div>
    </>
  );
}
