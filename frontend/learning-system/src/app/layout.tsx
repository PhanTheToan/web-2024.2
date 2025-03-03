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
        <div className="container mx-auto">
          <div className="flex items-start">
            <div className="flex-1 ml-[20px]">
              <Suspense>
                <Header />
              </Suspense>
              <main className="mt-[30px] mb-[150px]">
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
