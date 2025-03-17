import type { Metadata } from "next";
import { FormResetPassword } from "./FormResetPassword";

export const metadata: Metadata = {
  title: "Đặt lại mật khẩu",
  description: "",
};

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mt-[60px] w-[500px] mx-auto">
        <div className="font-[700] text-[24px] text-[#333333] mb-[20px] text-center">
          Đặt Lại Mật Khẩu
        </div>
        <FormResetPassword />
      </div>
    </>
  );
}
