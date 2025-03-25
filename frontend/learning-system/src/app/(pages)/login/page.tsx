import type { Metadata } from "next";
import { FormLogin } from "./FormLogin";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "",
};

export default function LoginPage() {
  return (
    <div className="mt-[60px] w-[500px] mx-auto">
      <div className="font-[700] text-[24px] text-[#333333] mb-[20px] text-center">
        Đăng Nhập Tài Khoản
      </div>
      <FormLogin />
    </div>
  );
}
