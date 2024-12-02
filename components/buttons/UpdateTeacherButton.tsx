import { Pencil } from "lucide-react";
import Link from "next/link";
import WithAuthorization from "@/components/WithAuthorization";
import { Button } from "@/components/shadcn/ui/button";
import type * as API from "@/types/api";

export default function UpdateTeacherButton(props: { pk: API.Teacher["teacher_pk"] }) {
  return (
    <WithAuthorization requiredPermission={"school_edit"}>
      <Button variant="lightBlue" size="sm" asChild>
        <Link href={`/teacher/edit/${props.pk}`}>
          <Pencil size={14} />
          수정
        </Link>
      </Button>
    </WithAuthorization>
  );
}
