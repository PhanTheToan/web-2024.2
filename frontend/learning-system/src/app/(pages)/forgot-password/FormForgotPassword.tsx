"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const FormForgotPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Forgot Password, Step 2: Reset Password
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(""); // State to store API messages
  const BASE_URL = process.env.BASE_URL; 
  const router = useRouter();

  const handleForgotPasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username }),
      });

      const result = await response.json();
      setMessage(result.message); // Display the message from the API

      if (response.ok) {
        setStep(2);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Đã xảy ra lỗi. Vui lòng thử lại sau!");
    }
  };

  const handleResetPasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setMessage("Mật khẩu xác nhận không khớp. Vui lòng thử lại!");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp, password }),
      });

      const result = await response.json();
      setMessage(result.message); // Display the message from the API

      if (response.ok) {
        alert("Đặt lại mật khẩu thành công! Bạn sẽ được chuyển đến trang đăng nhập.");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Đã xảy ra lỗi. Vui lòng thử lại sau!");
    }
  };

  return (
    <>
      {message && (
        <div className="mb-[15px] text-center text-[14px] text-[#FF782D] font-[600]">
          {message}
        </div>
      )}

      {step === 1 && (
        <form className="" onSubmit={handleForgotPasswordSubmit}>
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
              placeholder="Nhập email của bạn"
              className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-[15px]">
            <label
              className="block mb-[5px] font-[600] text-[14px]"
              htmlFor="username"
            >
              <span className="text-[#333333]">Username</span>
              <span className="text-[#FF782D] ml-[5px]">*</span>
            </label>
            <input
              type="text"
              name="username"
              id="username"
              placeholder="Nhập username của bạn"
              className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="h-[50px] w-full bg-[#FF782D] text-white rounded-[6px] font-[600] text-[16px]"
          >
            Gửi Yêu Cầu
          </button>
        </form>
      )}

      {step === 2 && (
        <form className="" onSubmit={handleResetPasswordSubmit}>
          <div className="mb-[15px]">
            <label
              className="block mb-[5px] font-[600] text-[14px]"
              htmlFor="otp"
            >
              <span className="text-[#333333]">OTP</span>
              <span className="text-[#FF782D] ml-[5px]">*</span>
            </label>
            <input
              type="text"
              name="otp"
              id="otp"
              placeholder="Nhập mã OTP"
              className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <div className="mb-[15px]">
            <label
              className="block mb-[5px] font-[600] text-[14px]"
              htmlFor="password"
            >
              <span className="text-[#333333]">Mật khẩu mới</span>
              <span className="text-[#FF782D] ml-[5px]">*</span>
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Nhập mật khẩu mới"
              className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-[15px]">
            <label
              className="block mb-[5px] font-[600] text-[14px]"
              htmlFor="confirmPassword"
            >
              <span className="text-[#333333]">Xác nhận mật khẩu mới</span>
              <span className="text-[#FF782D] ml-[5px]">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Xác nhận mật khẩu mới"
              className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
      )}
    </>
  );
};
