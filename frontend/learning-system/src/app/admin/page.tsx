import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang chủ admin",
  description: "Trang chủ admin"
};

export default function AdminHome() {
  return (
    <>
      <h1 className="text-[38px] font-[700]">Trang chủ admin</h1>
    </>
  )
}