import Head from "next/head";
import WithAuthorization from "@/components/WithAuthorization";
import AdminLogTable from "@/components/tables/AdminLogTable";

export default function StudentAttendancePage() {
  return (
    <>
      <Head>
        <title>작업 기록 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">작업 기록</h1>
        <WithAuthorization requiredPermission={"admin_log_view"} isFallback>
          <AdminLogTable />
        </WithAuthorization>
      </div>
    </>
  );
}
