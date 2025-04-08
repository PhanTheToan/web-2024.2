import type { Metadata } from "next";
<<<<<<< HEAD

=======
import DetailCoursePage from "./DetailCoursePage";
>>>>>>> bdfbd4e (Local initial code)
export const metadata: Metadata = {
  title: "Trang chi tiết khóa học",
  description: "Trang chi tiết khóa học"
};

export default function CourseDetailPage() {
  return (
    <>
<<<<<<< HEAD
      <h1 className="text-[38px] font-[700]">Trang chi tiết khóa học</h1>
=======
      <DetailCoursePage />
      <h1 className="text-[38px] font-[700]">Trang chi tiết khóa học</h1>

>>>>>>> bdfbd4e (Local initial code)
    </>
  )
}