"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { Plus, Search, BookOpen, Users, Clock, Star, GraduationCap } from 'lucide-react';
import { Course } from '@/app/types';
import Image from 'next/image';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // Mock user ID cho giáo viên - trong ứng dụng thực sẽ lấy từ authentication
  const teacherId = 'teacher1';

  useEffect(() => {
    fetchCourses();
  }, [teacherId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Trong thực tế, sẽ có API riêng cho việc lấy khóa học của giáo viên
      const data = await courseService.getCourses(1, 100);
      
      // Lọc lại chỉ lấy khóa học của giáo viên hiện tại
      const teacherCourses = data.courses.filter(
        course => typeof course.teacherId === 'object' && course.teacherId._id === teacherId
      );
      
      setCourses(teacherCourses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter courses based on search query and filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && course.isPublished === true;
    if (filter === 'inactive') return matchesSearch && course.isPublished === false;
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
              href={`/teacher/courses/${course._id}`}
              key={course._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer group relative"
            >
              {/* Course-specific management buttons that appear on hover */}
              {/* <div className="absolute top-48 right-0 left-0 bg-gradient-to-t from-indigo-700 to-indigo-600 p-2 flex justify-center gap-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 opacity-90">
                <Link 
                  href={`/teacher/courses/${course._id}/edit`}
                  className="px-3 py-1 bg-white text-indigo-700 text-xs font-medium rounded hover:bg-gray-100 transition-colors flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  Chỉnh sửa
                </Link>
                <Link 
                  href={`/teacher/courses/${course._id}/lessons`}
                  className="px-3 py-1 bg-white text-indigo-700 text-xs font-medium rounded hover:bg-gray-100 transition-colors flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  Bài học
                </Link>
                <Link 
                  href={`/teacher/courses/${course._id}/students`}
                  className="px-3 py-1 bg-white text-indigo-700 text-xs font-medium rounded hover:bg-gray-100 transition-colors flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  Học viên
                </Link>
              </div> */}
              
              <div className="relative h-48">
                <Image 
                  src={course.thumbnail || 'https://via.placeholder.com/400x200?text=No+Thumbnail'} 
                  alt={course.title}
                  fill
                  unoptimized
                  className="object-cover transition-transform group-hover:scale-105 duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className={`${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} text-xs font-medium px-2.5 py-1 rounded-full`}>
                    {course.isPublished ? 'Đang hoạt động' : 'Vô hiệu hóa'}
                  </span>
                </div>
                {course.isPopular && (
                  <div className="absolute top-3 left-[130px]">
                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center">
                      <Star className="w-3 h-3 mr-1" /> Nổi bật
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-5 flex-grow">
                <h2 className="text-xl font-semibold mb-2 text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{course.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-2 mb-5">{course.description}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-500" />
                    <span>{course.lessons.length} bài học</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-500" />
                    <span>{course.registrations || course.studentsEnrolled.length} học viên</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2 flex-shrink-0 text-indigo-500" />
                    <span>{course.totalDuration || 0} phút</span>
                  </div>
                  <div className="flex items-center font-medium text-indigo-700">
                    <span>${course.price}</span>
                  </div>
                </div>
              </div>
              
              {/* <div className="absolute inset-0 bg-indigo-600 bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center transition-all duration-300">
                <span className="text-transparent group-hover:text-indigo-600 font-medium bg-white px-4 py-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300">
                  Xem chi tiết
                </span>
              </div> */}
              
              <div className="px-5 py-4 bg-gray-50 border-t flex justify-between items-center">
                {/* <Link 
                  href={`/teacher/courses/${course._id}/lessons`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Quản lý bài học
                </Link> */}
                <Link 
                  href={`/teacher/courses/${course._id}/students`}
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