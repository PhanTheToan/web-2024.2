/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export const FormLogin = () => {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const siteKey = "YOUR_SITE_KEY_HERE"; // Thay YOUR_SITE_KEY_HERE bằng Site Key của bạn

  const handleCaptchaChange = () => {
    setCaptchaVerified(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!captchaVerified) {
      alert("Vui lòng xác minh CAPTCHA!");
      return;
    }
    // Xử lý đăng nhập nếu cần
  };

  return (
    <>
      <form className="" onSubmit={handleSubmit}>
        <div className="mb-[15px]">
          <label
            className="block mb-[5px] font-[600] text-[14px]"
            htmlFor="email"
          >
            <span className="text-[#333333]">Email</span>
            <span className="text-[#FF782D] ml-[5px]">*</span>
          </label>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Ví dụ: levana@gmail.com"
            className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
            required
          />
        </div>
        <div className="mb-[15px]">
          <label
            className="block mb-[5px] font-[600] text-[14px]"
            htmlFor="password"
          >
            <span className="text-[#333333]">Mật Khẩu</span>
            <span className="text-[#FF782D] ml-[5px]">*</span>
          </label>
          <input
            type="password"
            name="password"
            id="password"
            className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
            required
          />
        </div>

        <div className="mb-[15px] text-right">
          <a
            href="/forgot-password"
            className="text-[#f53636] text-[14px] hover:underline"
          >
            Quên mật khẩu?
          </a>
        </div>

        {/* Thêm reCAPTCHA */}
        <div className="mb-[15px] flex justify-center">
          <ReCAPTCHA sitekey={siteKey} onChange={handleCaptchaChange} />
        </div>

        <button
          type="submit"
          className="h-[50px] w-full bg-[#FF782D] text-white rounded-[6px] font-[600] text-[16px]"
          disabled={!captchaVerified}
        >
          Đăng Nhập
        </button>
      </form>
    </>
  );
};
