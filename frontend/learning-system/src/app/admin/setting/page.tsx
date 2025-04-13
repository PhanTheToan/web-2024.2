import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang cài đặt",
  description: "Trang cài đặt"
};

export default function AdminSetting() {
  return (
    <>
      <h1 className="text-[38px] font-[700]">Trang cài đặt</h1>
    </>
  )
}