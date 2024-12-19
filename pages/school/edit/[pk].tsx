import Head from "next/head";
import { useRouter } from "next/router";
import { useMemo } from "react";
import WithAuthorization from "@/components/WithAuthorization";
import UpdateSchoolForm from "@/components/forms/UpdateSchoolForm";

export default function EditSchoolPage() {
  const router = useRouter();

  const school_pk = useMemo(() => {
    if (typeof router.query.pk !== "string" || Number.isNaN(Number(router.query.pk))) {
      return undefined;
    }
    return Number(router.query.pk);
  }, [router.query.pk]);

  return (
    <>
      <Head>
        <title>학교 수정 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">학교 수정</h1>
        <WithAuthorization requiredPermission={"school_edit"} isFallback>
          {school_pk != undefined ? (
            <UpdateSchoolForm pk={school_pk} />
          ) : (
            <div>올바르지 않은 학교 아이디 입니다.</div>
          )}
        </WithAuthorization>
      </div>
    </>
  );
}
