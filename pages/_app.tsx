import Head from "next/head";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import type { AppProps } from "next/app";
import Header from "@/components/Header";
import Navigation from "@/components/Navigation";
import GlobalAlert from "@/components/alerts/GlobalAlert";
import GlobalDialog from "@/components/dialogs/GlobalDialog";
import Providers from "@/components/providers";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1.0,minimum-scale=1.0,maximum-scale=1.0"
        />
        <title>제이엠에듀</title>
      </Head>
      <Providers>
        <NextTopLoader color="var(--adaptiveBlue500)" showSpinner={false} />
        <div className="mx-auto flex min-h-screen bg-adaptiveBackground xl:container">
          <Navigation />
          <div className="max-w-full grow">
            <Header />
            <Component {...pageProps} />
          </div>
        </div>
        <GlobalDialog />
        <GlobalAlert />
        <Toaster position="top-center" visibleToasts={1} richColors />
      </Providers>
    </>
  );
}
