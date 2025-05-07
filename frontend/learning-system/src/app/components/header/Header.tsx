"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { FaBars } from "react-icons/fa"
import { IoIosLogIn } from "react-icons/io"
import { IoMdClose } from "react-icons/io"
import { FaRegCircleUser } from "react-icons/fa6"
import Image from "next/image"

const BASE_URL = process.env.BASE_URL || ""

interface User {
  profileImage: string;
  role: string;
  username: string;
}

export const Header = () => {
  const pathusername = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  type Role = "ROLE_USER" | "ROLE_TEACHER" | "ROLE_ADMIN" | string
  // Ánh xạ vai trò sang tiếng Việt
  const getRoleLabel = (role: Role): string => {
    switch (role) {
      case "ROLE_USER":
        return "Học viên"
      case "ROLE_TEACHER":
        return "Giáo viên"
      case "ROLE_ADMIN":
        return "Admin"
      default:
        return "Người dùng"
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${BASE_URL}/auth/check`, {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data.data)
          setIsLoggedIn(true)
        } else {
          setUser(null)
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setUser(null)
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleLogout = async () => {
    try {
        const response = await fetch(`${BASE_URL}/auth/signout`, {
            method: "POST",
            credentials: "include",
        });

        if (response.ok) {
            localStorage.clear(); 
            sessionStorage.clear(); // Optional, if used

            window.dispatchEvent(new Event("user-logged-out"));

            // Redirect to login page
            window.location.href = "/login";
        } else {
            // Parse error message from backend
            const data = await response.json();
            setError(data.message || "Đăng xuất thất bại. Vui lòng thử lại.");
        }
    } catch (error) {
        setError(error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định!");
    }
};
  

  useEffect(() => {
    const handleUserLoggedOut = () => {
      setUser(null)
      setIsLoggedIn(false)
      setDropdownOpen(false)
      router.push("/")
    }
  
    window.addEventListener("user-logged-out", handleUserLoggedOut)
  
    return () => {
      window.removeEventListener("user-logged-out", handleUserLoggedOut)
    }
  }, [])
  

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  const getMenuItems = () => {
    if (!user) {
      return [
        { href: "/", label: "Trang chủ" },
        { href: "/courses", label: "Các khóa học" },
        { href: "/dashboard", label: "Dashboard" },
        { href: "/blog", label: "Blog" },
        { href: "/contact", label: "Liên hệ" },
      ]
    }
  
    switch (user.role) {
      case "ROLE_ADMIN":
        return [
          { href: "/admin/couserscontrol", label: "Khóa học" },
          { href: "/admin/usercontrol", label: "Học viên" },
          { href: "/admin/blogs", label: "Quản lý Blog" },
          { href: "/admin/registercontrol", label: "Cài đặt" },
          { href: "/admin/imagecontrol", label: "Hình ảnh" },
        ]
      case "ROLE_TEACHER":
        return [
          { href: "/teacher/courses", label: "Khóa học" },
          // { href: "/teacher/students", label: "Học viên" },
          // { href: "/teacher/assignments", label: "Bài tập" },
          // { href: "/teacher/reports", label: "Thống kê" },
        ]
      default:
        return [
          { href: "/", label: "Trang chủ" },
          { href: "/courses", label: "Các khóa học" },
          { href: "/dashboard", label: "Dashboard" },
          { href: "/blog", label: "Blog" },
          { href: "/contact", label: "Liên hệ" },
        ]
    }
  }
  

  const isActive = (href: string) => {
    if (href === "/") {
      return pathusername === "/"
    }
    return pathusername.startsWith(href)
  }

  return (
    <header className="border-b border-gray-200 shadow-sm">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <IoMdClose className="h-6 w-6 text-red-500" />
          </span>
        </div>
      )}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            <button onClick={toggleMenu} className="mr-4 text-gray-600 md:hidden">
              <FaBars size={20} />
            </button>
            <Link href="/" className="flex items-center">
              <Image
                src="/images/x5.png"
                alt="Logo"
                width={80}
                height={80}
                style={{ width: "auto", height: "auto" }}
                className="h-8 md:h-10 w-auto"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center justify-center flex-1 mx-4">
            <ul className="flex space-x-1">
              {getMenuItems().map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href) ? "bg-orange-50 text-orange-500" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            ) : !isLoggedIn ? (
              <Link href="/login" className="flex items-center text-sm font-medium text-gray-700 hover:text-orange-500">
                <IoIosLogIn className="mr-1" size={18} />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center focus:outline-none"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage || "/placeholder.svg"}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 border border-gray-200">
                      <FaRegCircleUser size={16} />
                    </div>
                  )}
                  <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:block">
                    {user?.username || "Tài khoản"}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.username || "Người dùng"}</p>
                      <p className="text-xs text-gray-500">{getRoleLabel(user?.role ?? "")}</p>
                    </div>
                    <Link
                      href={
                        user?.role === "ROLE_ADMIN"
                          ? "/admin/profile"
                          : user?.role === "ROLE_TEACHER"
                          ? "/teacher/profile"
                          : "/profile"
                      }
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Trang cá nhân
                    </Link>
                    <div className="border-t border-gray-100">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={handleLogout}
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={toggleMenu}
      ></div>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link href="/" className="flex items-center" onClick={toggleMenu}>
            <Image
              src="/images/x5.png"
              alt="Logo"
              width={52}
              height={52}
              style={{ width: "auto", height: "auto" }}
              className="h-8 w-auto"
            />
          </Link>
          <button onClick={toggleMenu} className="text-gray-500 hover:text-gray-700">
            <IoMdClose size={24} />
          </button>
        </div>

        {isLoggedIn && user && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center">
              {user.profileImage ? (
                <img
                  src={user.profileImage || "/placeholder.svg"}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 border border-gray-200">
                  <FaRegCircleUser size={20} />
                </div>
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.username || "Người dùng"}</p>
                <p className="text-xs text-gray-500">{getRoleLabel(user?.role ?? "")}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="p-4">
          <ul className="space-y-2">
            {getMenuItems().map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href) ? "bg-orange-50 text-orange-500" : "text-gray-700 hover:bg-gray-100"}`}
                  onClick={toggleMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {!isLoggedIn && (
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/login"
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600"
              onClick={toggleMenu}
            >
              <IoIosLogIn className="mr-2" size={18} />
              Đăng nhập
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
