import { Eye } from "lucide-react";
import Link from "next/link";
import WithAuthorization from "@/components/WithAuthorization";
import { Button } from "@/components/shadcn/ui/button";
import useRedirectURLQuery from "@/hooks/useRedirectURLQuery";
import type * as API from "@/types/api";

export default function ViewHomeworkButton(props: { pk: API.Homework["homework_pk"] }) {
  const { encodedCurrentURL } = useRedirectURLQuery("/homework");
  return (
    <WithAuthorization requiredPermission={"homework_edit"}>
      <Button variant="lightGreen" size="sm" asChild>
        <Link
          href={{
            pathname: `/homework/${props.pk}`,
            query: encodedCurrentURL && { redirect: encodedCurrentURL },
          }}
        >
          <Eye size={14} />
          보기
        </Link>
      </Button>
    </WithAuthorization>
  );
}
