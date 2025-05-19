import { NotebookPen } from "lucide-react";
import Link from "next/link";
import WithAuthorization from "@/components/WithAuthorization";
import { Button } from "@/components/shadcn/ui/button";
import useRedirectURLQuery from "@/hooks/useRedirectURLQuery";
import type * as API from "@/types/api";

export default function ViewStudentHomeworkButton(props: { pk: API.Student["student_pk"] }) {
  const { encodedCurrentURL } = useRedirectURLQuery("/student");

  return (
    <WithAuthorization requiredPermission={"student_homework_view"}>
      <Button variant="lightGreen" size="sm" asChild>
        <Link
          href={{
            pathname: `/student/homework/${props.pk}`,
            query: encodedCurrentURL && { redirect: encodedCurrentURL },
          }}
        >
          <NotebookPen size={14} />
          과제
        </Link>
      </Button>
    </WithAuthorization>
  );
}
