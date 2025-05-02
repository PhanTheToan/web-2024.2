"use client";

import { useEffect, useState } from "react";
import { courseService } from "@/services/courseService";
import { ArrowUp, BookText, CheckCircle, Clock, Users } from "lucide-react";
import Link from "next/link";
import { Course } from "@/app/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Extend courseService type to include getTeacherCourses
interface ExtendedCourseService {
  getTeacherCourses: () => Promise<Course[]>;
}

const extendedCourseService = courseService as typeof courseService & ExtendedCourseService;

// Add method if it doesn't exist
if (!extendedCourseService.getTeacherCourses) {
  extendedCourseService.getTeacherCourses = async () => {
    const response = await courseService.getCourses(1, 100);
    return response.courses.map(course => ({
      ...course,
      studentsEnrolled: Array.isArray(course.studentsEnrolled)
        ? course.studentsEnrolled.filter((item): item is string => typeof item === 'string')
        : []
    })) as Course[];
  };
}

// Mock enrollment service methods
const enrollmentStats = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCourseCompletionStats: async (_courseId: string) => {
    // Mock implementation - would be replaced with actual API call
    const completed = Math.floor(Math.random() * 30);
    const total = completed + Math.floor(Math.random() * 20);
    return {
      completed,
      total
    };
  }
};

export default function TeacherReportsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    studentsByMonth: [] as { name: string, students: number }[],
    courseCompletionData: [] as { name: string, completed: number, inProgress: number }[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch courses taught by the current teacher
        const teacherCourses = await extendedCourseService.getTeacherCourses();
        setCourses(teacherCourses);
        
        // Calculate stats
        const totalStudents = teacherCourses.reduce((acc: number, course: Course) => 
          acc + (course.studentsEnrolled?.length || 0), 0);
        
        // Get completion data for the teacher's courses
        const completionData = [];
        let totalCompleted = 0;
        let totalEnrollments = 0;
        
        for (const course of teacherCourses) {
          const courseStats = await enrollmentStats.getCourseCompletionStats(course._id);
          totalCompleted += courseStats.completed;
          totalEnrollments += courseStats.total;
          
          completionData.push({
            name: course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title,
            completed: courseStats.completed,
            inProgress: courseStats.total - courseStats.completed
          });
        }
        
        // Mock data for student signups by month
        const studentsByMonth = [
          { name: 'Jan', students: 12 },
          { name: 'Feb', students: 19 },
          { name: 'Mar', students: 25 },
          { name: 'Apr', students: 30 },
          { name: 'May', students: 28 },
          { name: 'Jun', students: 32 }
        ];

        setStats({
          totalStudents,
          totalCourses: teacherCourses.length,
          completionRate: totalEnrollments ? Math.round((totalCompleted / totalEnrollments) * 100) : 0,
          averageCompletionTime: 28, // Average days to complete (mocked)
          studentsByMonth,
          courseCompletionData: completionData
        });
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full"></div>
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
      <h1 className="text-2xl font-bold mb-6">Thống kê & Báo cáo</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <Users size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Tổng số học sinh</p>
              <p className="text-2xl font-bold">{stats.totalStudents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <BookText size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Số khóa học</p>
              <p className="text-2xl font-bold">{stats.totalCourses}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              <CheckCircle size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Tỷ lệ hoàn thành</p>
              <p className="text-2xl font-bold">{stats.completionRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-500">
              <Clock size={24} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 font-medium">Thời gian hoàn thành TB</p>
              <p className="text-2xl font-bold">{stats.averageCompletionTime} ngày</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* New Students Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Học sinh đăng ký mới</h2>
            <div className="text-green-500 flex items-center text-sm font-medium">
              <ArrowUp size={16} className="mr-1" />
              <span>+12% so với tháng trước</span>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.studentsByMonth}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="students" fill="#8884d8" name="Học sinh mới" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Course Completion Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Tỷ lệ hoàn thành khóa học</h2>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={stats.courseCompletionData}
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" stackId="a" fill="#00C49F" name="Đã hoàn thành" />
                <Bar dataKey="inProgress" stackId="a" fill="#FFBB28" name="Đang học" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Courses */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4">Khóa học gần đây</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên khóa học
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học sinh đăng ký
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tỷ lệ hoàn thành
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courses.slice(0, 5).map((course) => {
                const completionData = stats.courseCompletionData.find(c => 
                  c.name === (course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title)
                );
                
                const totalStudents = (completionData?.completed || 0) + (completionData?.inProgress || 0);
                const completionRate = totalStudents ? Math.round((completionData?.completed || 0) / totalStudents * 100) : 0;
                
                return (
                  <tr key={course._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{course.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{course.studentsEnrolled?.length || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-2">{completionRate}%</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${completionRate}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link href={`/teacher/courses/${course._id}`} className="text-primary-600 hover:text-primary-900">
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}