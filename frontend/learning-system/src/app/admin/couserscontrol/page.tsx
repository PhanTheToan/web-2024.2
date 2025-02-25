import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang quản lý khóa học",
  description: "Trang quản lý khóa học"
};

export default function AdminCoursePage() {
  return (
    <>
      <h1 className="text-[38px] font-[700]">Trang quản lý khóa học</h1>
    </>
  )
}