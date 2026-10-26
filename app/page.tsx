import Script from "next/script";
import source from "../legacy/index.html?raw";

const body = source.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";

export default function Home() {
  return (
    <>
      <link rel="stylesheet" href="/styles.css" />
      <div dangerouslySetInnerHTML={{ __html: body }} />
      <Script src="/app.js" strategy="afterInteractive" />
    </>
  );
}
