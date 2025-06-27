import { Trash } from "lucide-react";
import { overlay } from "overlay-kit";
import WithAuthorization from "@/components/WithAuthorization";
import DeleteStudentAlert from "@/components/alerts/DeleteStudentAlert";
import { Button } from "@/components/shadcn/ui/button";
import type * as API from "@/types/api";

export default function DeleteStudentButton(props: { pk: API.Student["student_pk"] }) {
  function handleDelete(e: React.MouseEvent) {
    const id = e.currentTarget.getAttribute("data-id");

    if (typeof id === "string") {
      overlay.open(({ isOpen, close }) => {
        return <DeleteStudentAlert state={isOpen} close={close} pk={id} />;
      });
    }
  }

  return (
    <WithAuthorization requiredPermission={"student_delete"}>
      <Button variant="lightRed" size="sm" data-id={props.pk} onClick={handleDelete}>
        <Trash size={14} />
        삭제
      </Button>
    </WithAuthorization>
  );
}
