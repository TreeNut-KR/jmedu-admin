import Head from "next/head";
import WithAuthorization from "@/components/WithAuthorization";
import TeacherTable from "@/components/tables/TeacherTable";

export default function TeacherPage() {
  return (
    <>
      <Head>
        <title>교직원 관리 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">교직원 관리</h1>
        <WithAuthorization requiredPermission={"teachers_view"} isFallback>
          <TeacherTable />
        </WithAuthorization>
      </div>
    </>
  );
}
