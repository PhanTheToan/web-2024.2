"use client";

import { useEffect, useState } from "react";
import { courseService } from "@/services/courseService";
import { Search, UserCheck, UserPlus, Users } from "lucide-react";
import { Course, User } from "@/app/types";

// Extended user interface for local use with guaranteed name and email properties
interface ExtendedUser extends User {
  name: string;
  email: string;
}

export default function TeacherStudentsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentCourse, setCurrentCourse] = useState<string>("all");
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // In a real application, this would fetch courses taught by the current teacher
        const teacherCoursesResponse = await courseService.getCourses(1, 100);
        const teacherCourses = teacherCoursesResponse.courses;
        setCourses(teacherCourses);
        
        // Get all students enrolled in teacher's courses
        const allStudents: ExtendedUser[] = [];
        const studentMap = new Map<string, ExtendedUser>();
        
        for (const course of teacherCourses) {
          if (course.studentsEnrolled && course.studentsEnrolled.length > 0) {
            for (const studentEntry of course.studentsEnrolled) {
              // Convert string or User to a proper User object
              const studentId = typeof studentEntry === 'string' ? studentEntry : studentEntry._id;
              
              // Ensure we don't add duplicate students and populate required fields
              if (!studentMap.has(studentId)) {
                // Convert to ExtendedUser with required fields
                const student = typeof studentEntry === 'string' 
                  ? { _id: studentEntry, email: 'email@example.com', name: 'Student' } 
                  : studentEntry;
                
                const extendedStudent: ExtendedUser = {
                  ...student as User,
                  name: (student as User).name || 
                        `${(student as User).firstName || ''} ${(student as User).lastName || ''}`.trim() || 
                        'Unnamed Student',
                  email: (student as User).email || 'email@example.com'
                };
                
                studentMap.set(studentId, extendedStudent);
                allStudents.push(extendedStudent);
              }
            }
          }
        }
        
        setStudents(allStudents);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải dữ liệu học sinh. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter students based on search query, course, and enrollment status
  const filteredStudents = students.filter(student => {
    // Filter by search query
    const matchesSearch = searchQuery === "" || 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by course
    const matchesCourse = currentCourse === "all" || 
      courses.some(course => 
        course._id === currentCourse && 
        course.studentsEnrolled?.some(s => {
          const studentId = typeof s === 'string' ? s : s._id;
          return studentId === student._id;
        })
      );
    
    // Filter by enrollment status (active/inactive)
    // In a real application, you would have an actual status field
    // For now, we'll just assume all students are active
    const matchesStatus = enrollmentStatus === "all" || enrollmentStatus === "active";
    
    return matchesSearch && matchesCourse && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-700">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý học sinh</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-500">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Tổng số học sinh</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-500">
              <UserCheck size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Học sinh hoàn thành</p>
              <p className="text-2xl font-bold">{Math.round(students.length * 0.6)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              <UserPlus size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Học sinh mới trong tháng</p>
              <p className="text-2xl font-bold">{Math.round(students.length * 0.2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <div className="md:flex justify-between gap-4">
          <div className="relative flex-1 mb-4 md:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Tìm kiếm theo tên, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Khóa học
              </label>
              <select
                id="course-filter"
                className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={currentCourse}
                onChange={(e) => setCurrentCourse(e.target.value)}
              >
                <option value="all">Tất cả khóa học</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                id="status-filter"
                className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={enrollmentStatus}
                onChange={(e) => setEnrollmentStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang học</option>
                <option value="inactive">Tạm dừng</option>
                <option value="completed">Đã hoàn thành</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học sinh
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày đăng ký
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khóa học
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tiến độ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  // Find enrollment details for this student
                  // In a real application, this would come from the API
                  const enrolledCourses = courses.filter(course => 
                    course.studentsEnrolled?.some(s => {
                      const sid = typeof s === 'string' ? s : s._id;
                      return sid === student._id;
                    })
                  );
                  
                  // For the purpose of this mock, generate random progress
                  const progress = Math.floor(Math.random() * 100);
                  const status = progress === 100 ? "Đã hoàn thành" : "Đang học";
                  const statusColor = progress === 100 ? "bg-emerald-100 text-emerald-800" : "bg-indigo-100 text-indigo-800";
                  
                  return (
                    <tr key={student._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date().toLocaleDateString('vi-VN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {enrolledCourses.length === 0 ? (
                            <span className="text-gray-400">Chưa đăng ký khóa học nào</span>
                          ) : enrolledCourses.length === 1 ? (
                            enrolledCourses[0].title
                          ) : (
                            `${enrolledCourses.length} khóa học`
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 mr-2">{progress}%</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Không tìm thấy học sinh nào phù hợp với điều kiện tìm kiếm
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}