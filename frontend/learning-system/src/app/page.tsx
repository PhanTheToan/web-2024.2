import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "Trang chủ"
};

export default function Home() {
  return (
    <>
      <h1 className="text-[38px] font-[700]">Trang chủ</h1>
    </>
  )
}