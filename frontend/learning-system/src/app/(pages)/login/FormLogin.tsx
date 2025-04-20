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
  const [userData, setUserData] = useState(null)
  const [otp, setOtp] = useState("")
  const [isOtpSent, setIsOtpSent] = useState(false) // Track if OTP is sent
  const BASE_URL = process.env.BASE_URL

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Gửi yêu cầu đăng nhập
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Lưu token vào cookie
        document.cookie = `jwtToken=${data.token}; path=/; `

        // Chuyển về trang chủ hoặc trang yêu cầu sau khi login thành công
        window.location.href = "/"
      } else {
        setError(data.message || "Sai username hoặc mật khẩu!")
      }
    } catch (err) {
      setError("Lỗi kết nối, vui lòng thử lại sau!")
    }

    setLoading(false)
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!")
      setLoading(false)
      return
    }

    try {
      // Gửi yêu cầu đăng ký
      const signupResponse = await fetch(`${BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          firstName: "",
          lastName: "",
          phone: "",
          dateOfBirth: "",
          gender: "",
          profileImage: null,
          coursesEnrolled: [],
        }),
      })

      const signupData = await signupResponse.json()

      if (signupResponse.ok) {
        setError("OTP đã được gửi đến email. Vui lòng nhập OTP để xác minh.")
        setIsOtpSent(true) // Show OTP input field
      } else {
        setError(signupData.message || "Đăng ký thất bại!")
      }
    } catch (err) {
      setError("Lỗi kết nối, vui lòng thử lại sau!")
    }

    setLoading(false)
  }

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
      setError("Lỗi kết nối, vui lòng thử lại sau!")
    }

    setLoading(false)
  }

  const toggleForm = () => {
    setIsLogin(!isLogin)
    setError("")
  }

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
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-2 text-center font-semibold transition-all duration-300 ${
                isLogin ? "text-[#FF782D]" : "text-gray-500"
              }`}
            >
              Đăng Nhập
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-2 text-center font-semibold transition-all duration-300 ${
                !isLogin ? "text-[#FF782D]" : "text-gray-500"
              }`}
            >
              Đăng Ký
            </button>
          </div>
          <div className="h-0.5 bg-gray-200 w-full absolute bottom-0">
            <motion.div
              className="h-full bg-[#FF782D]"
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
              <div className="mb-[15px]">
                <label className="block mb-[5px] font-[600] text-[14px]" htmlFor="register-username">
                  <span className="text-[#333333]">Username</span>
                  <span className="text-[#FF782D] ml-[5px]">*</span>
                </label>
                <input
                  type="text"
                  name="register-username"
                  id="register-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
                  required
                />
              </div>

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
                  placeholder="Email"
                  className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
                  required
                />
              </div>

              <div className="mb-[15px]">
                <label className="block mb-[5px] font-[600] text-[14px]" htmlFor="register-password">
                  <span className="text-[#333333]">Mật Khẩu</span>
                  <span className="text-[#FF782D] ml-[5px]">*</span>
                </label>
                <input
                  type="password"
                  name="register-password"
                  id="register-password"
                  value={password}
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
                  required
                />
              </div>

              <div className="mb-[15px]">
                <label className="block mb-[5px] font-[600] text-[14px]" htmlFor="confirm-password">
                  <span className="text-[#333333]">Xác Nhận Mật Khẩu</span>
                  <span className="text-[#FF782D] ml-[5px]">*</span>
                </label>
                <input
                  type="password"
                  name="confirm-password"
                  id="confirm-password"
                  value={confirmPassword}
                  placeholder="Xác nhận mật khẩu"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-[50px] w-full bg-white rounded-[6px] px-[16px] font-[600] text-[14px] border border-solid border-gray-400"
                  required
                />
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
                onClick={isOtpSent ? handleVerifyOtp : handleRegisterSubmit}
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

