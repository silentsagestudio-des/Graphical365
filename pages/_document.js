import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Phudu: display face used for the name heading and the dial numerals.
            Barlow: workhorse face used for badges, buttons, captions and labels. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Phudu:wght@300;500&family=Barlow:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
