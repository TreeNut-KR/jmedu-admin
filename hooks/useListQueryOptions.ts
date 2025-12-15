import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { getItem, setItem } from "@/utils/localStorage";
import { COMMON_LIMIT_OPTIONS, COMMON_ORDER_OPTIONS } from "@/constants/options";
import type * as API from "@/types/api";

export default function useListQueryOptions<T>(option: API.InitListQueryOptions<T>) {
  const router = useRouter();

  const ListQuerySchema = useMemo(
    () =>
      z.object({
        page: z.coerce.number().gte(1).optional().catch(1),
        limit: z.coerce.number().gte(0).optional().catch(10),
        sort: z
          .string()
          .transform((val) => option.sortOptions.find((opt) => opt.value === val)?.value)
          .optional()
          .catch(option.sortOptions[0].value),
        order: z
          .enum([
            COMMON_ORDER_OPTIONS[0].value,
            ...COMMON_ORDER_OPTIONS.slice(1).map((el) => el.value),
          ])
          .optional()
          .catch(COMMON_ORDER_OPTIONS[0].value),
      }),
    [option.sortOptions],
  );

  const queryParams = useMemo(() => {
    const { data: params, error: paramsError } = ListQuerySchema.safeParse(router.query);

    if (paramsError) {
      console.error(paramsError);
    }

    return params;
  }, [ListQuerySchema, router.query]);

  const localQueryOption = useMemo(() => {
    const item =
      getItem<API.LocalListQueryOptions<T>>("list-query-option", {})[router.pathname] ?? {};

    const { data: params, error: paramsError } = ListQuerySchema.safeParse(item);

    if (paramsError) {
      console.error(paramsError);
    }

    return params;
  }, [router, ListQuerySchema]);

  const [query, setQuery] = useState<API.ListQueryOptions<T>>({
    page: queryParams?.page ?? option.initPage ?? 1,
    limit:
      queryParams?.limit ??
      localQueryOption?.limit ??
      option.initLimit ??
      COMMON_LIMIT_OPTIONS[0].value,
    sort:
      queryParams?.sort ??
      localQueryOption?.sort ??
      option.initSortBy ??
      option.sortOptions[0].value,
    order:
      queryParams?.order ??
      localQueryOption?.order ??
      option.initOrder ??
      COMMON_ORDER_OPTIONS[0].value,
  });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuery({
      page: queryParams?.page ?? option.initPage ?? 1,
      limit:
        queryParams?.limit ??
        localQueryOption?.limit ??
        option.initLimit ??
        COMMON_LIMIT_OPTIONS[0].value,
      sort:
        queryParams?.sort ??
        localQueryOption?.sort ??
        option.initSortBy ??
        option.sortOptions[0].value,
      order:
        queryParams?.order ??
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
