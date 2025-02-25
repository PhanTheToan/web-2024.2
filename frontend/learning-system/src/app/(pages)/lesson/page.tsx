import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang danh sách bài học",
  description: "Trang danh sách bài học"
};

export default function LessonPage() {
  return (
    <>
      <h1 className="text-[38px] font-[700]">Trang danh sách bài học</h1>
    </>
  )
}