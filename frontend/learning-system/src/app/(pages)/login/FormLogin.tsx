"use client"
import { useState } from "react"
import * as dotenv from "dotenv"
import { motion, AnimatePresence } from "framer-motion"
dotenv.config()

export const FormLogin = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [email, setEmail] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  // const [userData, setUserData] = useState(null)
  const [otp, setOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false) // Track if OTP is sent
  const [role, setRole] = useState("ROLE_USER") // Default role is user
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const BASE_URL = process.env.BASE_URL 

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Gửi yêu cầu đăng nhập
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      })

      // const data = await response.json()

      if (response.ok) {
        window.location.href = "/"
      } else {
        setError("Sai username hoặc mật khẩu!")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định!")
    }

    setLoading(false)
  }

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
  
    if (!dateOfBirth || !firstName || !lastName || !phone) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      setLoading(false);
      return;
    }
  
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      setLoading(false);
      return;
    }
  
    try {
      const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          firstName,
          lastName,
          phone,
          dateOfBirth,
          role,
          profileImage: null,
          coursesEnrolled: [],
        }),
      });
  
      const signupData = await signupResponse.json();
  
      if (signupResponse.ok) {
        setError("OTP đã được gửi đến email. Vui lòng nhập OTP để xác minh.");
        setIsOtpSent(true);
      } else {
        setError(signupData.message || "Đăng ký thất bại!");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định!");
    }
  
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    setError("")
    setLoading(true)

    try {
      // Gửi yêu cầu xác minh OTP
      const verifyOtpResponse = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })

      const verifyOtpData = await verifyOtpResponse.json()

      if (verifyOtpResponse.ok) {
        setIsLogin(true)
        setUsername("")
        setPassword("")
        setEmail("")
        setConfirmPassword("")
        setOtp("")
        setError("Đăng ký thành công! Vui lòng đăng nhập.")
      } else {
        setError(verifyOtpData.message || "Xác minh OTP thất bại!")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định!")
    }

    setLoading(false)
  }

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của nút
    if (isOtpSent) {
      handleVerifyOtp(); // Gọi hàm xử lý OTP
    } else {
      handleRegisterSubmit(event as unknown as React.FormEvent<HTMLFormElement>); // Ép kiểu sự kiện
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/\s/.test(value)) {
      setError("Username không được phép chứa khoảng trắng!");
    } else {
      setError("");
      setUsername(value);
    }
  };

  const toggleForm = (isLogin: boolean) => {
    setIsLogin(isLogin);
    setUsername("");
    setPassword("");
    setEmail("");
    setConfirmPassword("");
    setOtp("");
    setError("");
  };

  const formVariants = {
    hidden: { opacity: 0, x: isLogin ? -100 : 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: isLogin ? 100 : -100, transition: { duration: 0.5 } },
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-xs">
          <div className="flex">
            <button
              onClick={() => toggleForm(true)}
              className={`w-1/2 py-2 text-center font-semibold transition-all duration-300 ${
                isLogin ? "text-[#FF782D]" : "text-gray-500"
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => toggleForm(false)}
              className={`w-1/2 py-2 text-center font-semibold transition-all duration-300 ${
                !isLogin ? "text-[#FF782D]" : "text-gray-500"
              }`}
            >
              Đăng Ký
            </button>
          </div>
          <div className="h-0.5 bg-gray-200 w-full absolute bottom-0">
            <motion.div
              style={{ height: "100%", backgroundColor: "#FF782D" }}
              initial={false}
              animate={{
                width: "50%",
                x: isLogin ? "0%" : "100%",
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLogin ? (
          <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit">
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-[15px]">
                <label className="block mb-[5px] font-[600] text-[14px]" htmlFor="username">
                  <span className="text-[#333333]">Tên đăng nhập</span>
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

              {error && (
                <p className={`text-center mb-4 ${error.includes("thành công") ? "text-green-500" : "text-red-500"}`}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="h-[50px] w-full bg-[#FF782D] text-white rounded-[6px] font-[600] text-[16px] disabled:bg-[#FF782D]/70"
                disabled={loading}
              >
                {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div key="register" variants={formVariants} initial="hidden" animate="visible" exit="exit">
            <form onSubmit={handleRegisterSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">Tên đăng nhập *</label>
                  <input
                    id="register-username"
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Username"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Email *</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">Họ *</label>
                  <input
                    id="first-name"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First Name"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Tên *</label>
                  <input
                    id="last-name"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last Name"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">Số điện thoại *</label>
                  <input
                    id="phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Ngày sinh *</label>
                  <input
                    id="date-of-birth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    placeholder="Date of Birth"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">Mật khẩu *</label>
                  <input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2">Nhập lại mật khẩu *</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="mb-[15px]">
                <label className="block mb-[5px] font-[600] text-[14px]" htmlFor="role">
                  <span className="text-[#333333]">Vai Trò</span>
                  <span className="text-[#FF782D] ml-[5px]">*</span>
                </label>
                <select
                  name="role"
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
                  required
                >
                  <option value="ROLE_USER">Học viên</option>
                  <option value="ROLE_TEACHER">Giáo viên</option>
                </select>
              </div>

              {isOtpSent && (
                <div className="mb-[15px]">
                  <label className="block mb-[5px] font-[600] text-[14px]" htmlFor="otp">
                    <span className="text-[#333333]">OTP</span>
                  </label>
                  <input
                    type="text"
                    name="otp"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Nhập OTP"
                    className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
                  />
                </div>
              )}

              {error && <p className="text-red-500 text-center mb-4">{error}</p>}

              <button
                type="button"
                onClick={handleButtonClick}
                className="h-[50px] w-full bg-[#FF782D] text-white rounded-[6px] font-[600] text-[16px] disabled:bg-[#FF782D]/70"
                disabled={loading || (isOtpSent && !otp)}
              >
                {loading ? "Đang xử lý..." : isOtpSent ? "Xác minh OTP" : "Đăng Ký"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}