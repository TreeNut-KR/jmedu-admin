import { DoorOpen } from "lucide-react";
import Link from "next/link";
import WithAuthorization from "@/components/WithAuthorization";
import { Button } from "@/components/shadcn/ui/button";
import useRedirectURLQuery from "@/hooks/useRedirectURLQuery";
import type * as API from "@/types/api";

export default function ViewStudentAttendanceButton(props: { pk: API.Student["student_pk"] }) {
  const { encodedCurrentURL } = useRedirectURLQuery("/student");

  return (
    <WithAuthorization requiredPermission={"student_attendance_view"}>
      <Button variant="lightGreen" size="sm" asChild>
        <Link
          href={{
            pathname: `/student/attendance/${props.pk}`,
            query: encodedCurrentURL && { redirect: encodedCurrentURL },
          }}
        >
          <DoorOpen size={14} />
          출결
        </Link>
      </Button>
    </WithAuthorization>
  );
}
