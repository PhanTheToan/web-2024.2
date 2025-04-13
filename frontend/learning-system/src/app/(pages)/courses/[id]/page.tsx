import type { Metadata } from "next";
import DetailCoursePage from "./DetailCoursePage";
export const metadata: Metadata = {
  title: "Trang chi tiết khóa học",
  description: "Trang chi tiết khóa học"
};

export default function CourseDetailPage() {
  return (
    <>
      <DetailCoursePage />
      <h1 className="text-[38px] font-[700]">Trang chi tiết khóa học</h1>

    </>
  )
}