import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Sora } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ThemeProvider } from "./components/ThemeContext";
import { ClerkProvider } from "@clerk/nextjs";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Makaan",
  description: "Real estate listings and property search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var saved=localStorage.getItem("theme");var systemDark=window.matchMedia("(prefers-color-scheme: dark)").matches;var resolved=saved==="light"||saved==="dark"?saved:(systemDark?"dark":"light");var root=document.documentElement;root.classList.remove("light","dark");root.classList.add(resolved);}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${sora.variable} ${dmSans.variable} antialiased`}>
        <ClerkProvider>
          <ThemeProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
