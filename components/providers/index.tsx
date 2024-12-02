import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RecoilRoot } from "recoil";
import QueryClientProvider from "@/components/providers/QueryClientProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";


import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <RecoilRoot>
      <QueryClientProvider>
        <ThemeProvider>{children}</ThemeProvider>
        {process.env.NODE_ENV === "production" ? null : <ReactQueryDevtools />}
      </QueryClientProvider>
    </RecoilRoot>
  );
}
