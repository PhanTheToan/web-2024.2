"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { type FormEvent, useState } from "react"
import { FaBars, FaSearch } from "react-icons/fa"
import { FaRegCircleUser } from "react-icons/fa6"
import { IoIosLogIn } from "react-icons/io"
import { IoMdClose } from "react-icons/io"

export const Header = () => {
  const pathname = usePathname() // Lấy đường dẫn hiện tại
  const router = useRouter() // Thêm router để điều hướng
  const [isOpen, setIsOpen] = useState(false) // Trạng thái mở / đóng menu
  const [dropdownOpen, setDropdownOpen] = useState(false) // Trạng thái dropdown
  const [searchTerm, setSearchTerm] = useState("") // Từ khóa tìm kiếm
  const [searchModalOpen, setSearchModalOpen] = useState(false) // Trạng thái modal tìm kiếm trên mobile

  // Demo: Giả sử user đã đăng nhập (trong thực tế, bạn sẽ lấy từ context hoặc session)
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const user = {
    name: "Nguyễn Văn A",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: "student",
  }

  // Hàm toggle menu
  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Hàm toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
  }

  // Hàm toggle modal tìm kiếm
  const toggleSearchModal = () => {
    setSearchModalOpen(!searchModalOpen)
  }

  // Xử lý submit form tìm kiếm
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      // Điều hướng đến trang kết quả tìm kiếm với query parameter
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
      // Đóng modal tìm kiếm nếu đang mở
      setSearchModalOpen(false)
    }
  }

  // Xác định menu phù hợp theo vai trò
  const getMenuItems = () => {
    if (pathname.startsWith("/admin")) {
      return [
        { href: "/admin/courses", label: "Khóa học" },
        { href: "/admin/users", label: "Học viên" },
        { href: "/admin/blogs", label: "Quản lý Blog" },
        { href: "/admin/settings", label: "Cài đặt" },
      ]
    } else if (pathname.startsWith("/teacher")) {
      return [
        { href: "/teacher/courses", label: "Khóa học" },
        { href: "/teacher/students", label: "Học viên" },
        { href: "/teacher/assignments", label: "Bài tập" },
        { href: "/teacher/reports", label: "Thống kê" },
      ]
    } else {
      return [
        { href: "/", label: "Trang chủ" },
        { href: "/courses", label: "Các khóa học" },
        { href: "/blog", label: "Blog" },
        { href: "/contact", label: "Liên hệ" },
      ]
    }
  }

  return (
    <header className="sm:py-[24px] py-[20px]">
      <div className="container mx-auto px-[16px]">
        <div className="flex items-center justify-between sm:gap-[40px] gap-[16px]">
          {/* Button mở menu trên mobile */}
          <button onClick={toggleMenu} className="sm:text-[22px] text-[18px] text-primary md:hidden">
            <FaBars />
          </button>

          <Link href="/" className="font-[700] sm:text-[32px] text-[25px] text-primary md:flex-none flex-1">
            <img src="https://edupress.thimpress.com/wp-content/uploads/2024/01/logo-png.png" alt="Logo" />
          </Link>

          {/* Hiển thị menu trên desktop */}
          <nav className="md:block hidden">
            <ul className="flex gap-[24px]">
              {getMenuItems().map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="font-[600] text-[16px] text-[#333]">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Form tìm kiếm trên desktop */}
          <form
            className="flex-1 bg-[#F0F0F0] rounded-[62px] px-[16px] py-[12px] lg:flex hidden items-center gap-[12px]"
            onSubmit={handleSearchSubmit}
          >
            <button type="submit" className="text-[20px] text-[#00000066]">
              <FaSearch />
            </button>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 outline-none bg-transparent text-[16px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          <div className="flex items-center sm:gap-[14px] gap-[12px]">
            {/* Nút tìm kiếm trên mobile */}
            <button
              onClick={toggleSearchModal}
              className="sm:text-[22px] text-[20px] text-primary lg:hidden"
              aria-label="Tìm kiếm"
            >
              <FaSearch />
            </button>

            {!isLoggedIn ? (
              <Link href="/login" className="sm:text-[22px] text-[20px] text-primary">
                <IoIosLogIn />
              </Link>
            ) : null}

            {/* User Avatar với Dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="focus:outline-none"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                {isLoggedIn ? (
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt="Avatar"
                    className="sm:w-[30px] sm:h-[30px] w-[26px] h-[26px] rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <span className="sm:text-[22px] text-[20px] text-primary">
                    <FaRegCircleUser />
                  </span>
                )}
              </button>

              {/* Dropdown Menu */}
              {isLoggedIn && dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Trang cá nhân
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="border-t border-gray-100">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={() => {
                        setIsLoggedIn(false)
                        setDropdownOpen(false)
                        router.push("/")
                      }}
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar menu cho mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleMenu}
      ></div>
      <div
        className={`fixed top-0 left-0 h-full w-[250px] bg-white shadow-lg z-50 transform transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button onClick={toggleMenu} className="absolute top-4 right-4 text-[22px] text-gray-700">
          <IoMdClose />
        </button>

        <nav className="mt-12 px-6">
          <ul className="space-y-4">
            {getMenuItems().map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block font-[600] text-[18px] text-[#333] py-2 hover:text-primary"
                  onClick={toggleMenu}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Modal tìm kiếm cho mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity ${
          searchModalOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={toggleSearchModal}
      ></div>
      <div
        className={`fixed top-0 left-0 right-0 bg-white shadow-lg z-50 transform transition-transform p-4 ${
          searchModalOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Tìm kiếm</h3>
          <button onClick={toggleSearchModal} className="text-[22px] text-gray-700">
            <IoMdClose />
          </button>
        </div>
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="flex-1 bg-[#F0F0F0] rounded-[62px] px-[16px] py-[12px] flex items-center gap-[12px]">
            <FaSearch className="text-[20px] text-[#00000066]" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 outline-none bg-transparent text-[16px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-white rounded-[62px] px-[20px] py-[12px] text-[16px] font-semibold"
          >
            Tìm
          </button>
        </form>

        {/* Có thể thêm các gợi ý tìm kiếm phổ biến ở đây */}
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Tìm kiếm phổ biến:</p>
          <div className="flex flex-wrap gap-2">
            {["Khóa học lập trình", "Tiếng Anh", "Marketing", "Thiết kế đồ họa"].map((term) => (
              <button
                key={term}
                className="bg-gray-100 rounded-full px-3 py-1 text-sm"
                onClick={() => {
                  setSearchTerm(term)
                  handleSearchSubmit({ preventDefault: () => {} } as FormEvent)
                }}
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  )
}

