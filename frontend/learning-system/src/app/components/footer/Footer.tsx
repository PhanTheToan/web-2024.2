import Link from "next/link";
import { FaTwitter, FaFacebookF, FaInstagram } from "react-icons/fa";
import Image from "next/image";
export const Footer = () => {
    return (
        <>
            {/* <!-- Footer --> */}
            <div className="bg-[#F5F5F5] lg:pt-[80px] pt-[60px] lg:mt-[-90px] mt-[-140px] sm:pb-[92px] pb-[30px] text-[#555555]">
                <div className="container mx-auto px-[16px]">
                    {/* <!-- Top --> */}
                    <div className="sm:flex justify-between flex-wrap gap-[32px] grid grid-cols-2">
                        <div className="lg:w-[248px] sm:w-full col-span-2">
                            <Link href="#" className="font-[700] sm:text-[34px] text-[28px] sm:mb-[25px]  text-black mb-[20px] ">
                                AlphaEducation

                            </Link>
                            <p className="font-[400] text-[14px] text-black sm:mb-[35px] mb-[20px]">
                                Nền tảng học online hàng đầu Việt Nam. Cung cấp các khóa học chất lượng cao từ các giảng viên hàng đầu.
                            </p>
                            <div className="flex gap-[12px]">
                                <Link href="#" target="_blank" className="border border-[#00000033] bg-white hover:bg-black rounded-[50%] w-[28px] h-[28px] text-[14px] inline-flex items-center justify-center text-black hover:text-white">
                                    <FaTwitter />
                                </Link>
                                <Link href="#" target="_blank" className="border border-[#00000033] bg-white hover:bg-black rounded-[50%] w-[28px] h-[28px] text-[14px] inline-flex items-center justify-center text-black hover:text-white">
                                    <FaFacebookF />
                                </Link>
                                <Link href="#" target="_blank" className="border border-[#00000033] bg-white hover:bg-black rounded-[50%] w-[28px] h-[28px] text-[14px] inline-flex items-center justify-center text-black hover:text-white">
                                    <FaInstagram />
                                </Link>
                            </div>
                        </div>
                        <div className="sm:w-auto">
                            <h2 className="font-[500] font-bold text-[16px] text-black mb-[26px] uppercase">
                                Thành Viên
                            </h2>
                            <div className="flex flex-col gap-[12px]">
                                <Link href="#" className="font-[400] text-[16px] text-black hover:text-[#FF782D]">
                                    Phan Thế Toàn
                                </Link>
                                <Link href="#" className="font-[400] text-[16px] text-black hover:text-[#FF782D]">
                                    Nguyễn Việt Thành
                                </Link>
                                <Link href="#" className="font-[400] text-[16px] text-black hover:text-[#FF782D]">
                                    Trần Thị Minh Thu
                                </Link>
                                <Link href="#" className="font-[400] text-[16px] text-black hover:text-[#FF782D]">
                                    Nguyễn Trí Trai
                                </Link>
                            </div>
                        </div>
                        <div className="sm:w-auto">
                            <h2 className="font-[500] font-bold text-[16px] text-black mb-[26px] uppercase">
                                Trợ giúp
                            </h2>
                            <div className="flex flex-col gap-[12px]">
                                <Link href="/contact" className="font-[400] text-[16px] text-black hover:text-[#FF782D]">
                                    Hỗ Trợ Khách Hàng
                                </Link>
                                <Link href="#" className="font-[400] text-[16px] text-black hover:text-[#FF782D]">
                                    Điều Khoản & Điều Kiện
                                </Link>
                                <Link href="#" className="font-[400] text-[16px] text-black hover:text-[#FF782D]">
                                    Chính Sách
                                </Link>
                            </div>
                        </div>

                        <div className="sm:w-auto">
                            <h2 className="font-[500] text-[16px] font-bold text-black mb-[26px] uppercase">
                                Tài nguyên
                            </h2>
                            <div className="flex flex-col gap-[12px]">
                                <Link href="#" className="font-[400] text-[16px] text-black hover:text-[#FF782D]">
                                    Sách Miễn Phí
                                </Link>
                                <Link href="#" className="font-[400] text-[16px] text-black hover:text-[#FF782D]">
                                    Bài Viết
                                </Link>
                                <Link href="#" className="font-[400] text-[16px] text-black hover:text-[#FF782D]">
                                    Kiến Thức
                                </Link>
                                <Link href="#" className="font-[400] text-[16px] text-black hover:text-[#FF782D]">
                                    Youtube
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* <!-- Bottom --> */}
                    <div className="border-t border-[#0000001A] pt-[20px] sm:mt-[48px] mt-[38px] flex flex-wrap items-center sm:justify-between justify-center">
                        <div className="font-[400] text-[14px] text-black sm:mb-[0px] mb-[20px]">
                            Công nghệ Web 2025, All Rights Reserved
                        </div>
                        <div className="inline-flex sm:gap-[12px] gap-[10px]">
                            <img src="#" className="h-[30px] w-[46px] py-[7px] px-[10px] rounded-[5px] bg-white object-contain" />
                            <img src="#" className="h-[30px] w-[46px] py-[7px] px-[10px] rounded-[5px] bg-white object-contain" />
                            <img src="#" className="h-[30px] w-[46px] py-[7px] px-[10px] rounded-[5px] bg-white object-contain" />
                            <img src="#" className="h-[30px] w-[46px] py-[7px] px-[10px] rounded-[5px] bg-white object-contain" />
                            <img src="#" className="h-[30px] w-[46px] py-[7px] px-[10px] rounded-[5px] bg-white object-contain" />
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- End Footer --> */}
        </>
    )
}