import type { Metadata } from "next";
<<<<<<< HEAD

export const metadata: Metadata = {
  title: "Trang đăng nhập",
  description: "Trang đăng nhập"
=======
import { FormLogin } from "./FormLogin";

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "",
>>>>>>> bdfbd4e (Local initial code)
};

export default function LoginPage() {
  return (
<<<<<<< HEAD
    <>
      <h1 className="text-[38px] font-[700]">Trang đăng nhập</h1>
    </>
  )
}
=======
    <div className="mt-[60px] w-[500px] mx-auto">
      <div className="font-[700] text-[24px] text-[#333333] mb-[20px] text-center">
        Đăng Nhập Tài Khoản
      </div>
      <FormLogin />
    </div>
  );
}
>>>>>>> bdfbd4e (Local initial code)
