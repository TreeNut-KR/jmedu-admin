import { Loader2 } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as API from "@/types/api";
import {
  GlobalDialogClose,
  GlobalDialogDescription,
  GlobalDialogFooter,
  GlobalDialogHeader,
  GlobalDialogTitle,
} from "@/components/dialogs/GlobalDialog";
import { Button } from "@/components/shadcn/ui/button";
import useGetStudentQuery from "@/hooks/queries/useGetStudentQuery";

export default function QRCodeDialog(props: { pk: API.Student["student_pk"] }) {
  const student = useGetStudentQuery(props.pk);

  const [image, setImage] = useState<undefined | string>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<undefined | Error>(undefined);

  useEffect(() => {
    setIsLoading(true);

    QRCode.toDataURL(props.pk, (error, url) => {
      if (error) {
        setError(error);
        setIsLoading(false);
      }

      setImage(url);
      setIsLoading(false);
    });
  }, [props.pk]);

  function handleDownload() {
    try {
      if (image && student.data?.data?.name) {
        const link = document.createElement("a");
        link.href = image;
        link.download = `${student.data.data.name}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error(error);

      toast.error("QR 코드 이미지 다운로드에 실패했어요.", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  if (error) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Image src="/tossface/u26A0.svg" width={20} height={20} alt="warning icon" />
          <span>에러가 발생했어요.</span>
        </div>
        <div className="text-sm text-adaptiveGray-700">{error.message}</div>
      </div>
    );
  }

  if (student.isLoading || !student.data) {
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        학생 정보를 받아오고 있어요.
      </div>
    );
  }

  if (isLoading || !image) {
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        QR 코드를 생성하고 있어요.
      </div>
    );
  }

  return (
    <>
      <GlobalDialogHeader>
        <GlobalDialogTitle>학생 {student.data?.data?.name} QR 코드</GlobalDialogTitle>
        <GlobalDialogDescription>아래 QR 코드를 등하원에 사용해요.</GlobalDialogDescription>
      </GlobalDialogHeader>
      <div className="flex flex-col items-center justify-center">
        <Image src={image} alt="qr code" width="200" height="200" />
      </div>
      <GlobalDialogFooter>
        <GlobalDialogClose asChild>
          <Button size="lg" variant="secondary">
            닫기
          </Button>
        </GlobalDialogClose>
        <Button size="lg" onClick={handleDownload}>
          다운로드
        </Button>
      </GlobalDialogFooter>
    </>
  );
}
