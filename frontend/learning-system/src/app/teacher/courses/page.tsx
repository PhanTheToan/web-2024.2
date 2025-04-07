"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { Edit, Eye, Plus, Search, BookOpen, Users, Clock, Trash2, AlertTriangle } from 'lucide-react';
import { Course } from '@/app/types';
import Image from 'next/image';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  // Confirm delete handler
  const confirmDelete = (course: Course) => {
    setCourseToDelete(course);
    setDeleteModalOpen(true);
  };

  // Delete course handler
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      await courseService.deleteCourse(courseToDelete._id);
      setCourses(prevCourses => prevCourses.filter(course => course._id !== courseToDelete._id));
      setDeleteModalOpen(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error('Failed to delete course:', error);
      setDeleteError('Không thể xóa khóa học. Vui lòng thử lại sau.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter courses based on search query and filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && course.studentsEnrolled.length > 0;
    if (filter === 'draft') return matchesSearch && course.studentsEnrolled.length === 0;
    return matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Khóa học của tôi</h1>
        <Link 
          href="/teacher/courses/create" 
          className="bg-emerald-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo khóa học mới
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          
          <select 
            className="px-3 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả khóa học</option>
            <option value="active">Đang hoạt động</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
      </div>
      
      {/* Course cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 mb-4">Không tìm thấy khóa học nào</div>
          <Link 
            href="/teacher/courses/create" 
            className="bg-emerald-600 text-white px-4 py-2 rounded-md inline-flex items-center hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo khóa học mới
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-40">
                <Image 
                  src={course.thumbnail || 'https://via.placeholder.com/400x200?text=No+Thumbnail'} 
                  alt={course.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Link 
                    href={`/teacher/courses/${course._id}`}
                    className="p-1.5 bg-white rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link 
                    href={`/teacher/courses/${course._id}/edit`}
                    className="p-1.5 bg-white rounded-full text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      confirmDelete(course);
                    }}
                    className="p-1.5 bg-white rounded-full text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-1">{course.title}</h2>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4">{course.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <div className="flex items-center mr-4">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {course.lessons.length} bài học
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration || '30 phút'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {course.studentsEnrolled.length} học viên
                    </span>
                  </div>
                  <div className="text-indigo-600 font-semibold">${course.price}</div>
                </div>
              </div>
              
              <div className="px-4 py-3 bg-gray-50 border-t flex justify-between">
                <Link 
                  href={`/teacher/courses/${course._id}/lessons`}
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Quản lý bài học
                </Link>
                <Link 
                  href={`/teacher/courses/${course._id}/students`}
                  className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Học viên
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 w-6 h-6 mr-2" />
              <h3 className="text-lg font-medium">Xác nhận xóa khóa học</h3>
            </div>
            
            {deleteError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{deleteError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <p className="mb-4">
              Bạn có chắc chắn muốn xóa khóa học <span className="font-semibold">{courseToDelete.title}</span>? 
              Tất cả bài học, bài kiểm tra và dữ liệu liên quan sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={deleteLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteCourse}
                className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa khóa học
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}