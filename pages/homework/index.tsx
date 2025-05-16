import Head from "next/head";
import WithAuthorization from "@/components/WithAuthorization";
import HomeworkListTable from "@/components/tables/HomeworkListTable";

export default function HomeworkPage() {
  return (
    <>
      <Head>
        <title>과제 관리 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">과제 관리</h1>
        <WithAuthorization requiredPermission={"homeworks_view"} isFallback>
          <HomeworkListTable />
        </WithAuthorization>
      </div>
    </>
  );
}
