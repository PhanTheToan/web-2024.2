import type { Metadata } from "next";
import "./globals.css";
<<<<<<< HEAD
import { Sider } from "./components/sider/Sider";
import { Search } from "./components/search/Search";
import { Footer } from "./components/footer/Footer";
=======
import { Footer } from "./components/footer/Footer";
import { Suspense } from "react";
import { Header } from "./components/header/Header";
import { usePathname } from "next/navigation";
>>>>>>> bdfbd4e (Local initial code)

export const metadata: Metadata = {
  title: "Learning System",
  description: "Learning System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
<<<<<<< HEAD
  return (
    <html lang="vi">
      <body>
        <div className="container mx-auto">
          <div className="">
            <div className="">
              <Sider />
            </div>
            <div className="">
              <Search />
              <main className="">
=======

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
>>>>>>> bdfbd4e (Local initial code)
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
<<<<<<< HEAD
=======

>>>>>>> bdfbd4e (Local initial code)
