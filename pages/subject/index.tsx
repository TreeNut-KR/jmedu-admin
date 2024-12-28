import Head from "next/head";
import WithAuthorization from "@/components/WithAuthorization";
import SubjectTable from "@/components/tables/SubjectTable";

export default function SubjectPage() {
  return (
    <>
      <Head>
        <title>과목 관리 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">과목 관리</h1>
        <WithAuthorization requiredPermission={"subjects_view"} isFallback>
          <SubjectTable />
        </WithAuthorization>
      </div>
    </>
  );
}
