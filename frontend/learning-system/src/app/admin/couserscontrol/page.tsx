"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, Plus, Search, BookOpen, Users, Star, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Course } from '@/app/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check authentication and fetch courses
  useEffect(() => {
    const checkAuthAndFetchCourses = async () => {
      try {
        setLoading(true);
        console.log("Checking authentication...");
        
        // Check authentication using the endpoint from screenshot
        const authResponse = await fetch(`${API_BASE_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!authResponse.ok) {
          throw new Error('Bạn cần đăng nhập để tiếp tục');
        }
        
        const authData = await authResponse.json();
        const userData = authData.data;
        
        // Verify admin role
        if (userData.role !== 'ROLE_ADMIN') {
          toast.error('Bạn không có quyền truy cập trang này');
          router.push('/login?redirect=/admin/couserscontrol');
          return;
        }
        
        console.log("Authenticated admin:", userData);
        
        // Fetch all courses
        const coursesResponse = await fetch(`${API_BASE_URL}/course/all`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!coursesResponse.ok) {
          throw new Error('Không thể tải danh sách khóa học');
        }
        
        const coursesData = await coursesResponse.json();
        console.log("Courses data:", coursesData);
        
        // Parse courses based on API response structure
        let parsedCourses: Course[] = [];
        
        if (coursesData.body && Array.isArray(coursesData.body)) {
          // Handle nested response structure
          parsedCourses = coursesData.body;
        } else if (Array.isArray(coursesData)) {
          // Handle direct array response
          parsedCourses = coursesData;
        } else {
          console.error("Unexpected courses data format:", coursesData);
        }
        
        setCourses(parsedCourses);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'Có lỗi xảy ra');
        
        if (error instanceof Error && error.message.includes('đăng nhập')) {
          router.push('/login?redirect=/admin/couserscontrol');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchCourses();
  }, [router]);

  // Delete course handler
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      // Delete course using direct API call
      const response = await fetch(`${API_BASE_URL}/course/delete/${courseToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể xóa khóa học');
      }
      
      // Update UI after successful deletion
      setCourses(prevCourses => prevCourses.filter(course => course._id !== courseToDelete._id));
      setShowDeleteModal(false);
      setCourseToDelete(null);
      toast.success('Khóa học đã được xóa thành công');
    } catch (error) {
      console.error('Failed to delete course:', error);
      setDeleteError('Không thể xóa khóa học. Vui lòng thử lại sau.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Confirm delete handler
  const confirmDelete = (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  // Filter courses based on search query and filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && (course.isPublished === true || course.courseStatus === 'ACTIVE');
    if (filter === 'inactive') return matchesSearch && (course.isPublished === false || course.courseStatus === 'INACTIVE');
    if (filter === 'popular') return matchesSearch && course.isPopular === true;
    return matchesSearch;
  });

  // Display error message if authentication or fetching failed
  if (error && !loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => router.push('/login')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Đăng nhập lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý khóa học</h1>
        <Link 
          href="/admin/couserscontrol/create" 
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tạo khóa học mới
        </Link>
      </div>
      
      {/* Filters */}
      <div className="bg-white shadow-md rounded-xl p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          </div>
          
          <select 
            className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[180px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả khóa học</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Vô hiệu hóa</option>
            <option value="popular">Khóa học nổi bật</option>
          </select>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khóa học
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giảng viên
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Học viên
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              Array(3).fill(0).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 bg-gray-200 rounded-md animate-pulse"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center">
                  <div className="flex flex-col items-center">
                    <Search className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-1">Không tìm thấy khóa học nào</p>
                    <p className="text-gray-500 mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    <Link 
                      href="/admin/couserscontrol/create" 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo khóa học mới
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50">
                  <td className="px-6 py-5">
                    <div className="flex items-center">
                      <div className="h-14 w-14 flex-shrink-0 rounded-md overflow-hidden relative">
                        <Image
                          src={course.thumbnail || 'https://via.placeholder.com/56?text=No+Image'}
                          alt={course.title}
                          width={56}
                          height={56}
                          unoptimized
                          className="object-cover"
                        />
                        {course.isPopular && (
                          <div className="absolute top-0 left-0 bg-amber-500 p-0.5 rounded-br-md">
                            <Star className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{course.title}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center flex-wrap gap-2">
                          <div className="flex items-center">
                            <BookOpen className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            <span>{course.lessons?.length || 0} bài học</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center">
                            <span>{course.totalDuration || course.totalTimeLimit || 0} phút</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mr-2 text-xs font-medium">
                        {typeof course.teacherId === 'object' 
                          ? `${course.teacherId.firstName?.charAt(0) || ''}${course.teacherId.lastName?.charAt(0) || ''}`
                          : course.teacherFullName?.charAt(0) || 'N/A'}
                      </div>
                      <div>
                        <div className="text-sm text-gray-900">
                          {typeof course.teacherId === 'object' 
                            ? `${course.teacherId.firstName || ''} ${course.teacherId.lastName || ''}`
                            : course.teacherFullName || course.teacherName || 'Không có giảng viên'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${course.price}</div>
                    {course.price === 0 && <div className="text-xs text-green-600">Miễn phí</div>}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {course.isPublished || course.courseStatus === 'ACTIVE' ? (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" /> Đang hoạt động
                      </span>
                    ) : (
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-800">
                        <XCircle className="w-4 h-4 mr-1" /> Vô hiệu hóa
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      <span>{course.studentsCount || course.registrations || course.studentsEnrolled?.length || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/couserscontrol/${course.id}`} 
                        className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link 
                        href={`/admin/couserscontrol/${course.id}/edit`} 
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button 
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => confirmDelete(course)}
                        title="Xóa khóa học"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 w-6 h-6 mr-3" />
              <h3 className="text-xl font-medium text-gray-800">Xác nhận xóa khóa học</h3>
            </div>
            
            {deleteError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{deleteError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <p className="mb-6 text-gray-600">
              Bạn có chắc chắn muốn xóa khóa học <span className="font-semibold text-gray-800">{courseToDelete.title}</span>? 
              <br /><br />
              Tất cả bài học, bài kiểm tra và dữ liệu liên quan sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                disabled={deleteLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteCourse}
                className="bg-red-600 text-white px-5 py-2.5 rounded-lg flex items-center hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5 mr-2" />
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