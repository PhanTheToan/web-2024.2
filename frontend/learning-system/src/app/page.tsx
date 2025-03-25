"use client";

import React, { useEffect, useState } from "react";
import { StatisticCards } from "./components/statisticcards/StatisticCards";
import { FaStar } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";

const defaultCourses = [
  {
    id: 1,
    title: "Khóa học ReactJS",
    instructor: "Nguyễn Văn A",
    category: "Web Development",
    lessons: 12,
    students: 150,
    price: 0,
    imageUrl: "https://via.placeholder.com/300",
  },
  {
    id: 2,
    title: "Khóa học NodeJS",
    instructor: "Trần Văn B",
    category: "Backend Development",
    lessons: 10,
    students: 120,
    price: 19.99,
    imageUrl: "https://via.placeholder.com/300",
  },
];

const defaultCategories = [
  {
    id: 1,
    name: "Nghệ thuật & Thiết kế",
    slug: "art-design",
    courses: 2,
    image: "https://edupress.thimpress.com/wp-content/uploads/2023/11/art-icon.svg",
  },
  {
    id: 2,
    name: "Giao tiếp",
    slug: "communation",
    courses: 2,
    image: "https://edupress.thimpress.com/wp-content/uploads/2023/11/comu-icon.svg",
  },
  {
    id: 3,
    name: "Viết nội dung",
    slug: "content-writing",
    courses: 2,
    image: "https://edupress.thimpress.com/wp-content/uploads/2023/11/content-icon.svg",
  },
  {
    id: 4,
    name: "Lập trình & Phát triển",
    slug: "development",
    courses: 2,
    image: "https://edupress.thimpress.com/wp-content/uploads/2023/11/develop-icon.svg",
  },
  {
    id: 5,
    name: "Tài chính & Ngân hàng",
    slug: "finance-bank",
    courses: 2,
    image: "https://edupress.thimpress.com/wp-content/uploads/2023/11/finance-icon.svg",
  },
  {
    id: 6,
    name: "Marketing",
    slug: "marketing",
    courses: 2,
    image: "https://edupress.thimpress.com/wp-content/uploads/2023/11/marketing-icon.svg",
  },
  {
    id: 7,
    name: "Mạng máy tính",
    slug: "network",
    courses: 2,
    image: "https://edupress.thimpress.com/wp-content/uploads/2023/11/network-icon.svg",
  },
  {
    id: 8,
    name: "Nhiếp ảnh",
    slug: "photography",
    courses: 2,
    image: "https://edupress.thimpress.com/wp-content/uploads/2023/11/photo-icon.svg",
  },
];

