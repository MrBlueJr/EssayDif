import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  variable: "--font-merriweather",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EssayDif - Comparison Tool",
  description: "A multi-layer text comparison tool for essays and long-form writing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${merriweather.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
