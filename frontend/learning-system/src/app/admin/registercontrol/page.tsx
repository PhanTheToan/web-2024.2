import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang quản lý đăng ký khóa học",
  description: "Trang quản lý đăng ký khóa học"
};

export default function AdminRegisterPage() {
  return (
    <>
      <h1 className="text-[38px] font-[700]">Trang quản lý đăng ký khóa học</h1>
    </>
  )
}