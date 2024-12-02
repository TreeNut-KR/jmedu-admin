import Head from "next/head";
import WithAuthorization from "@/components/WithAuthorization";
import PermissionTable from "@/components/tables/PermissionTable";

export default function PermissionPage() {
  return (
    <>
      <Head>
        <title>작업 권한 관리 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">작업 권한 관리</h1>
        <WithAuthorization requiredPermission={"permissions_view"} isFallback>
          <PermissionTable />
        </WithAuthorization>
      </div>
    </>
  );
}
