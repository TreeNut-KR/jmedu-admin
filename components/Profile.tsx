import Link from "next/link";
import { Button } from "@/components/shadcn/ui/button";
import useLogoutMutation from "@/hooks/mutations/useLogoutMutation";
import useAuthStatusQuery from "@/hooks/queries/useAuthStatusQuery";

export default function Profile() {
  const authStatus = useAuthStatusQuery();
  const { mutate: logout } = useLogoutMutation();

  if (authStatus.error) {
    return (
      <Button variant="destructive" size="sm" disabled>
        에러
      </Button>
    );
  }

  if (authStatus.isLoading)
    return (
      <Button size="sm" disabled>
        로딩중
      </Button>
    );

  if (authStatus.data?.success)
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium">{authStatus.data.data?.name}</div>
        <Button size="sm" onClick={() => logout()}>
          로그아웃
        </Button>
      </div>
    );

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm font-medium">로그인이 필요해요.</div>
      <Button size="sm" asChild>
        <Link href="/authorization">로그인</Link>
      </Button>
    </div>
  );
}
