import { useRouter } from "next/router";
import { useMemo } from "react";
import { toast } from "sonner";

export default function useRedirectURLQuery(path: string) {
  const PATH_PATTERN = new RegExp(/^\/([A-z]|[0-9]|[-]|[_]|[.])+/);

  if (!PATH_PATTERN.test(path)) {
    throw new Error("잘못된 path 형식입니다.");
  }

  const router = useRouter();

  const encodedCurrentURL = useMemo(() => {
    if (router.asPath.startsWith(path) && Object.keys(router.query).length) {
      return encodeURIComponent(router.asPath);
    }

    return undefined;
  }, [path, router.asPath, router.query]);

  const redirectURL = useMemo(() => {
    if (router.query.redirect && typeof router.query.redirect === "string") {
      try {
        const decodeRedirectURL = decodeURIComponent(router.query.redirect);

        if (decodeRedirectURL.startsWith(`${path}?`)) {
          return decodeRedirectURL;
        }
      } catch (error) {
        toast.error(`잘못된 redirect URL이 전달되었어요.`);
        console.log("잘못된 redirect URL이 전달되었습니다.", error);
      }
    }

    return undefined;
  }, [path, router.query.redirect]);

  return {
    encodedCurrentURL,
    redirectURL,
  };
}
