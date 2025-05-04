import {  CheckCircle } from "lucide-react";
import { Course } from "@/app/types";
import Link from "next/link";

interface CourseItemProps {
    course: Course;
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-lg shadow-md mx-auto p-4 ${className}`}>{children}</div>;
}

function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-2 ${className}`}>{children}</div>;
}

export default function CourseItem({ course }: CourseItemProps) {
  // Add safety checks for all potentially undefined properties
  // Helper function to get first lesson ID safely
  const getFirstLessonId = () => {
    if (!course.lessons || !Array.isArray(course.lessons) || course.lessons.length === 0) {
      return null;
    }
    
    const firstLesson = course.lessons[0];
    return typeof firstLesson === 'string' ? firstLesson : firstLesson._id;
  };
  
  // Helper function to get teacher name safely
  const getTeacherName = () => {
    if (!course.teacherId) {
      return course.teacherName || course.teacherFullName || "Unknown Teacher";
    }
    
    if (typeof course.teacherId === 'string') {
      return course.teacherName || course.teacherFullName || course.teacherId;
    }
    
    return `${course.teacherId.firstName || ''} ${course.teacherId.lastName || ''}`.trim() || "Unknown Teacher";
  };
  
  // Helper function to get lessons count safely
  const getLessonsCount = () => {
    if (!course.lessons) {
      return course.contentCount || 0;
    }
    
    return Array.isArray(course.lessons) ? course.lessons.length : 0;
  };
  
  // Helper function to get students count safely
  const getStudentsCount = () => {
    if (course.studentsCount !== undefined) {
      return course.studentsCount;
    }
    
    if (!course.studentsEnrolled) {
      return 0;
    }
    
    return Array.isArray(course.studentsEnrolled) ? course.studentsEnrolled.length : 0;
  };
  
  // Use courseId from either _id or id property
  const courseId = course._id || course.id;
  
  // Safely get first lesson ID
  const firstLessonId = getFirstLessonId();

  return (
    <div 
      className="w-full p-6 bg-gray-100 rounded-lg  relative overflow-hidden md:flex md:flex-col shadow-lg"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center w-full h-96 md:h-[500px]" 
        style={{ backgroundImage: `url(${course.thumbnail})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', zIndex: 0 }}
      ></div>
      <div className="flex w-full md:w-1/3">
        <div className="relative z-10 bg-white bg-opacity-40 p-6 md:p-8 rounded-lg text-center md:text-left  mx-auto">
            <h1 className="text-2xl md:text-4xl font-bold text-black">{course.title}</h1>
            <p className="text-black mt-2">Giảng viên: <span className="text-orange-500 font-semibold text-lg cursor:pointer hover:text-orange-500 cursor: pointer">{getTeacherName()}</span></p>
            
            {firstLessonId ? (
              <Link 
                href={`/courses/${courseId}/lesson/${firstLessonId}`}
                className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition w-full md:w-auto inline-block text-center"
              >
                Bắt đầu học
              </Link>
            ) : (
              <div></div>
              // <button >
              //   {/* Hãy tham gia ngay lớp học */}
              // </button>
            )}
            
            <p className="mt-2 text-gray-700">{getStudentsCount()} học viên đã đăng ký</p>
        </div>
      </div>
     
      
      <Card className="relative z-10 mt-6 bg-white bg-opacity-90 w-3/4">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left">
          <div>
            {/* <CheckCircle className="text-blue-500" /> */}
            <p className="font-bold ">{getLessonsCount()} bài học</p>
            <p className="text-gray-600 text-sm">Học tập hấp dẫn và thú vị</p>
          </div>
          <div>
            <h3 className="font-semibold">Danh mục</h3>
            <p className="text-gray-600 text-sm">{course.categories && Array.isArray(course.categories) ? course.categories.join(", ") : "Uncategorized"}</p>
          </div>
          <div>
            <h3 className="font-semibold">Giá</h3>
            <p className="text-gray-600 text-sm">{course.price || 0}VNĐ</p>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <CheckCircle className="text-orange-500" />
            <p className="font-semibold">Cam kết chất lượng</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
