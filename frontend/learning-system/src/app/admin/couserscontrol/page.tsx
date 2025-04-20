"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, Plus, Search, BookOpen, Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Course } from '@/app/types';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Pagination from '@/app/components/pagination/Pagination';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

export default function AdminCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
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

        // Check authentication
        const authResponse = await fetch(`${API_BASE_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
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

        // Fetch courses with filters
        await fetchCourses();
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
  }, [router, currentPage, searchQuery, filter]);

  // Fetch courses
  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
      });

      if (searchQuery) {
        params.set('query', searchQuery);
      }

      if (filter === 'active') {
        params.set('status', 'ACTIVE');
      } else if (filter === 'inactive') {
        params.set('status', 'INACTIVE');
      }

      const response = await fetch(`${API_BASE_URL}/course/search-course-admin?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách khóa học');
      }

      const data = await response.json();
      const formattedCourses: Course[] = data.content.map((course: {
        id: string;
        title: string;
        teacherFullName: string;
        teacherId: string;
        thumbnail: string;
        courseStatus: string;
        price: number;
        studentsCount: number;
        contentCount: number;
        totalTimeLimit: number;
        categories: string[];
        lessons?: Array<{
          _id?: string;
          lessonId?: string;
          title?: string;
          description?: string;
          order?: number;
        }>;
      }) => ({
        _id: course.id,
        id: course.id,
        title: course.title,
        teacherFullName: course.teacherFullName,
        teacherId: course.teacherId,
        thumbnail: course.thumbnail,
        courseStatus: course.courseStatus,
        price: course.price,
        studentsCount: course.studentsCount,
        contentCount: course.contentCount,
        totalTimeLimit: course.totalTimeLimit,
        categories: course.categories,
        isPublished: course.courseStatus === 'ACTIVE',
        lessons: course.lessons || [],
        totalDuration: course.totalTimeLimit || 0,
      }));

      setCourses(formattedCourses);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setError('Không thể tải danh sách khóa học. Vui lòng thử lại sau.');
    }
  };

  // Delete course handler
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/course/delete/${courseToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể xóa khóa học');
      }

      setCourses((prevCourses) => prevCourses.filter((course) => course._id !== courseToDelete._id));
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

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page - 1); // API dùng index từ 0
  };

  // Display error message if authentication or fetching failed
  if (error && !loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Đăng nhập lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Quản lý khóa học</h1>
        <Link
          href="/admin/couserscontrol/create"
          className="bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Tạo khóa học mới
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm sm:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2" />
          </div>

          <select
            className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[140px] sm:min-w-[180px] text-sm sm:text-base"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tất cả khóa học</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Vô hiệu hóa</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khóa học
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giảng viên
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Học viên
              </th>
              <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              Array(3).fill(0).map((_, index) => (
                <tr key={index}>
                  <td className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 bg-gray-200 rounded-md animate-pulse"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                    <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded-full w-24 animate-pulse"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-md animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 sm:px-6 py-8 sm:py-10 text-center">
                  <div className="flex flex-col items-center">
                    <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mb-4" />
                    <p className="text-base sm:text-lg font-medium text-gray-700 mb-1">Không tìm thấy khóa học nào</p>
                    <p className="text-gray-500 mb-4 text-sm sm:text-base">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    <Link
                      href="/admin/couserscontrol/create"
                      className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg inline-flex items-center hover:bg-blue-700 transition-colors shadow-sm text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Tạo khóa học mới
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 sm:py-5">
                    <div className="flex items-center">
                      <div className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0 rounded-md overflow-hidden relative">
                        <Image
                          src={course.thumbnail || 'https://via.placeholder.com/56?text=No+Image'}
                          alt={course.title}
                          width={56}
                          height={56}
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{course.title}</div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center flex-wrap gap-2">
                          <div className="flex items-center">
                            <BookOpen className="w-3.5 h-3.5 mr-1 text-gray-400" />
                            <span>{course.contentCount || 0} bài học</span>
                          </div>
                          <span className="text-gray-300">•</span>
                          <div className="flex items-center">
                            <span>{course.totalTimeLimit || 0} phút</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mr-2 text-xs font-medium">
                        {course.teacherFullName?.charAt(0) || 'N/A'}
                      </div>
                      <div>
                        <div className="text-sm text-gray-900">{course.teacherFullName || 'Không có giảng viên'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{course.price}đ</div>
                    {course.price === 0 && <div className="text-xs text-green-600">Miễn phí</div>}
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                    {course.courseStatus === 'ACTIVE' ? (
                      <span className="px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="w-4 h-4 mr-1" /> Đang hoạt động
                      </span>
                    ) : (
                      <span className="px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-gray-100 text-gray-800">
                        <XCircle className="w-4 h-4 mr-1" /> Vô hiệu hóa
                      </span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users className="w-4 h-4 mr-2 text-blue-500" />
                      <span>{course.studentsCount || 0}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 sm:py-5 whitespace-nowrap">
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

      {/* Pagination */}
      {!loading && courses.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <Pagination
            currentPage={currentPage + 1} // Hiển thị trang từ 1
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && courseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-800">Xác nhận xóa khóa học</h3>
            </div>

            {deleteError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{deleteError}</p>
                  </div>
                </div>
              </div>
            )}

            <p className="mb-4 sm:mb-6 text-gray-600 text-sm sm:text-base">
              Bạn có chắc chắn muốn xóa khóa học <span className="font-semibold text-gray-800">{courseToDelete.title}</span>? 
              <br /><br />
              Tất cả bài học, bài kiểm tra và dữ liệu liên quan sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 sm:px-5 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm sm:text-base"
                disabled={deleteLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteCourse}
                className="bg-red-600 text-white px-3 sm:px-5 py-2 rounded-lg flex items-center hover:bg-red-700 transition-colors disabled:opacity-50 shadow-sm text-sm sm:text-base"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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