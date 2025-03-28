"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaBars, FaSearch } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { IoIosLogIn } from "react-icons/io";
import { IoMdClose } from "react-icons/io";

export const Header = () => {
    const pathname = usePathname(); // Lấy đường dẫn hiện tại
    const [isOpen, setIsOpen] = useState(false); // Trạng thái mở / đóng menu

    // Hàm toggle menu
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    // Xác định menu phù hợp theo vai trò
    const getMenuItems = () => {
        if (pathname.startsWith("/admin")) {
            return [
                { href: "/admin/courses", label: "Khóa học" },
                { href: "/admin/users", label: "Học viên" },
                { href: "/admin/blogs", label: "Quản lý Blog" },
                { href: "/admin/settings", label: "Cài đặt" },
            ];
        } else if (pathname.startsWith("/teacher")) {
            return [
                { href: "/teacher/courses", label: "Khóa học" },
                { href: "/teacher/students", label: "Học viên" },
                { href: "/teacher/assignments", label: "Bài tập" },
                { href: "/teacher/reports", label: "Thống kê" },
            ];
        } else {
            return [
                { href: "/", label: "Trang chủ" },
                { href: "/courses", label: "Các khóa học" },
                { href: "/blog", label: "Blog" },
                { href: "/contact", label: "Liên hệ" },
            ];
        }
    };

    return (
        <header className="sm:py-[24px] py-[20px]">
            <div className="container mx-auto px-[16px]">
                <div className="flex items-center justify-between sm:gap-[40px] gap-[16px]">
                    {/* Button mở menu trên mobile */}
                    <button onClick={toggleMenu} className="sm:text-[22px] text-[18px] text-primary md:hidden">
                        <FaBars />
                    </button>

                    <Link href="/" className="font-[700] sm:text-[32px] text-[25px] text-primary md:flex-none flex-1">
                        <img src="https://edupress.thimpress.com/wp-content/uploads/2024/01/logo-png.png" />
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

                    <form className="flex-1 bg-[#F0F0F0] rounded-[62px] px-[16px] py-[12px] lg:flex hidden items-center gap-[12px]">
                        <button type="submit" className="text-[20px] text-[#00000066]">
                            <FaSearch />
                        </button>
                        <input type="text" placeholder="Tìm kiếm sản phẩm..." className="flex-1 outline-none bg-transparent text-[16px]" />
                    </form>

                    <div className="flex items-center sm:gap-[14px] gap-[12px]">
                        <Link href="#" className="sm:text-[22px] text-[20px] text-primary lg:hidden">
                            <FaSearch />
                        </Link>
                        <Link href="/login" className="sm:text-[22px] text-[20px] text-primary">
                            <IoIosLogIn />
                        </Link>
                        <Link href="/profile" className="sm:text-[22px] text-[20px] text-primary">
                            <FaRegCircleUser />
                        </Link>
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
        </header>
    );
};
