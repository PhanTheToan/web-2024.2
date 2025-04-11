"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, BookOpen, Users, Clock, GraduationCap } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

// Định nghĩa interface cho Course
interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  courseStatus: string;
  contentCount: number;
  totalTimeLimit: number;
  studentsCount: number;
  teacherId: string;
  teacherFullName: string;
  categories: string[];
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user info
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        const response = await fetch(`${API_BASE_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Bạn cần đăng nhập để tiếp tục');
        }
        
        const data = await response.json();
        const userData = data.data;
        
        if (userData.role !== 'ROLE_TEACHER') {
          toast.error('Bạn không có quyền truy cập trang này');
          window.location.href = '/login?redirect=/teacher/courses';
          return;
        }
        
        console.log("Authenticated user:", userData);
        fetchCourses();
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Vui lòng đăng nhập để tiếp tục');
        window.location.href = '/login?redirect=/teacher/courses';
      }
    };
    
    checkAuth();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      console.log("Fetching teacher courses...");
      
      const response = await fetch(`${API_BASE_URL}/course/all-teacher`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách khóa học');
      }
      
      const responseData = await response.json();
      console.log("API response:", responseData);
      
      // Xử lý cấu trúc dữ liệu phức tạp
      let coursesData: Course[] = [];
      
      if (responseData && responseData.body && Array.isArray(responseData.body)) {
        // Trường hợp data nằm trong body
        coursesData = responseData.body;
      } else if (Array.isArray(responseData)) {
        // Trường hợp data trả về trực tiếp là mảng
        coursesData = responseData;
      } else {
        console.error("Unexpected data format:", responseData);
      }
      
      console.log("Processed courses data:", coursesData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
      toast.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search query and filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && course.courseStatus === 'ACTIVE';
    if (filter === 'inactive') return matchesSearch && course.courseStatus === 'INACTIVE';
    return matchesSearch;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Khóa học của tôi</h1>
        <div className="flex flex-wrap gap-2">
          <Link 
            href="/teacher/courses/create" 
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg flex items-center hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tạo khóa học mới
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          </div>
          
          <select 
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả khóa học</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Vô hiệu hóa</option>
          </select>
        </div>
      </div>
      
      {/* Course cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="mt-6 h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-10 text-center">
          <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Chưa có khóa học nào</h3>
          <p className="text-gray-500 mb-6">Bắt đầu bằng cách tạo khóa học đầu tiên của bạn</p>
          <Link 
            href="/teacher/courses/create" 
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg inline-flex items-center hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Tạo khóa học mới
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <Link
              href={`/teacher/courses/${course.id}`}
              key={course.id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer group relative h-full"
            >
              <div className="relative h-48">
                <Image 
                  src={course.thumbnail || 'https://via.placeholder.com/400x200?text=No+Thumbnail'} 
                  alt={course.title}
                  fill
                  unoptimized
                  className="object-cover transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className={`${course.courseStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} text-xs font-medium px-2.5 py-1 rounded-full`}>
                    {course.courseStatus === 'ACTIVE' ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                  </span>
                </div>
                {course.categories && course.categories.includes('POPULAR') && (
                  <div className="absolute top-3 right-3">
                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      Nổi bật
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-5 flex-grow">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{course.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-2 mb-5">{course.description || 'Không có mô tả'}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-500" />
                    <span>{course.contentCount || 0} bài học</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-500" />
                    <span>{course.studentsCount || 0} học viên</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-500" />
                    <span>{course.totalTimeLimit || 0} phút</span>
                  </div>
                  <div className="flex items-center font-medium text-indigo-700">
                    {course.price === 0 ? (
                      <span className="text-green-600">Miễn phí</span>
                    ) : (
                      <span>{course.price.toLocaleString()} đ</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-4 bg-gray-50 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  ID: {course.id}
                </span>
                <Link 
                  href={`/teacher/courses/${course.id}/students`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Học viên
                </Link>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}