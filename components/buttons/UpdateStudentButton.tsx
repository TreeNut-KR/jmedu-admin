import { Pencil } from "lucide-react";
import Link from "next/link";
import WithAuthorization from "@/components/WithAuthorization";
import { Button } from "@/components/shadcn/ui/button";
import useRedirectURLQuery from "@/hooks/useRedirectURLQuery";
import type * as API from "@/types/api";

export default function UpdateStudentButton(props: { pk: API.Student["student_pk"] }) {
  const { encodedCurrentURL } = useRedirectURLQuery("/student");

  return (
    <WithAuthorization requiredPermission={"student_edit"}>
      <Button variant="lightBlue" size="sm" asChild>
        <Link
          href={{
            pathname: `/student/edit/${props.pk}`,
            query: encodedCurrentURL && { redirect: encodedCurrentURL },
          }}
        >
          <Pencil size={14} />
          수정
        </Link>
      </Button>
    </WithAuthorization>
  );
}
