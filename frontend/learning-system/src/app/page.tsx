"use client";

import React, { useEffect, useState } from "react";
import { StatisticCards } from "./components/statisticcards/StatisticCards";
import { FaStar } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";
import { Button } from '@mui/material';
import Image from 'next/image';
import { Check } from "lucide-react";
import * as dotenv from "dotenv";
import CourseGrid from "./components/courses-grid/CourseGrid";
import Link from "next/link";
import HeroBanner from "./components/slide/hero-banner-slideshow";

dotenv.config();
const API_BASE_URL = process.env.BASE_URL;
console.log("API_BASE_URL:", API_BASE_URL);

interface Category {
  categoryId: string;
  categoryDisplayName: string;
  categoryUrl: string;
  categoryCount: number;
}

interface Feedback {
  id: string;
  fullName: string;
  rating: number;
  comment: string;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  // const [setLoading] = useState(true);
  // const [setError] = useState(null);

  // Fetch categories
  useEffect(() => {
    console.log("API_BASE_URL:", API_BASE_URL);
    setTimeout(() => {
      console.log("Fetching categories...");
      fetch(`${API_BASE_URL}/categories/popular`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Dữ liệu từ API:", data);
          setCategories(data.body);  // Assuming this part works as intended
        })
        .catch((error) => {
          console.error("Lỗi khi lấy danh mục:", error);
          // setError?.("Dữ liệu danh mục hiển thị là tạm thời.");
        });
    }, 2000);
  }, []);

  // Fetch courses
  useEffect(() => {
    console.log("API_BASE_URL:", API_BASE_URL);  // Kiểm tra xem giá trị đúng chưa

    // Add setTimeout if you still want to simulate a delay
    setTimeout(() => {
      console.log("Fetching featured courses...");

      // Make the fetch request to get featured courses
      fetch(`${API_BASE_URL}/categories/featured-courses`)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch featured courses");
          return response.json();
        })
        .then((data) => {
          console.log("Dữ liệu từ API:", data);

          // Assuming data.body contains the courses and we want to set it to state
          if (Array.isArray(data.body) && data.body.length > 0) {
            setCourses(data.body);  // Assuming data.body contains the courses
          } else {
            // setError("Không có dữ liệu khóa học từ API, hiển thị dữ liệu mặc định.");
            console.log("Dữ liệu từ API");
          }
        })
        .catch((err) => {
          console.error("Lỗi API:", err);
          // setError("Dữ liệu khóa học hiển thị là tạm thời.");
        })
        // .finally(() => setLoading(false));
        .finally(() => console.log("Dữ liệu từ API"));

    }, 2000);  // Optional delay before fetching
  }, []);  // Empty array to run only once when the component is mounted


  // Fetch feedbacks
  useEffect(() => {
    console.log("API_BASE_URL:", API_BASE_URL);  // Kiểm tra xem giá trị đúng chưa

    // Add setTimeout if you still want to simulate a delay
    setTimeout(() => {
      console.log("Fetching feedbacks...");

      // Fetch feedback data from the API
      fetch(`${API_BASE_URL}/reviews`)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch feedbacks");
          return response.json();
        })
        .then((data) => {
          console.log("Dữ liệu từ API:", data);

          // Assuming the data is wrapped in a 'body' field
          if (data.body && Array.isArray(data.body) && data.body.length > 0) {
            setFeedbacks(data.body);  // Set the feedbacks to the state
          } else {
            // setError("Không có phản hồi từ API, hiển thị dữ liệu mặc định.");
            console.log("Dữ liệu từ API");
          }
        })
        // thu
        .catch((err) => {
          console.error("Lỗi API:", err);
          // setError("Dữ liệu phản hồi hiển thị là tạm thời.");
        })
        .finally(() => console.log("Dữ liệu từ API"));

    }, 2000);  // Optional delay before fetching
  }, []);  // Empty array to run only once when the component is mounted  

  return (
    <>
      {/* Section 1 */}
      {/* <Box
        sx={{
          backgroundImage: 'url(./images/HeroBanner.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          width: '100%',
          minHeight: '80vh', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          px: { xs: 6, md: 40 }, 
          py: { xs: 10, md: 20 }, 
          mb: '90px',
        }}
      >
        <Box sx={{ maxWidth: { xs: '90%', md: '50%' }, textAlign: 'left' }}>
          <Typography variant="h3" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
            Build Skills With <br /> Online Course
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Get started with modern education and skills that help you get ahead and stay ahead.
            Thousands of courses to help you grow.
          </Typography>
          <Link href="/courses">
            <Button
              variant="contained"
              color="warning"
              sx={{ borderRadius: '50px', px: 4, mt: 3 }}
            >
              Get Started
            </Button>
          </Link>
        </Box>
      </Box> */}
      <HeroBanner />
      {/* End Section 1 */}

      {/* Section 2 */}
      <div className="container mx-auto px-4 mb-10">
        {/* Box-head */}
        <div className=" flex items-end justify-between">
          <div>
            <h2 className="font-bold text-[24px] text-black  mb-1 capitalize m-0 sx:text-[20px]">Danh mục hàng đầu</h2>
            <div className="font-medium text-[18px] text-[#555555] sx:text-[14px]">Khám phá </div>
          </div>
          <Link href="/courses">
            <button className="inline-flex items-center h-[44px] px-7 text-black font-medium text-[16px] bg-transparent rounded-full transition border border-[1.5px] border-[#FF782D] hover:bg-[#FF782D] hover:text-white">
              Tất cả danh mục
              <i className="fa-solid fa-angle-right text-[18px] text-[#555555] ml-[11px] transition group-hover:text-white"></i>
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8 bg-white">
          {categories.map((category) => (
            <div key={category.categoryId} className="border border-gray-300 rounded-2xl p-6 text-center transition duration-300 hover:shadow-lg">
              <img src={category.categoryUrl} alt={category.categoryDisplayName} className="mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2 text-gray-800">
                <a href={"/courses"} className="hover:text-orange-500">
                  {category.categoryDisplayName}
                </a>
              </h4>
              <span className="text-gray-600">{category.categoryCount} Khóa học</span>
            </div>
          ))}
        </div>
      </div>
      {/* End Section 2 */}

      {/* Section 3 */}
      <div className="container mx-auto px-4">
        {/* Box-head */}
        <div className=" flex items-end justify-between pb-8">
          <div>
            <h2 className="font-bold text-[24px] text-black  mb-1 capitalize m-0 sx:text-[20px]">Khóa học nổi bật</h2>
            <div className="font-medium text-[18px] text-[#555555] sx:text-[14px]">Khám phá </div>
          </div >
          <Link href="/courses">
           <button className="inline-flex items-center h-[44px] px-7 text-black font-medium text-[16px] bg-transparent rounded-full transition border border-[1.5px] border-[#FF782D] hover:bg-[#FF782D] hover:text-white">
              Tất cả khóa học
            <i className="fa-solid fa-angle-right text-[18px] text-[#555555] ml-[11px] transition group-hover:text-white"></i>
           </button>
          </Link>
          
        </div>

        <CourseGrid courses={courses} />

      </div>
      {/* End Section 3 */}

      {/* Section 4 */}
      <StatisticCards />
      {/* End Section 4 */}

      {/* Section 5 */}
      <div className="min-h-screen bg-white">
        <main className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left side - Illustration */}
            <div className="relative w-full h-[400px] md:h-[500px]">
              <Image
                src="/images/Vector.png"
                alt="Learning illustration"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Right side - Content */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
                Phát triển kỹ năng của bạn với AlphaEducation
              </h1>

              <p className="text-lg text-gray-600">
                Nền tảng học trực tuyến hiện đại giúp bạn nâng cao kiến thức, phát triển nghề nghiệp và đạt được mục tiêu học tập một cách hiệu quả.
              </p>

              <div className="space-y-3 py-2">
                {["Chứng chỉ hoàn thành khóa học",
                  "Xác nhận kỹ năng đạt được",
                  "Giấy chứng nhận học tập",
                  "Hỗ trợ nâng cao hồ sơ cá nhân"].map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-shrink-0 h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-gray-800">{item}</span>
                    </div>
                  ))}
              </div>

              <Link href="/courses">
                <Button
                  variant="contained"
                  color="warning"
                  sx={{ borderRadius: '50px', px: 4, mt: 3 }}
                >
                  Khám phá khóa học
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
      {/* End Section 5 */}

      {/* Section 6 */}
      <div className="sm:pb-[80px] pb-[60px] container mx-auto px-4">
        <div className="container mx-auto px-4 mx-auto px-[16px]">
          <h2 className="font-[700] md:text-[36px] sm:text-[38px] text-[32px] text-[#555555] sm:mb-[54px] mb-[32px] text-center">
            CẢM NHẬN CỦA KHÁCH HÀNG
          </h2>
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-[20px]">
            {feedbacks.map((feedback, index) => (
              <div
                key={index}
                className="border border-gray-400 rounded-[20px] p-[24px] sm:py-[28px] sm:px-[32px]"
              >
                {/* Hiển thị số sao */}
                <div className="text-[#FFC633] flex sm:text-[20px] text-[16px] mb-[12px] sm:mb-[15px]">
                  {Array(feedback.rating)
                    .fill(0)
                    .map((_, index) => (
                      <FaStar key={`${feedback.id}-star-${index}`} className="text-[#FFC633]" />
                    ))}
                </div>

                {/* Hiển thị tên khách hàng */}
                <div className="flex items-center sm:mb-[12px] mb-[8px]">
                  <span className="font-bold text-[#FF7D28] sm:text-[20px] text-[16px]">
                    {feedback.fullName}
                  </span>
                  <FaCheckCircle className="text-[#01AB31] sm:text-[18px] text-[14px] ml-[6px]" />
                </div>

                {/* Nội dung đánh giá */}
                <p className="text-gray-600 sm:text-[16px] text-[14px]">
                  &lsquo;{feedback.comment}&rsquo;
                </p>

              </div>
            ))}

          </div>
        </div>
      </div>
      {/* End Section 6 */}
    </>
  );
}
