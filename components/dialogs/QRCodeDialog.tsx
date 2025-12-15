import { Loader2 } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import * as API from "@/types/api";
import {
  ResponsiveDialog,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/dialogs/ResponsiveDialog";
import { Button } from "@/components/shadcn/ui/button";
import useGetStudentQuery from "@/hooks/queries/useGetStudentQuery";

export default function QRCodeDialog(props: {
  state: boolean;
  close: () => void;
  pk: API.Student["student_pk"];
}) {
  const student = useGetStudentQuery(props.pk);

  const [image, setImage] = useState<undefined | string>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<undefined | Error>(undefined);

  const handleChangeOpen = useCallback(
    (state: boolean) => {
      if (!state) props.close();
    },
    [props],
  );

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  if (error) {
    return (
      <ResponsiveDialog open={props.state} onOpenChange={handleChangeOpen}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="sr-only"></ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH}/tossface/u26A0.svg`}
                  width={20}
                  height={20}
                  alt="warning icon"
                />
                <span>에러가 발생했어요.</span>
              </div>
              <div className="text-sm text-adaptiveGray-700">{error.message}</div>
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    );
  }

  if (student.isLoading || !student.data) {
    return (
      <ResponsiveDialog open={props.state} onOpenChange={handleChangeOpen}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="sr-only"></ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="flex items-center">
              <Loader2
                className="mr-2 animate-spin text-adaptiveBlue-500"
                size="16"
                strokeWidth="2.5"
              />
              학생 정보를 받아오고 있어요.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    );
  }

  if (isLoading || !image) {
    return (
      <ResponsiveDialog open={props.state} onOpenChange={handleChangeOpen}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="sr-only"></ResponsiveDialogTitle>
            <ResponsiveDialogDescription className="flex items-center">
              <Loader2
                className="mr-2 animate-spin text-adaptiveBlue-500"
                size="16"
                strokeWidth="2.5"
              />
              QR 코드를 생성하고 있어요.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    );
  }

  return (
    <ResponsiveDialog open={props.state} onOpenChange={handleChangeOpen}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>학생 {student.data?.data?.name} QR 코드</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            아래 QR 코드를 등하원에 사용해요.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <div className="flex flex-col items-center justify-center">
          <Image src={image} alt="qr code" width="200" height="200" />
        </div>
        <ResponsiveDialogFooter>
          <ResponsiveDialogClose asChild>
            <Button size="lg" variant="secondary">
              닫기
            </Button>
          </ResponsiveDialogClose>
          <Button size="lg" onClick={handleDownload}>
            다운로드
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
