import { ShieldCheck } from "lucide-react";
import { useSetRecoilState } from "recoil";
import { dialogAtom } from "@/recoil";
import WithAuthorization from "@/components/WithAuthorization";
import UpdateTeacherLevelDialog from "@/components/dialogs/UpdateTeacherLevelDialog";
import { Button } from "@/components/shadcn/ui/button";
import type * as API from "@/types/api";

export default function UpdateTeacherLevelButton(props: { pk: API.Teacher["teacher_pk"] }) {
  const setDialog = useSetRecoilState(dialogAtom);

  function handleDelete(e: React.MouseEvent) {
    const id = e.currentTarget.getAttribute("data-id");

    if (typeof id === "string") {
      setDialog({
        state: true,
        content: <UpdateTeacherLevelDialog pk={props.pk} />,
      });
    }
  }

  return (
    <WithAuthorization requiredPermission={"teacher_level_edit"}>
      <Button variant="lightGreen" size="sm" data-id={props.pk} onClick={handleDelete}>
        <ShieldCheck size={14} />
        권한 수정
      </Button>
    </WithAuthorization>
  );
}
