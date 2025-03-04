import type { Metadata } from "next";
import { FormRegister } from "./FormRegister";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản",
  description: "",
};

export default function RegisterPage() {
  return (
    <>
      <div className="mt-[60px] w-[500px] mx-auto">
        <div className={"font-[700] text-[24px] text-[#333333] mb-[20px] text-center"}>
          Đăng Ký Tài Khoản
        </div>
        <FormRegister />
      </div>
    </>
  );
}