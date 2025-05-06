import "@/styles/globals.css";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
