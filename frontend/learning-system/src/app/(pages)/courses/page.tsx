import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang danh sách khóa học",
  description: "Trang danh sách khóa học"
};

export default function CoursePage() {
  return (
    <>
      <h1 className="text-[38px] font-[700]">Trang danh sách khóa học</h1>
    </>
  )
}