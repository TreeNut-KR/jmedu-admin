import { isAxiosError } from "axios";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/tables/Table";
import useGetPermissionsQuery from "@/hooks/queries/useGetPermissionsQuery";
import { PERMISSION_DESCRIPTIONS } from "@/constants";
import { PERMISSION_COLUMN } from "@/constants/columns";

export default function PermissionTable() {
  const permissions = useGetPermissionsQuery();

  if (permissions.error) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Image src="/tossface/u26A0.svg" width={20} height={20} alt="warning icon" />
          <span>에러가 발생했어요.</span>
        </div>
        <div className="text-sm text-adaptiveGray-700">
          {isAxiosError(permissions.error)
            ? (permissions.error.response?.data.message ?? "알 수 없는 에러")
            : permissions.error.message}
        </div>
      </div>
    );
  }

  if (permissions.isLoading || !permissions.data) {
    return (
      <div className="flex items-center">
        <Loader2 className="mr-2 animate-spin text-adaptiveBlue-500" size="16" strokeWidth="2.5" />
        권한 정보를 불러오고 있어요.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            {PERMISSION_COLUMN.map((column, columnIdx) => {
              if (column.hidden) return;
              return (
                <TableHead key={`${column.accessor ?? `unknown-${columnIdx}`}-header`}>
                  {column.header ?? column.accessor}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.data.data ? (
            permissions.data.data.map((permission, permissionIdx) => {
              if (!PERMISSION_DESCRIPTIONS.hasOwnProperty(permission.task_name)) return;
              return (
                <TableRow
                  key={
                    PERMISSION_COLUMN[0].accessor
                      ? permission[PERMISSION_COLUMN[0].accessor]
                      : `school-${permissionIdx}`
                  }
                >
                  {PERMISSION_COLUMN.map((column, columnIdx) => {
                    if (column.hidden) return;
                    return (
                      <TableCell key={column.accessor ?? `school-column-${columnIdx}`}>
                        {column.renderer
                          ? column.renderer(permission)
                          : column.accessor
                            ? permission[column.accessor]
                            : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={999}>데이터가 없습니다.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
