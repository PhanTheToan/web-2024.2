import { Star, CheckCircle } from "lucide-react";
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
  // Determine the first lesson ID to link to
  const firstLessonId = course.lessons[0]?._id;

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
            <p className="text-black mt-2">Giảng viên: <span className="text-orange-950 font-semibold cursor:pointer hover:text-orange-500 cursor: pointer">{course.teacherId.firstName} {course.teacherId.lastName}</span></p>
            
            {firstLessonId ? (
              <Link 
                href={`/courses/${course._id}/lesson/${firstLessonId}`}
                className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition w-full md:w-auto inline-block text-center"
              >
                Bắt đầu học
              </Link>
            ) : (
              <button className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition w-full md:w-auto">
                Đăng ký
              </button>
            )}
            
            <p className="mt-2 text-gray-700">{course.studentsEnrolled.length} đã đăng ký</p>
        </div>
      </div>
     
      
      <Card className="relative z-10 mt-6 bg-white bg-opacity-90 w-3/4">
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center md:text-left">
          <div>
            {/* <CheckCircle className="text-blue-500" /> */}
            <p className="font-bold ">{course.lessons.length} bài học</p>
            <p className="text-gray-600 text-sm">Học tập hấp dẫn và thú vị</p>
          </div>
          <div>
            <h3 className="font-semibold">Danh mục</h3>
            <p className="text-gray-600 text-sm">{course.categories.join(", ")}</p>
          </div>
          <div>
            <h3 className="font-semibold">Giá</h3>
            <p className="text-gray-600 text-sm">${course.price}</p>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-2">
            <CheckCircle className="text-orange-500" />
            <p className="font-semibold">{Math.floor(Math.random() * 100)}% hài lòng</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
