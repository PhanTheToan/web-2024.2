import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang quản lý học sinh",
  description: "Trang quản lý học sinh"
};

export default function TeacherUserPage() {
  return (
    <>
      <h1 className="text-[38px] font-[700]">Trang quản lý học sinh</h1>
    </>
  )
}