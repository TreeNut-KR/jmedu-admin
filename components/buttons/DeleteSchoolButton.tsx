import { Trash } from "lucide-react";
import { useSetRecoilState } from "recoil";
import { alertAtom } from "@/recoil";
import WithAuthorization from "@/components/WithAuthorization";
import DeleteSchoolAlert from "@/components/alerts/DeleteSchoolAlert";
import { Button } from "@/components/shadcn/ui/button";
import type * as API from "@/types/api";

export default function DeleteSchoolButton(props: { pk: API.School["school_pk"] }) {
  const setAlert = useSetRecoilState(alertAtom);

  function handleDelete(e: React.MouseEvent) {
    const id = e.currentTarget.getAttribute("data-id");

    if (typeof id === "string") {
      setAlert({
        state: true,
        content: <DeleteSchoolAlert pk={Number(id)} />,
      });
    }
  }

  return (
    <WithAuthorization requiredPermission={"school_delete"}>
      <Button variant="lightRed" size="sm" data-id={props.pk} onClick={handleDelete}>
        <Trash size={14} />
        삭제
      </Button>
    </WithAuthorization>
  );
}
