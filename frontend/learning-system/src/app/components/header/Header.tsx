import Link from "next/link";
import { FaBars, FaSearch} from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { MdOutlineCastForEducation } from "react-icons/md";

export const Header = () => {
    return (
        <>
            <header className="sm:py-[24px] py-[20px]">
                <div className="container mx-auto px-[16px]">
                    <div className="flex items-center justify-between sm:gap-[40px] gap-[16px]">
                        <Link href="#" className="sm:text-[22px] text-[18px] text-primary md:hidden">
                            <i className="fa-solid fa-bars"></i>
                        </Link>

                        <Link href="#" className="font-[700] sm:text-[32px] text-[25px] text-primary md:flex-none flex-1">
                            <img src="https://edupress.thimpress.com/wp-content/uploads/2024/01/logo-png.png" />
                        </Link>

                        <nav className="md:block hidden">
                            <ul className="flex gap-[24px]">
                                <li className="">
                                    <Link href="#" className="font-[600] text-[16px] text-[#333333]">
                                        Trang chủ
                                    </Link>
                                </li>
                                <li className="">
                                    <Link href="#" className="font-[600] text-[16px] text-[#333333]">
                                        Các khóa học
                                    </Link>
                                </li>
                                <li className="">
                                    <Link href="#" className="font-[600] text-[16px] text-[#333333]">
                                        Blog
                                    </Link>
                                </li>
                                <li className="">
                                    <Link href="#" className="font-[600] text-[16px] text-[#333333]">
                                        Liên Hệ
                                    </Link>
                                </li>
                            </ul>
                        </nav>

                        <form action="" className="flex-1 bg-[#F0F0F0] rounded-[62px] px-[16px] py-[12px] lg:flex hidden items-center gap-[12px]">
                            <button type="submit" className="text-[20px] text-[#00000066]">
                                <FaSearch />
                            </button>
                            <input type="text" placeholder="Tìm kiếm sản phẩm..." className="flex-1 outline-none bg-transparent text-[16px]" />
                        </form>

                        <div className="flex items-center sm:gap-[14px] gap-[12px]">
                            <Link href="#" className="sm:text-[22px] text-[20px] text-primary lg:hidden">
                                <FaSearch />
                            </Link>
                            <Link href="#" className="sm:text-[22px] text-[20px] text-primary">
                                <MdOutlineCastForEducation />
                            </Link>
                            <Link href="#" className="sm:text-[22px] text-[20px] text-primary">
                                <FaRegCircleUser />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}