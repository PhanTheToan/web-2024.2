import React from "react";
import { StatisticCards } from "./components/statisticcards/StatisticCards";
import { FaStar } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";

export default function Home() {
  return (
    <>
      {/* Section 1 */}
      <div className="relative w-full overflow-hidden bg-white pb-[50px] h-fit">
        <img
          src="./images/HeroBanner.svg"
          alt="Hero Banner"
          className="w-full h-auto object-cover"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-5 w-[90%] max-w-[400px] text-center md:left-[32%] md:text-left">
          <div className="text-2xl md:text-3xl font-bold">
            Build Skills with Online Course
          </div>
          <div className="text-gray-600 text-sm md:text-base">
            We denounce with righteous indignation and dislike men who are so beguiled
            and demoralized that cannot trouble.
          </div>
          <button className="bg-[#FF782D] text-white py-2 px-4 rounded-md hover:bg-lime-500 transition w-fit mx-auto md:mx-0">
            Posts comment
          </button>
        </div>
      </div>

      {/* Section 2 */}
      <div className = "container mx-auto px-4">
        {/* Box-head */}
        <div className=" flex items-end justify-between">
          <div>
            <div className="font-medium text-[16px] text-black mb-1 md:text-[14px]">Explore our Popular Categories</div>
            <h2 className="font-bold text-[24px] text-[#333333] capitalize m-0 md:text-[20px]">Top Categories</h2>
          </div>
          <button className="inline-flex items-center h-[44px] px-7 text-[#333333] font-medium text-[16px] bg-transparent rounded-full transition border border-[1.5px] border-[#FF782D] hover:bg-[#FF782D] hover:text-white">
            All categories
            <i className="fa-solid fa-angle-right text-[18px] text-[#333333] ml-[11px] transition group-hover:text-white"></i>
          </button>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8 bg-white">
        <div className="border border-gray-300 rounded-2xl p-6 text-center transition duration-300 hover:shadow-lg">
          <img src="https://edupress.thimpress.com/wp-content/uploads/2023/11/art-icon.svg" alt="Art & Design" className="mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2 text-gray-800">
            <a href="https://edupress.thimpress.com/course-category/art-design/" className="hover:text-orange-500">Art & Design</a>
          </h4>
          <span className="text-gray-600">2 Courses</span>
        </div>
        <div className="border border-gray-300 rounded-2xl p-6 text-center transition duration-300 hover:shadow-lg">
          <img src="https://edupress.thimpress.com/wp-content/uploads/2023/11/comu-icon.svg" alt="Communation" className="mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2 text-gray-800">
            <a href="https://edupress.thimpress.com/course-category/communation/" className="hover:text-orange-500">Communation</a>
          </h4>
          <span className="text-gray-600">1 Course</span>
        </div>
        <div className="border border-gray-300 rounded-2xl p-6 text-center transition duration-300 hover:shadow-lg">
          <img src="https://edupress.thimpress.com/wp-content/uploads/2023/11/content-icon.svg" alt="Content Writing" className="mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2 text-gray-800">
            <a href="https://edupress.thimpress.com/course-category/content-writing/" className="hover:text-orange-500">Content Writing</a>
          </h4>
          <span className="text-gray-600">1 Course</span>
        </div>
        <div className="border border-gray-300 rounded-2xl p-6 text-center transition duration-300 hover:shadow-lg">
          <img src="https://edupress.thimpress.com/wp-content/uploads/2023/11/develop-icon.svg" alt="Development" className="mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2 text-gray-800">
            <a href="https://edupress.thimpress.com/course-category/development/" className="hover:text-orange-500">Development</a>
          </h4>
          <span className="text-gray-600">1 Course</span>
        </div>
        <div className="border border-gray-300 rounded-2xl p-6 text-center transition duration-300 hover:shadow-lg">
          <img src="https://edupress.thimpress.com/wp-content/uploads/2023/11/finance-icon.svg" alt="Finance & Bank" className="mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2 text-gray-800">
            <a href="https://edupress.thimpress.com/course-category/finance-bank/" className="hover:text-orange-500">Finance & Bank</a>
          </h4>
          <span className="text-gray-600">1 Course</span>
        </div>
        <div className="border border-gray-300 rounded-2xl p-6 text-center transition duration-300 hover:shadow-lg">
          <img src="https://edupress.thimpress.com/wp-content/uploads/2023/11/marketing-icon.svg" alt="Marketing" className="mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2 text-gray-800">
            <a href="https://edupress.thimpress.com/course-category/marketing/" className="hover:text-orange-500">Marketing</a>
          </h4>
          <span className="text-gray-600">2 Courses</span>
        </div>
        <div className="border border-gray-300 rounded-2xl p-6 text-center transition duration-300 hover:shadow-lg">
          <img src="https://edupress.thimpress.com/wp-content/uploads/2023/11/network-icon.svg" alt="Network" className="mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2 text-gray-800">
            <a href="https://edupress.thimpress.com/course-category/network/" className="hover:text-orange-500">Network</a>
          </h4>
          <span className="text-gray-600">1 Course</span>
        </div>
        <div className="border border-gray-300 rounded-2xl p-6 text-center transition duration-300 hover:shadow-lg">
          <img src="https://edupress.thimpress.com/wp-content/uploads/2023/11/photo-icon.svg" alt="Photography" className="mx-auto mb-4" />
          <h4 className="text-lg font-semibold mb-2 text-gray-800">
            <a href="https://edupress.thimpress.com/course-category/photography/" className="hover:text-orange-500">Photography</a>
          </h4>
          <span className="text-gray-600">1 Course</span>
        </div>
      </div>
      </div>
      {/* End Section 2 */}

      {/* Section 3 */}
      <div className = "container mx-auto px-4">
        {/* Box-head */}
        <div className="mb-7 flex items-end justify-between">
          <div>
            <div className="font-medium text-[16px] text-black mb-1 md:text-[14px]">Featured Courses</div>
            <h2 className="font-bold text-[24px] text-[#33333] capitalize m-0 md:text-[20px]">Explore our Popular Courses.</h2>
          </div>
          <button className="inline-flex items-center h-[44px] px-7 text-[#333333] font-medium text-[16px] bg-transparent rounded-full border border-[1.5px] border-[#FF782D] transition hover:bg-[#FF782D] hover:text-white">
            All Courses
            <i className="fa-solid fa-angle-right text-[18px] text-[#333333] ml-[11px] transition group-hover:text-white"></i>
          </button>
        </div>

        {/* Courses Section */}
        <div className="max-w-sm rounded-[20px] overflow-hidden shadow-lg border border-[#EAEAEA] bg-white">
          <img src="https://edupress.thimpress.com/wp-content/uploads/2024/11/course-offline-01.jpg" alt="Course Image" className="mb-4" />
          <div className="p-5 mt-[-10px]">
            <h2 className="text-[#333333] text-xl font-bold mb-2">
              Introduction to LearnPress: Building your Learning Management System
            </h2>
            <p className="text-sm text-gray-500 mb-4">by <span className="text-black">Thomas</span> in <span className="text-[#ff782d]">Teaching Online</span></p>
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <div className="flex items-center mr-4">
                <svg className="w-5 h-5 text-[#ff782d] mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16v2H4zM4 11h16v2H4zM4 18h16v2H4z"></path>
                </svg>
                <span>21 Lessons</span>
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-[#ff782d] mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                </svg>
                <span>603 Students</span>
              </div>
            </div>
            <p className="text-green-500 font-bold mb-4">Free</p>
            <button className="w-full py-2 bg-[#ff782d] text-white rounded-full hover:bg-[#e66c27] transition duration-300">
              Read More
            </button>
          </div>
        </div>
      </div>
      {/* End Section 3 */}

      {/* Section 4 */}
      <StatisticCards />
      {/* End Section 4 */}

      {/* Section 5 */}
      <div className="sm:pb-[80px] pb-[60px] container mx-auto px-4">
        <div className="container mx-auto px-4 mx-auto px-[16px]">
          <h2 className="font-[700] md:text-[36px] sm:text-[38px] text-[32px] text-[#333333] sm:mb-[54px] mb-[32px] text-center">
            CẢM NHẬN CỦA KHÁCH HÀNG
          </h2>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-[20px]">
            <div className="border border-[#00000066] rounded-[20px] sm:py-[28px] py-[24px] sm:px-[32px] px-[24px]">
              <div className="sm:text-[20px] text-[16px] text-[#FFC633] sm:mb-[15px] mb-[12px] flex">
                <FaStar className="text-[#FFC633]" />
                <FaStar className="text-[#FFC633]" />
                <FaStar className="text-[#FFC633]" />
                <FaStar className="text-[#FFC633]" />
                <FaStar className="text-[#FFC633]" />
              </div>
              <div className="flex items-center sm:mb-[12px] mb-[8px]">
                <div className="font-[700] sm:text-[20px] text-[16px] text-[#FF7D28]">
                  Le Van A
                </div>
                <FaCheckCircle className="text-[#01AB31] sm:text-[18px] text-[14px] ml-[6px]" />
              </div>
              <div className="font-[400] sm:text-[16px] text-[14px] text-[#00000066]">
                "LearnPress theme is a special build for an effective education & Learning Management System site. Education WP is the next generation & one of the best education WordPress themes which contains all the strength of eLearning WP and comes with better UI/UX."
              </div>
            </div>
            <div className="border border-[#00000066] rounded-[20px] sm:py-[28px] py-[24px] sm:px-[32px] px-[24px]">
              <div className="sm:text-[20px] text-[16px] text-[#FFC633] sm:mb-[15px] mb-[12px] flex">
                <FaStar className="text-[#FFC633]" />
                <FaStar className="text-[#FFC633]" />
                <FaStar className="text-[#FFC633]" />
                <FaStar className="text-[#FFC633]" />
                <FaStar className="text-[#FFC633]" />
              </div>
              <div className="flex items-center sm:mb-[12px] mb-[8px]">
                <div className="font-[700] sm:text-[20px] text-[16px] text-[#FF7D28]">
                  Le Van A
                </div>
                <FaCheckCircle className="text-[#01AB31] sm:text-[18px] text-[14px] ml-[6px]" />
              </div>
              <div className="font-[400] sm:text-[16px] text-[14px] text-[#00000066]">
                "LearnPress theme is a special build for an effective education & Learning Management System site. Education WP is the next generation & one of the best education WordPress themes which contains all the strength of eLearning WP and comes with better UI/UX."
              </div>
            </div>
            <div className="border border-[#00000066] rounded-[20px] sm:py-[28px] py-[24px] sm:px-[32px] px-[24px]">
              <div className="sm:text-[20px] text-[16px] text-[#FFC633] sm:mb-[15px] mb-[12px] flex">
                <FaStar className="text-[#FFC633]" />
                <FaStar className="text-[#FFC633]" />
                <FaStar className="text-[#FFC633]" />
                <FaStar className="text-[#FFC633]" />
                <FaStar className="text-[#FFC633]" />
              </div>
              <div className="flex items-center sm:mb-[12px] mb-[8px]">
                <div className="font-[700] sm:text-[20px] text-[16px] text-[#FF7D28]">
                  Le Van A
                </div>
                <FaCheckCircle className="text-[#01AB31] sm:text-[18px] text-[14px] ml-[6px]" />
              </div>
              <div className="font-[400] sm:text-[16px] text-[14px] text-[#00000066]">
                "LearnPress theme is a special build for an effective education & Learning Management System site. Education WP is the next generation & one of the best education WordPress themes which contains all the strength of eLearning WP and comes with better UI/UX."
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Section 5 */}
    </>
  );
}
