import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Polyfill Next.js HMR router to prevent 'isrManifest' TypeError */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          window.next = window.next || {};
          window.next.router = window.next.router || { components: {} };
        `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
