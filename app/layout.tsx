import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "TETÉ — Interior Design | Toronto",
  description: "Interior design with a cinematic, architectural point of view. Toronto-based studio creating calm but dramatic spaces.",
  keywords: ["interior design", "Toronto", "residential", "luxury", "minimal", "Tatiana Koroliuk", "thetestestudio"],
  authors: [{ name: "Tatiana Koroliuk" }],
  openGraph: {
    title: "TETÉ — Interior Design",
    description: "Interior design with a cinematic, architectural point of view.",
    type: "website",
    locale: "en_US",
    url: "https://thetetestudio.com",
    siteName: "TETÉ",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "TETÉ Interior Design Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TETÉ — Interior Design",
    description: "Interior design with a cinematic, architectural point of view.",
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PageTransition />
        {children}
      </body>
    </html>
  );
}
