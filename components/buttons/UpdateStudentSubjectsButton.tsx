import { LibraryBig } from "lucide-react";
import { useSetRecoilState } from "recoil";
import { dialogAtom } from "@/recoil";
import WithAuthorization from "@/components/WithAuthorization";
import UpdateStudentSubjectsDialog from "@/components/dialogs/UpdateStudentSubjectsDialog";
import { Button } from "@/components/shadcn/ui/button";
import type * as API from "@/types/api";

export default function UpdateStudentSubjectsButton(props: { pk: API.Student["student_pk"] }) {
  const setDialog = useSetRecoilState(dialogAtom);

  function handleDelete(e: React.MouseEvent) {
    const pk = e.currentTarget.getAttribute("data-pk");

    if (typeof pk === "string") {
      setDialog({
        state: true,
        content: <UpdateStudentSubjectsDialog pk={pk} />,
      });
    }
  }

  return (
    <WithAuthorization requiredPermission={"student_subjects_edit"}>
      <Button variant="lightGreen" size="sm" data-pk={props.pk} onClick={handleDelete}>
        <LibraryBig size={14} />
        수강 과목
      </Button>
    </WithAuthorization>
  );
}
