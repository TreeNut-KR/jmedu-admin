import { QrCode } from "lucide-react";
import { overlay } from "overlay-kit";

import QRCodeDialog from "@/components/dialogs/QRCodeDialog";
import { Button } from "@/components/shadcn/ui/button";
import type * as API from "@/types/api";

export default function ShowStudentQRButton(props: { pk: API.Student["student_pk"] }) {
  function handleQRCode(e: React.MouseEvent) {
    const id = e.currentTarget.getAttribute("data-id");

    if (typeof id === "string") {
      overlay.open(({ isOpen, close }) => {
        return <QRCodeDialog state={isOpen} close={close} pk={id} />;
      });
    }
  }

  return (
    <Button variant="secondary" size="sm" data-id={props.pk} onClick={handleQRCode}>
      <QrCode size={14} />
      QR
    </Button>
  );
}
