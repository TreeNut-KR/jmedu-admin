import { Pencil } from "lucide-react";
import Link from "next/link";
import WithAuthorization from "@/components/WithAuthorization";
import { Button } from "@/components/shadcn/ui/button";
import useRedirectURLQuery from "@/hooks/useRedirectURLQuery";
import type * as API from "@/types/api";

export default function UpdateSchoolButton(props: { pk: API.School["school_pk"] }) {
  const { encodedCurrentURL } = useRedirectURLQuery("/school");
  return (
    <WithAuthorization requiredPermission={"school_edit"}>
      <Button variant="lightBlue" size="sm" asChild>
        <Link
          href={{
            pathname: `/school/edit/${props.pk}`,
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
