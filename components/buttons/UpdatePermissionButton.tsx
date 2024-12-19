import { ShieldCheck } from "lucide-react";
import { useSetRecoilState } from "recoil";
import { toast } from "sonner";
import { dialogAtom } from "@/recoil";
import WithAuthorization from "@/components/WithAuthorization";
import UpdatePermissionDialog from "@/components/dialogs/UpdatePermissionDialog";
import { Button } from "@/components/shadcn/ui/button";
import { PERMISSIONS } from "@/constants";
import type * as API from "@/types/api";

export default function UpdatePermissionButton(props: { name: API.Permission["task_name"] }) {
  const setDialog = useSetRecoilState(dialogAtom);

  function handleDelete(e: React.MouseEvent) {
    const name = e.currentTarget.getAttribute("data-name");

    if (typeof name === "string" && PERMISSIONS.find((permission) => permission === name)) {
      setDialog({
        state: true,
        content: <UpdatePermissionDialog name={props.name} />,
      });
    } else {
      toast.error(`수정하려는 권한을 찾을 수 없어요. (${name})`);
    }
  }

  return (
    <WithAuthorization requiredPermission={"permission_edit"}>
      <Button variant="lightGreen" size="sm" data-name={props.name} onClick={handleDelete}>
        <ShieldCheck size={14} />
        권한 수정
      </Button>
    </WithAuthorization>
  );
}
