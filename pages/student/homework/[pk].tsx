import Head from "next/head";
import { useRouter } from "next/router";
import WithAuthorization from "@/components/WithAuthorization";
import ViewStudentHomeworkTable from "@/components/tables/ViewStudentHomeworkTable";

export default function ViewStudentHomeworkPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>학생 과제 조회 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">학생 과제 조회</h1>
        <WithAuthorization requiredPermission={"student_homework_view"} isFallback>
          {typeof router.query.pk === "string" ? (
            <ViewStudentHomeworkTable pk={router.query.pk} />
          ) : (
            <div>올바르지 않은 학생 아이디 입니다.</div>
          )}
        </WithAuthorization>
      </div>
    </>
  );
}
