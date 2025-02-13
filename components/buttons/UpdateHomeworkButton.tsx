import { Pencil } from "lucide-react";
import Link from "next/link";
import WithAuthorization from "@/components/WithAuthorization";
import { Button } from "@/components/shadcn/ui/button";
import useRedirectURLQuery from "@/hooks/useRedirectURLQuery";
import type * as API from "@/types/api";

export default function UpdateHomeworkButton(props: { pk: API.Homework["homework_pk"] }) {
  const { encodedCurrentURL } = useRedirectURLQuery("/homework");
  return (
    <WithAuthorization requiredPermission={"homework_edit"}>
      <Button variant="lightBlue" size="sm" asChild>
        <Link
          href={{
            pathname: `/homework/edit/${props.pk}`,
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
