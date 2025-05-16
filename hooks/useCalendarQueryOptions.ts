import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { getItem, setItem } from "@/utils/localStorage";
import type * as API from "@/types/api";

export default function useCalendarQueryOptions<T>(option: {
  initYear: number;
  initMonth: number;
}) {
  const router = useRouter();

  const CalendarQuerySchema = useMemo(
    () =>
      z.object({
        year: z.coerce.number().gte(1).optional(),
        month: z.coerce.number().gte(1).lte(12).optional(),
      }),
    [],
  );

  const queryParams = useMemo(() => {
    const { data: params, error: paramsError } = CalendarQuerySchema.safeParse(router.query);

    if (paramsError) {
      console.error(paramsError);
    }

    return params;
  }, [CalendarQuerySchema, router.query]);

  const localQueryOption = useMemo(() => {
    const item =
      getItem<API.LocalListQueryOptions<T>>("calendar-query-option", {})[router.pathname] ?? {};

    const { data: params, error: paramsError } = CalendarQuerySchema.safeParse(item);

    if (paramsError) {
      console.error(paramsError);
    }

    return params;
  }, [router, CalendarQuerySchema]);

  const [query, setQuery] = useState({
    year: queryParams?.year ?? localQueryOption?.year ?? option.initYear,
    month: queryParams?.month ?? localQueryOption?.month ?? option.initMonth,
  });

  useEffect(() => {
    setQuery({
      year: queryParams?.year ?? localQueryOption?.year ?? option.initYear,
      month: queryParams?.month ?? localQueryOption?.month ?? option.initMonth,
    });
  }, [option.initYear, option.initMonth, localQueryOption, queryParams]);

  useEffect(() => {
    setItem("calendar-query-option", {
      ...getItem("calendar-query-option", {}),
      [router.pathname]: {
        year: query.year,
        month: query.month,
      },
    });
  }, [query, router.pathname]);

  const handleChangeYear = useCallback(
    (value?: number) => {
      if (typeof value !== "number" || value < 1) return;
      router.push({
        query: { ...router.query, year: value },
      });
    },
    [router],
  );

  const handleChangeMonth = useCallback(
    (value?: number) => {
      if (typeof value !== "number" || value < 1 || value > 12) return;
      router.push({
        query: { ...router.query, month: value },
      });
    },
    [router],
  );

  const handlePreviousMonth = useCallback(() => {
    if (query.month === 1) {
      router.push({
        query: { ...router.query, year: query.year - 1, month: 12 },
      });
    } else {
      router.push({
        query: { ...router.query, month: query.month - 1 },
      });
    }
  }, [query, router]);

  const handleNextMonth = useCallback(() => {
    if (query.month === 12) {
      router.push({
        query: { ...router.query, year: query.year + 1, month: 1 },
      });
    } else {
      router.push({
        query: { ...router.query, month: query.month + 1 },
      });
    }
  }, [query, router]);

  return {
    query,
    handleChangeYear,
    handleChangeMonth,
    handlePreviousMonth,
    handleNextMonth,
  };
}
