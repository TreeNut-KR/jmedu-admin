import { useMemo, useState } from "react";
import { COMMON_LIMIT_OPTIONS, COMMON_ORDER_OPTIONS } from "@/constants/options";
import type * as API from "@/types/api";

export default function useListQueryOptions<T>(option: API.InitListQueryOptions<T>) {
  const [query, setQuery] = useState<API.ListQueryOptions<T>>({
    page: option.initPage ?? 1,
    limit: option.initLimit ?? COMMON_LIMIT_OPTIONS[0].value,
    sort: option.initSortBy ?? option.sortOptions[0].value,
    order: option.initOrder ?? COMMON_ORDER_OPTIONS[0].value,
  });

  const handleChangeOrder = useMemo(() => {
    return (value?: string) => {
      if (value === "asc" || value === "desc") {
        setQuery({
          ...query,
          page: 1,
          order: value,
        });
      }
    };
  }, [query]);

  const handleChangeSortBy = useMemo(() => {
    return (value?: string) => {
      if (option.sortOptions.find((opt) => opt.value === value)) {
        setQuery({
          ...query,
          page: 1,
          sort: value as keyof T,
        });
      }
    };
  }, [option.sortOptions, query]);

  const handleChangeLimit = useMemo(() => {
    return (value?: number) => {
      if (value === undefined) return;
      setQuery({
        ...query,
        limit: value,
        page: 1,
      });
    };
  }, [query]);

  const handleChangePage = useMemo(() => {
    return (value: number) => {
      setQuery({
        ...query,
        page: value,
      });
    };
  }, [query]);

  return {
    query,
    handleChangeLimit,
    handleChangeSortBy,
    handleChangeOrder,
    handleChangePage,
  };
}
