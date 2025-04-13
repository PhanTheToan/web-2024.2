import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang chủ Teacher",
  description: "Trang chủ Teacher"
};

export default function TeacherHome() {
  return (
    <>
      <h1 className="text-[38px] font-[700]">Trang chủ Teacher</h1>
    </>
  )
}