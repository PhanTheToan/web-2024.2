"use client";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export const FormLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const siteKey = "YOUR_SITE_KEY_HERE"; // Thay bằng Site Key của bạn

  const handleCaptchaChange = () => {
    setCaptchaVerified(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!captchaVerified) {
      setError("Vui lòng xác minh CAPTCHA!");
      return;
    }

    setLoading(true);

    // 🔹 Giả lập dữ liệu đăng nhập trước khi có API
    const mockUsers = [
      { email: "levana@gmail.com", password: "123456" },
      { email: "nguyenb@gmail.com", password: "password123" },
    ];

    const user = mockUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      alert("Đăng nhập thành công!");
      setLoading(false);
      return;
    }

    // 🔹 Nếu có API, gọi API đăng nhập
    try {
      const response = await fetch("https://api.example.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Đăng nhập thành công!");
      } else {
        setError(data.message || "Sai email hoặc mật khẩu!");
      }
    } catch (err) {
      setError("Lỗi kết nối, vui lòng thử lại sau!");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-[15px]">
        <label className="block mb-[5px] font-[600] text-[14px]" htmlFor="email">
          <span className="text-[#333333]">Email</span>
          <span className="text-[#FF782D] ml-[5px]">*</span>
        </label>
        <input
          type="email"
          name="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ví dụ: levana@gmail.com"
          className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
          required
        />
      </div>

      <div className="mb-[15px]">
        <label className="block mb-[5px] font-[600] text-[14px]" htmlFor="password">
          <span className="text-[#333333]">Mật Khẩu</span>
          <span className="text-[#FF782D] ml-[5px]">*</span>
        </label>
        <input
          type="password"
          name="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
          required
        />
      </div>

      <div className="mb-[15px] text-right">
        <a href="/forgot-password" className="text-[#f53636] text-[14px] hover:underline">
          Quên mật khẩu?
        </a>
      </div>

      {/* Thêm reCAPTCHA */}
      <div className="mb-[15px] flex justify-center">
        <ReCAPTCHA sitekey={siteKey} onChange={handleCaptchaChange} />
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <button
        type="submit"
        className="h-[50px] w-full bg-[#FF782D] text-white rounded-[6px] font-[600] text-[16px] disabled:bg-[#FF782D]"
        disabled={!captchaVerified || loading}
      >
        {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
      </button>
    </form>
  );
};
