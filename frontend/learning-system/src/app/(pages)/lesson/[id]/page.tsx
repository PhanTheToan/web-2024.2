import type { Metadata } from "next";
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
}