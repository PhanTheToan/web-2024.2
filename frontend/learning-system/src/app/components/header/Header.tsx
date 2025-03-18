"use client";

import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { FaBars, FaSearch } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { IoIosLogIn } from "react-icons/io";

export const Header = () => {
    const pathname = usePathname(); // Lấy đường dẫn hiện tại

    return (
        <header className="sm:py-[24px] py-[20px]">
            <div className="container mx-auto px-[16px]">
                <div className="flex items-center justify-between sm:gap-[40px] gap-[16px]">
                    <Link href="#" className="sm:text-[22px] text-[18px] text-primary md:hidden">
                        <FaBars />
                    </Link>

                    <Link href="/" className="font-[700] sm:text-[32px] text-[25px] text-primary md:flex-none flex-1">
                        <img src="https://edupress.thimpress.com/wp-content/uploads/2024/01/logo-png.png" />
                    </Link>

                    {/* Kiểm tra nếu pathname là /admin thì hiển thị menu admin */}
                    {pathname.startsWith("/admin") ? (
                        <nav className="md:block hidden">
                            <ul className="flex gap-[24px]">
                                <li><Link href="/admin/courses" className="font-[600] text-[16px] text-[#333]">Khóa học</Link></li>
                                <li><Link href="/admin/users" className="font-[600] text-[16px] text-[#333]">Học viên</Link></li>
                                <li><Link href="/admin/blogs" className="font-[600] text-[16px] text-[#333]">Quản lý Blog</Link></li>
                                <li><Link href="/admin/settings" className="font-[600] text-[16px] text-[#333]">Cài đặt</Link></li>
                            </ul>
                        </nav>
                    ) : pathname.startsWith("/teacher") ? (
                        <nav className="md:block hidden">
                            <ul className="flex gap-[24px]">
                                <li><Link href="/teacher/courses" className="font-[600] text-[16px] text-[#333]">Khóa học</Link></li>
                                <li><Link href="/teacher/students" className="font-[600] text-[16px] text-[#333]">Học viên</Link></li>
                                <li><Link href="/teacher/assignments" className="font-[600] text-[16px] text-[#333]">Bài tập</Link></li>
                                <li><Link href="/teacher/reports" className="font-[600] text-[16px] text-[#333]">Thống kê</Link></li>
                            </ul>
                        </nav>
                    ): (
                        <nav className="md:block hidden">
                            <ul className="flex gap-[24px]">
                                <li><Link href="/" className="font-[600] text-[16px] text-[#333]">Trang chủ</Link></li>
                                <li><Link href="/courses" className="font-[600] text-[16px] text-[#333]">Các khóa học</Link></li>
                                <li><Link href="/blog" className="font-[600] text-[16px] text-[#333]">Blog</Link></li>
                                <li><Link href="/contact" className="font-[600] text-[16px] text-[#333]">Liên hệ</Link></li>
                            </ul>
                        </nav>
                    )}

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
        </header>
    );
};
