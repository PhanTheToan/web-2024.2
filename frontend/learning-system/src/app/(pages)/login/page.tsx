import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trang đăng nhập",
  description: "Trang đăng nhập"
};

export default function LoginPage() {
  return (
    <>
      <h1 className="text-[38px] font-[700]">Trang đăng nhập</h1>
    </>
  )
}