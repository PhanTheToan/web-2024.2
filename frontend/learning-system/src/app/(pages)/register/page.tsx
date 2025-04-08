import type { Metadata } from "next";
<<<<<<< HEAD

export const metadata: Metadata = {
  title: "Trang đăng ký",
  description: "Trang đăng ký"
=======
import { FormRegister } from "./FormRegister";

export const metadata: Metadata = {
  title: "Đăng ký tài khoản",
  description: "",
>>>>>>> bdfbd4e (Local initial code)
};

export default function RegisterPage() {
  return (
    <>
<<<<<<< HEAD
      <h1 className="text-[38px] font-[700]">Trang đăng ký</h1>
    </>
  )
=======
      <div className="mt-[60px] w-[500px] mx-auto">
        <div className={"font-[700] text-[24px] text-[#333333] mb-[20px] text-center"}>
          Đăng Ký Tài Khoản
        </div>
        <FormRegister />
      </div>
    </>
  );
>>>>>>> bdfbd4e (Local initial code)
}