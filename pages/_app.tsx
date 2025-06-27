import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Head from "next/head";
import { useRouter } from "next/router";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import { overlay, OverlayProvider } from "overlay-kit";
import { useEffect } from "react";
import { Toaster } from "sonner";
import type { AppProps } from "next/app";
import AuthorizationOverlay from "@/components/AuthorizationOverlay";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import QueryClientProvider from "@/components/providers/QueryClientProvider";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      overlay.unmountAll();
    };

    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router]);

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0"
        />
        <title>제이엠에듀</title>
      </Head>
      <QueryClientProvider>
        <ThemeProvider>
          <NextTopLoader color="var(--adaptiveBlue500)" showSpinner={false} />
          <OverlayProvider>
            {/* APP */}
            <div className="mx-auto flex min-h-screen bg-adaptiveBackground xl:container">
              <Navigation />
              <div className="max-w-full grow">
                <Header />
                <Component {...pageProps} />
              </div>
            </div>
            {/* APP */}
          </OverlayProvider>
          <AuthorizationOverlay />
          <Toaster
            position="top-center"
            className="whitespace-pre-line"
            visibleToasts={3}
            richColors
          />
          {process.env.NODE_ENV === "production" ? null : <ReactQueryDevtools />}
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}
