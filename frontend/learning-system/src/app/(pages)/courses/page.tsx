import type { Metadata } from "next";
import CoursesPage from "./CoursesPage";
export const metadata: Metadata = {
  title: "Trang danh sách khóa học",
  description: "Trang danh sách khóa học"
};

export default function CoursePage() {
  return (
    <>
      <CoursesPage/>
    </>
  )
}