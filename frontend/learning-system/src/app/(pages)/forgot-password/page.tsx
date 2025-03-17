import type { Metadata } from "next";
import { FormForgotPassword } from "./FormForgotPassword";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
  description: "",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mt-[60px] w-[500px] mx-auto">
        <div className={"font-[700] text-[24px] text-[#333333] mb-[20px] text-center"}>
          Quên Mật Khẩu
        </div>
        <FormForgotPassword />
      </div>
    </>
  );
}