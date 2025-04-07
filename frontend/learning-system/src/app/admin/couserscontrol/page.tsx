"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { Edit, Trash, Eye, Plus, Search } from 'lucide-react';
import { Course } from '@/app/types';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourses(1, 100);
        setCourses(data.courses);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Filter courses based on search query and filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'active') return matchesSearch && course.studentsEnrolled.length > 0;
    if (filter === 'inactive') return matchesSearch && course.studentsEnrolled.length === 0;
    return matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quản lý khóa học</h1>
      
      <div className="flex justify-between items-center mb-4 gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        
        <select 
          className="px-3 py-2 border rounded-md min-w-[180px]"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Tất cả khóa học</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã vô hiệu hóa</option>
        </select>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Khóa học
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giảng viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Học viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  <div className="animate-pulse flex justify-center">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </td>
              </tr>
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Không tìm thấy khóa học nào
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr key={course._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={course.thumbnail || 'https://via.placeholder.com/40'}
                          alt={course.title}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        <div className="text-sm text-gray-500">
                          {course.lessons?.length || 0} bài học • {course.duration || '30 phút'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {typeof course.teacherId === 'object' 
                        ? `${course.teacherId.firstName} ${course.teacherId.lastName}`
                        : 'Không có giảng viên'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${course.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {course.studentsEnrolled?.length || 0} học viên
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <Link href={`/admin/couserscontrol/${course._id}`} className="text-indigo-600 hover:text-indigo-900">
                        <Eye className="w-5 h-5" />
                      </Link>
                      <Link href={`/admin/couserscontrol/${course._id}/edit`} className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-5 h-5" />
                      </Link>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-center">
        <Link 
          href="/admin/couserscontrol/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo khóa học mới
        </Link>
      </div>
    </div>
  );
}