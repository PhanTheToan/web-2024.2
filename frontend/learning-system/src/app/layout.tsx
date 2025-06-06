import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "./components/footer/Footer";
import { Suspense } from "react";
import { Header } from "./components/header/Header";

export const metadata: Metadata = {
  title: "Learning System",
  description: "Learning System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="vi">
      <body className="">
        <div className="">
          <div className="">
            <div className="flex-1">
              <Suspense>
                <Header />
              </Suspense>
              <main className="mt-[10px] mb-[150px]">
                {children}
              </main>
            </div>
          </div>
        </div>
        <Footer />
      </body>
    </html>
  );
}

