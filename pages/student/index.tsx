import Head from "next/head";
import WithAuthorization from "@/components/WithAuthorization";
import StudentTable from "@/components/tables/StudentTable";

export default function StudentPage() {
  return (
    <>
      <Head>
        <title>학생 관리 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">학생 관리</h1>
        <WithAuthorization requiredPermission={"students_view"} isFallback>
          <StudentTable />
        </WithAuthorization>
      </div>
    </>
  );
}
