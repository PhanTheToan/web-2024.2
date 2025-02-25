import type { Metadata } from "next";
import "./globals.css";
import { Sider } from "./components/sider/Sider";
import { Search } from "./components/search/Search";
import { Footer } from "./components/footer/Footer";

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
      <body>
        <div className="container mx-auto">
          <div className="">
            <div className="">
              <Sider />
            </div>
            <div className="">
              <Search />
              <main className="">
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
