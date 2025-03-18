import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang cá nhân",
  description: "Trang cá nhân"
};

export default function AdminProfile() {
  return (
    <>
      <h1 className="text-[38px] font-[700]">Trang cá nhân</h1>
    </>
  )
}