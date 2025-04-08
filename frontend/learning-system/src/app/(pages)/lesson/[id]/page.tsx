import type { Metadata } from "next";
<<<<<<< HEAD

export const metadata: Metadata = {
  title: "Trang chi tiết bài học",
  description: "Trang chi tiết bài học"
};

export default function LessonDetailPage() {
  return (
    <>
      <h1 className="text-[38px] font-[700]">Trang chi tiết bài học</h1>
    </>
  )
=======
import LessonDetailPage from "./LessonDetailPage";

export const metadata: Metadata = {
  title: "Chi tiết bài học",
  description: "Trang chi tiết bài học"
};

export default function LessonPage() {
  return (
    <>
      <LessonDetailPage />
    </>
  );
>>>>>>> bdfbd4e (Local initial code)
}