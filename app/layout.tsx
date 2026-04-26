import type { Metadata } from "next";
import "./globals.css";
import PageTransition from "@/components/PageTransition";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "TETÉ — Interior Design",
  description: "Interior design with a cinematic, architectural point of view. Creating calm but dramatic spaces.",
  keywords: ["interior design", "residential", "luxury", "minimal", "Tetyana Koroliuk", "thetestestudio"],
  authors: [{ name: "Tetyana Koroliuk" }],
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
      <head />
      <body>
        <ScrollToTop />
        <PageTransition />
        {children}
      </body>
    </html>
  );
}
