import Head from "next/head";
import WithAuthorization from "@/components/WithAuthorization";
import SchoolListTable from "@/components/tables/SchoolListTable";

export default function SchoolPage() {
  return (
    <>
      <Head>
        <title>학교 관리 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">학교 관리</h1>
        <WithAuthorization requiredPermission={"schools_view"} isFallback>
          <SchoolListTable />
        </WithAuthorization>
      </div>
    </>
  );
}
