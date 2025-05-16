import Head from "next/head";
import WithAuthorization from "@/components/WithAuthorization";
import StudentsAttendanceListTable from "@/components/tables/StudentsAttendanceListTable";

export default function StudentAttendancePage() {
  return (
    <>
      <Head>
        <title>등하원 기록 - 제이엠에듀</title>
      </Head>
      <div className="space-y-6 p-8">
        <h1 className="text-xl font-bold text-adaptiveGray-800">등하원 기록</h1>
        <WithAuthorization requiredPermission={"students_attendance_view"} isFallback>
          <StudentsAttendanceListTable />
        </WithAuthorization>
      </div>
    </>
  );
}
