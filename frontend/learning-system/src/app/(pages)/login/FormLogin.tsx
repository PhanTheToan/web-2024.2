"use client";
import { useState } from "react";
import * as dotenv from "dotenv";
dotenv.config();

export const FormLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const BASE_URL = process.env.BASE_URL;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Đăng nhập thành công!");
      } else {
        setError(data.message || "Sai username hoặc mật khẩu!");
      }
    } catch (err) {
      setError("Lỗi kết nối, vui lòng thử lại sau!");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-[15px]">
        <label className="block mb-[5px] font-[600] text-[14px]" htmlFor="username">
          <span className="text-[#333333]">Username</span>
          <span className="text-[#FF782D] ml-[5px]">*</span>
        </label>
        <input
          type="text"
          name="username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
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
          placeholder="Password"
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

      {error && <p className="text-red-500 text-center">{error}</p>}

      <button
        type="submit"
        className="h-[50px] w-full bg-[#FF782D] text-white rounded-[6px] font-[600] text-[16px] disabled:bg-[#FF782D]"
        disabled={loading}
      >
        {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
      </button>
    </form>
  );
};