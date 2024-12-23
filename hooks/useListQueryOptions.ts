import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getItem, setItem } from "@/utils/localStorage";
import { COMMON_LIMIT_OPTIONS, COMMON_ORDER_OPTIONS } from "@/constants/options";
import type * as API from "@/types/api";

export default function useListQueryOptions<T>(option: API.InitListQueryOptions<T>) {
  const router = useRouter();

  const queryParams = useMemo(() => {
    let obj: Partial<API.ListQueryOptions<T>> = {};

    if (
      router.query.page &&
      typeof Number(router.query.page) === "number" &&
      !isNaN(Number(router.query.page))
    ) {
      obj = { ...obj, page: Number(router.query.page) };
    }

    if (
      router.query.limit &&
      typeof Number(router.query.limit) === "number" &&
      !isNaN(Number(router.query.limit))
    ) {
      obj = { ...obj, limit: Number(router.query.limit) };
    }

    if (router.query.sort && option.sortOptions.find((opt) => opt.value === router.query.sort)) {
      obj = { ...obj, sort: router.query.sort as keyof T };
    }

    if (router.query.order && (router.query.order === "asc" || router.query.order === "desc")) {
      obj = { ...obj, order: router.query.order };
    }

    return obj;
  }, [router.query, option.sortOptions]);

  const localQueryOption = useMemo(
    () => getItem<API.LocalListQueryOptions<T>>("list-query-option", {})[router.pathname],
    [router.pathname],
  );

  const [query, setQuery] = useState<API.ListQueryOptions<T>>({
    page: queryParams.page ?? option.initPage ?? 1,
    limit:
      queryParams.limit ??
      localQueryOption?.limit ??
      option.initLimit ??
      COMMON_LIMIT_OPTIONS[0].value,
    sort:
      queryParams.sort ??
      localQueryOption?.sort ??
      option.initSortBy ??
      option.sortOptions[0].value,
    order:
      queryParams.order ??
      localQueryOption?.order ??
      option.initOrder ??
      COMMON_ORDER_OPTIONS[0].value,
  });

  useEffect(() => {
    setQuery({
      page: queryParams.page ?? option.initPage ?? 1,
      limit:
        queryParams.limit ??
        localQueryOption?.limit ??
        option.initLimit ??
        COMMON_LIMIT_OPTIONS[0].value,
      sort:
        queryParams.sort ??
        localQueryOption?.sort ??
        option.initSortBy ??
        option.sortOptions[0].value,
      order:
        queryParams.order ??
        localQueryOption?.order ??
        option.initOrder ??
        COMMON_ORDER_OPTIONS[0].value,
    });
  }, [
    option.initLimit,
    option.initOrder,
    option.initPage,
    option.initSortBy,
    option.sortOptions,
    localQueryOption,
    queryParams,
  ]);

  useEffect(() => {
    setItem("list-query-option", {
      ...getItem("list-query-option", {}),
      [router.pathname]: {
        limit: query.limit,
        sort: query.sort,
        order: query.order,
      },
    });
  }, [query, router.pathname]);

  const handleChangeOrder = useCallback(
    (value?: string) => {
      if (value === "asc" || value === "desc") {
        router.push({
          query: { ...router.query, page: 1, order: value },
        });
      }
    },
    [router],
  );

  const handleChangeSortBy = useCallback(
    (value?: string) => {
      if (option.sortOptions.find((opt) => opt.value === value)) {
        router.push({
          query: { ...router.query, page: 1, sort: value },
        });
      }
    },
    [router, option.sortOptions],
  );

  const handleChangeLimit = useCallback(
    (value?: number) => {
      if (value === undefined) return;
      router.push({
        query: { ...router.query, page: 1, limit: value },
      });
    },
    [router],
  );

  const handleChangePage = useCallback(
    (value: number) => {
      router.push({
        query: { ...router.query, page: value },
      });
    },
    [router],
  );

  return {
    query,
    handleChangeLimit,
    handleChangeSortBy,
    handleChangeOrder,
    handleChangePage,
  };
}
