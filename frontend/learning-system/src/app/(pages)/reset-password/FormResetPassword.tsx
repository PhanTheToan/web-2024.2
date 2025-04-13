"use client";
import { useState } from "react";

export const FormResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }
    // Gửi yêu cầu đặt lại mật khẩu kèm token
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-[15px]">
          <label className="block mb-[5px] font-[600] text-[14px]" htmlFor="password">
            <span className="text-[#333333]">Mật khẩu mới</span>
            <span className="text-[#FF782D] ml-[5px]">*</span>
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
            required
          />
        </div>

        <div className="mb-[15px]">
          <label className="block mb-[5px] font-[600] text-[14px]" htmlFor="confirm-password">
            <span className="text-[#333333]">Nhập lại mật khẩu</span>
            <span className="text-[#FF782D] ml-[5px]">*</span>
          </label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
            required
          />
        </div>

        <button
          type="submit"
          className="h-[50px] w-full bg-[#FF782D] text-white rounded-[6px] font-[600] text-[16px]"
        >
          Đặt Lại Mật Khẩu
        </button>
      </form>
    </>
  );
};
