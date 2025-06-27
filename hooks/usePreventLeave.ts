import { useRouter } from "next/router";
import { useEffect } from "react";

export default function usePreventLeave(state: boolean) {
  const router = useRouter();

  useEffect(() => {
    function beforeUnloadHandler(e: Event) {
      e.preventDefault();
      // @ts-expect-error 호환성
      e.returnValue = "";
    }

    function beforePopStateHnalder({ as }: { as: string }) {
      if (router.basePath + router.asPath !== as) {
        const choice = confirm("뒤로가기 시 페이지 내용은 저장되지 않습니다. 이동하시겠습니까?");

        if (!choice) {
          window.history.forward();
        }

        return choice;
      }

      return true;
    }

    if (state) {
      window.addEventListener("beforeunload", beforeUnloadHandler);
      router.beforePopState(beforePopStateHnalder);
    } else {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      router.beforePopState(() => true);
    }

    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      router.beforePopState(() => true);
    };
  }, [state, router]);
}