const defaultFeedbacks = [
  {
    id: 1,
    name: "Lê Văn A",
    rating: 5,
    comment: "Trang web có giao diện thân thiện, dễ sử dụng.",
  },
  {
    id: 2,
    name: "Nguyễn Văn B",
    rating: 4,
    comment: "Dịch vụ tốt nhưng cần cải thiện tốc độ tải trang.",
  },
  {
    id: 3,
    name: "Trần Thị C",
    rating: 5,
    comment: "Nội dung khóa học rất hữu ích, hỗ trợ nhiệt tình.",
  },
];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/courses")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch courses");
        return response.json();
      })
      .then((data) => setCourses(Array.isArray(data) && data.length > 0 ? data : defaultCourses)) // Nếu API rỗng, dùng data giả định
      .catch((err) => {
        console.error("Lỗi API:", err);
        setCourses(defaultCourses); // Khi API lỗi, dùng data giả định
        setError("Dữ liệu hiển thị là tạm thời.");
      })
      .finally(() => setLoading(false));
  }, []);

  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    // Giả lập gọi API sau 2 giây
    setTimeout(() => {
      fetch("https://api.example.com/categories")
        .then((response) => response.json())
        .then((data) => setCategories(data))
        .catch((error) => console.error("Lỗi khi lấy danh mục:", error));
    }, 2000);
  }, []);

  const [feedbacks, setFeedbacks] = useState(defaultFeedbacks);

  useEffect(() => {
    // Giả lập gọi API sau 2 giây
    setTimeout(() => {
      fetch("https://api.example.com/feedbacks")
        .then((response) => response.json())
        .then((data) => setFeedbacks(data))
        .catch((error) => console.error("Lỗi khi lấy feedback:", error));
    }, 2000);
  }, []);
  return (
    <>
      {/* Section 1 */}
      <div className="relative w-full overflow-hidden bg-white pb-[50px] h-fit">
        <img
          src="./images/HeroBanner.svg"
          alt="Hình ảnh chính"
          className="w-full h-auto object-cover"
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col gap-5 w-[90%] max-w-[400px] text-center md:left-[32%] md:text-left">
          <div className="text-2xl md:text-3xl font-bold">
            Phát triển kỹ năng với khóa học trực tuyến
          </div>
          <div className="text-gray-600 text-sm md:text-base">
            Chúng tôi lên án mạnh mẽ những hành vi lừa dối và làm mất đi động lực của con người.
          </div>
          <button className="bg-[#FF782D] text-white py-2 px-4 rounded-md hover:bg-lime-500 transition w-fit mx-auto md:mx-0">
            Đăng ký
          </button>
        </div>
      </div>

      {/* Section 2 */}
      <div className="container mx-auto px-4">
        {/* Box-head */}
        <div className=" flex items-end justify-between">
          <div>
            <div className="font-medium text-[16px] text-black mb-1 md:text-[14px]">Khám phá danh mục phổ biến</div>
            <h2 className="font-bold text-[24px] text-[#333333] capitalize m-0 md:text-[20px]">Danh mục hàng đầu</h2>
          </div>
          <button className="inline-flex items-center h-[44px] px-7 text-[#333333] font-medium text-[16px] bg-transparent rounded-full transition border border-[1.5px] border-[#FF782D] hover:bg-[#FF782D] hover:text-white">
            Tất cả danh mục
            <i className="fa-solid fa-angle-right text-[18px] text-[#333333] ml-[11px] transition group-hover:text-white"></i>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8 bg-white">
          {categories.map((category) => (
            <div key={category.id} className="border border-gray-300 rounded-2xl p-6 text-center transition duration-300 hover:shadow-lg">
              <img src={category.image} alt={category.name} className="mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2 text-gray-800">
                <a href={`https://edupress.thimpress.com/course-category/${category.slug}`} className="hover:text-orange-500">
                  {category.name}
                </a>
              </h4>
              <span className="text-gray-600">{category.courses} Khóa học</span>
            </div>
          ))}
        </div>
      </div>
      {/* End Section 2 */}

      {/* Section 3 */}
      <div className="container mx-auto px-4">
        {/* Box-head */}
        <div className="mb-7 flex items-end justify-between">
          <div>
            <div className="font-medium text-[16px] text-black mb-1 md:text-[14px]">Khóa học nổi bật</div>
            <h2 className="font-bold text-[24px] text-[#33333] capitalize m-0 md:text-[20px]">Khám phá các khóa học phổ biến</h2>
          </div>
          <button className="inline-flex items-center h-[44px] px-7 text-[#333333] font-medium text-[16px] bg-transparent rounded-full border border-[1.5px] border-[#FF782D] transition hover:bg-[#FF782D] hover:text-white">
            Tất cả khóa học
            <i className="fa-solid fa-angle-right text-[18px] text-[#333333] ml-[11px] transition group-hover:text-white"></i>
          </button>
        </div>

        <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6">
          {/* Courses Section */}
          {courses.map((course) => (
            <div key={course.id} className="max-w-sm rounded-[20px] overflow-hidden shadow-lg border border-[#EAEAEA] bg-white">
              <img src={course.image} alt={course.title} className="mb-4 w-full h-48 object-cover" />
              <div className="p-5 mt-[-10px]">
                <h2 className="text-[#333333] text-xl font-bold mb-2">{course.title}</h2>
                <p className="text-sm text-gray-500 mb-4">
                  bởi <span className="text-black">{course.instructor}</span> trong <span className="text-[#ff782d]">{course.category}</span>
                </p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <div className="flex items-center mr-4">
                    <svg className="w-5 h-5 text-[#ff782d] mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 4h16v2H4zM4 11h16v2H4zM4 18h16v2H4z"></path>
                    </svg>
                    <span>{course.lessons} Bài học</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-[#ff782d] mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                    </svg>
                    <span>{course.students} Học viên</span>
                  </div>
                </div>
                <p className="text-green-500 font-bold mb-4">{course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()} VNĐ`}</p>
                <button className="w-full py-2 bg-[#ff782d] text-white rounded-full hover:bg-[#e66c27] transition duration-300">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
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
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="border border-gray-400 rounded-[20px] p-[24px] sm:py-[28px] sm:px-[32px]"
              >
                {/* Hiển thị số sao */}
                <div className="text-[#FFC633] flex sm:text-[20px] text-[16px] mb-[12px] sm:mb-[15px]">
                  {Array(feedback.rating)
                    .fill()
                    .map((_, index) => (
                      <FaStar key={index} className="text-[#FFC633]" />
                    ))}
                </div>

                {/* Hiển thị tên khách hàng */}
                <div className="flex items-center sm:mb-[12px] mb-[8px]">
                  <span className="font-bold text-[#FF7D28] sm:text-[20px] text-[16px]">
                    {feedback.name}
                  </span>
                  <FaCheckCircle className="text-[#01AB31] sm:text-[18px] text-[14px] ml-[6px]" />
                </div>

                {/* Nội dung đánh giá */}
                <p className="text-gray-600 sm:text-[16px] text-[14px]">
                  "{feedback.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* End Section 5 */}
    </>
  );
}
