'use client';

import { useRouter } from 'next/router';
import { mockCourses } from '@/data/mockCourses';
import CourseItem from '@/app/components/courseitem/courseItem';
import BreadcrumbContainer from '@/app/components/breadcrumb/BreadcrumbContainer';
import { BookOpen, Clock, Users, Star, CheckCircle } from 'lucide-react';

export default function DetailCoursePage() {
    // const router = useRouter();
    // const { id } = router.query;
  
    const course = mockCourses.find((course) => course._id === '1');
  
    if (!course) return <div>Course not found</div>;
  
    return (
      <div className="min-h-screen bg-gray-50">
        <BreadcrumbContainer />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CourseItem course={course} />
          
          {/* Course Information Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Course Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Mô tả khóa học</h2>
                <p className="text-gray-600">{course.description}</p>
              </div>

              {/* Course Curriculum */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Nội dung khóa học</h2>
                <div className="space-y-4">
                  {course.lessons.map((lesson, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <BookOpen className="text-orange-500 mr-4" />
                      <div>
                        <h3 className="font-semibold">{lesson.title}</h3>
                        <p className="text-sm text-gray-600">{lesson.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Features */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Thông tin khóa học</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Clock className="text-orange-500 mr-3" />
                    <span>Thời lượng: {course.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="text-orange-500 mr-3" />
                    <span>{course.studentsEnrolled.length} học viên</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="text-orange-500 mr-3" />
                    <span>Đánh giá: {course.rating}/5</span>
                  </div>
                </div>
              </div>

              {/* Course Requirements */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold mb-4">Yêu cầu</h3>
                <ul className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="text-green-500 mr-2" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }