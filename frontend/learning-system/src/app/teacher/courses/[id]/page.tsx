"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { 
  Edit, Eye, Plus, ArrowLeft, BookOpen, Users, 
  Calendar, Clock, Trash2, AlertTriangle, UserMinus, 
  UserPlus, DollarSign, Star, FileText, BarChart2, ArrowUpDown, MoveUp, MoveDown,
  Loader2, CheckCircle2
} from 'lucide-react';
import { Course, User } from '@/app/types';
import { lessonService } from '@/services/lessonService';
import { quizService } from '@/services/quizService';
import { toast } from 'react-hot-toast';
import { enrollmentService } from '@/services/enrollmentService';

// Define extended interfaces to manage types until the backend is complete
interface ExtendedUser extends Omit<User, 'createdAt' | 'updatedAt'> {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: 'TEACHER' | 'USER' | 'student';
  email: string;
  coursesEnrolled: string[];
  enrolledAt?: string;
  progress?: number;
  lastActive?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  phone?: string;
}

interface ExtendedCourse extends Omit<Course, 'quizzes' | 'studentsEnrolled'> {
  category?: { _id: string; name: string };
  quizzes?: QuizItem[] | string[];
  studentsEnrolled: Array<ExtendedUser | string>;
}

interface QuizItem {
  _id: string;
  title: string;
  questions: { _id: string; text: string; options: string[]; answer: string }[];
  passingScore?: number;
}

// Add a new interface for combined course content items
interface CourseContentItem {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  order?: number;
  type: 'lesson' | 'quiz';
  [key: string]: string | number | boolean | undefined; // More specific than 'any'
}

export default function TeacherCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  
  const [course, setCourse] = useState<ExtendedCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('lessons');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'lesson' | 'quiz'; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isReorderingContent, setIsReorderingContent] = useState(false);
  const [contentOrderSaving, setContentOrderSaving] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<{
    totalViews: number;
    completionRate: number;
    averageProgress: number;
    revenueGenerated: string;
  } | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);
  const [studentDeleteModalOpen, setStudentDeleteModalOpen] = useState(false);
  const [studentDeleteError, setStudentDeleteError] = useState<string | null>(null);
  const [studentDeleteLoading, setStudentDeleteLoading] = useState(false);
  const [enrollmentRequests, setEnrollmentRequests] = useState<{_id: string, name: string, email: string}[]>([]);
  const [enrollmentRequestsModalOpen, setEnrollmentRequestsModalOpen] = useState(false);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [studentSort, setStudentSort] = useState<'progress' | 'name' | 'date'>('progress');
  const [studentSortDirection, setStudentSortDirection] = useState<'asc' | 'desc'>('desc');
  const [courseContent, setCourseContent] = useState<CourseContentItem[]>([]);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const data = await courseService.getCourseById(courseId);
        setCourse(data as ExtendedCourse);
        
        // Add analytics data like in admin page
        setAnalyticsData({
          totalViews: Math.floor(Math.random() * 1000) + 100,
          completionRate: Math.floor(Math.random() * 60) + 20,
          averageProgress: Math.floor(Math.random() * 70) + 10,
          revenueGenerated: (data.price * data.studentsEnrolled.length).toFixed(2)
        });

        // Fetch enrollment requests (mock data for now)
        // In a real app, this would be an API call
        const mockRequests = [
          { _id: 'req1', name: 'Nguyễn Văn A', email: 'nguyenvana@example.com' },
          { _id: 'req2', name: 'Trần Thị B', email: 'tranthib@example.com' },
        ];
        setEnrollmentRequests(mockRequests);
      } catch (error) {
        console.error("Error fetching course:", error);
        setError("Không thể tải khóa học. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    } else {
      setError('ID khóa học không hợp lệ');
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    const loadCourseContent = async () => {
      if (activeTab === 'content' && courseId) {
        try {
          const content = await courseService.getCourseContent(courseId);
          // Cast each item to ensure it has all required properties
          const typedContent = content.map(item => {
            // Destructure to avoid duplicating and overwriting properties
            const { _id = '', courseId = '', title = '', description, order, type, ...rest } = item;
            return {
              _id,
              courseId,
              title,
              description,
              order,
              type: type as 'lesson' | 'quiz',
              ...rest // Include remaining properties
            };
          }) as CourseContentItem[];
          
          setCourseContent(typedContent);
        } catch (error) {
          console.error("Error loading course content:", error);
        }
      }
    };

    loadCourseContent();
  }, [activeTab, courseId]);

  const handleDelete = async () => {
    if (!itemToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      if (itemToDelete.type === 'lesson') {
        await lessonService.deleteLesson(courseId, itemToDelete.id);
        // Update the lessons array to remove the deleted lesson
        setCourse(prev => {
          if (!prev) return prev;
          
          // Create a new filtered lessons array
          const updatedLessons = Array.isArray(prev.lessons) 
            ? prev.lessons.filter(lesson => {
                const lessonId = typeof lesson === 'string' ? lesson : lesson._id;
                return lessonId !== itemToDelete.id;
              })
            : [];
            
          // Return a properly typed course object
          return {
            ...prev,
            lessons: updatedLessons
          } as ExtendedCourse;
        });
      } else {
        await quizService.deleteQuiz(courseId, itemToDelete.id);
        // Update the quizzes array to remove the deleted quiz
        setCourse(prev => {
          if (!prev) return prev;
          
          // Create a new filtered quizzes array
          const updatedQuizzes = Array.isArray(prev.quizzes) 
            ? prev.quizzes.filter(quiz => {
                const quizId = typeof quiz === 'string' ? quiz : quiz._id;
                return quizId !== itemToDelete.id;
              })
            : [];
            
          // Return a properly typed course object
          return {
            ...prev,
            quizzes: updatedQuizzes
          } as ExtendedCourse;
        });
      }
      
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error(`Error deleting ${itemToDelete.type}:`, err);
      setDeleteError(`Không thể xóa ${itemToDelete.type === 'lesson' ? 'bài học' : 'bài kiểm tra'}. Vui lòng thử lại sau.`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Function to open the delete modal
  const confirmDelete = (id: string, type: 'lesson' | 'quiz', title: string) => {
    setItemToDelete({ id, type, title });
    setDeleteModalOpen(true);
  };

  // Add function to handle student deletion
  const handleStudentDelete = async () => {
    if (!studentToDelete) return;

    setStudentDeleteLoading(true);
    setStudentDeleteError(null);

    try {
      // In a real app, call an API to remove the student
      // await courseService.removeStudentFromCourse(courseId, studentToDelete.id);
      
      // Update the course state to remove the student
      setCourse(prev => {
        if (!prev) return prev;

        const updatedStudents = Array.isArray(prev.studentsEnrolled)
          ? prev.studentsEnrolled.filter(student => {
              const studentId = typeof student === 'string' ? student : student._id;
              return studentId !== studentToDelete.id;
            })
          : [];

        return {
          ...prev,
          studentsEnrolled: updatedStudents
        } as ExtendedCourse;
      });

      setStudentDeleteModalOpen(false);
      setStudentToDelete(null);
    } catch (err) {
      console.error('Error removing student:', err);
      setStudentDeleteError('Không thể xóa học viên. Vui lòng thử lại sau.');
    } finally {
      setStudentDeleteLoading(false);
    }
  };

  // Add function to confirm student deletion
  const confirmStudentDelete = (studentId: string, studentName: string) => {
    setStudentToDelete({ id: studentId, name: studentName });
    setStudentDeleteModalOpen(true);
  };

  // Add function to handle enrollment approval/rejection
  const handleEnrollmentRequest = async (requestId: string, action: 'approve' | 'reject') => {
    setDeleteLoading(true);
    
    try {
      // In a real app, call an API to approve/reject the enrollment
      // await courseService.processEnrollmentRequest(courseId, requestId, isApproved);
      
      // Update local state to remove the processed request
      setEnrollmentRequests(prev => prev.filter(req => req._id !== requestId));
      
      // If approved, add the student to the course
      if (action === 'approve' && course) {
        const approvedStudent = enrollmentRequests.find(req => req._id === requestId);
        
        if (approvedStudent) {
          setCourse(prev => {
            if (!prev) return prev;
            
            // Create a new student object with all required fields
            const nameArray = approvedStudent.name.split(' ');
            const firstName = nameArray.pop() || '';
            const lastName = nameArray.join(' ') || '';
            
            const newStudent: ExtendedUser = {
              _id: approvedStudent._id,
              firstName: firstName,
              lastName: lastName,
              email: approvedStudent.email,
              username: approvedStudent.email,
              password: '',
              role: 'student',
              coursesEnrolled: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              enrolledAt: new Date().toISOString(),
              progress: 0,
              lastActive: new Date().toISOString()
            };
            
            // Add to students enrolled list
            const updatedStudents = Array.isArray(prev.studentsEnrolled) 
              ? [...prev.studentsEnrolled, newStudent]
              : [newStudent];
              
            return {
              ...prev,
              studentsEnrolled: updatedStudents
            } as ExtendedCourse;
          });
        }
      }
    } catch (err) {
      console.error('Error processing enrollment request:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Function to handle the addition of a student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddStudentLoading(true);

    try {
      // Check if the student email already exists in the course
      const emailExists = course?.studentsEnrolled?.some(
        (student) => {
          if (typeof student === 'string') return false;
          return student.email?.toLowerCase() === newStudentEmail.toLowerCase();
        }
      );
      
      if (emailExists) {
        setErrorMessage("Email này đã được đăng ký trong khóa học.");
        setShowErrorMessage(true);
        setAddStudentLoading(false);
        return;
      }

      const result = await enrollmentService.enrollCourse(
        newStudentEmail, // userId (using email as a substitute for now)
        course?._id || '' // courseId
      );

      if (result) {
        // Add the new student to the studentsEnrolled array if it exists
        if (course?.studentsEnrolled) {
          const nameArray = newStudentName.split(' ');
          const firstName = nameArray.pop() || '';
          const lastName = nameArray.join(' ') || '';
          
          const newStudent: ExtendedUser = {
            _id: `user-${Date.now()}`, // Generate a temp ID
            email: newStudentEmail,
            username: newStudentEmail,
            firstName: firstName,
            lastName: lastName,
            password: '',
            role: 'student',
            coursesEnrolled: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: 0,
            lastActive: new Date().toISOString(),
            enrolledAt: new Date().toISOString()
          };
          
          setCourse(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              studentsEnrolled: [...prev.studentsEnrolled, newStudent]
            };
          });
        }

        setNewStudentName('');
        setNewStudentEmail('');
        setAddStudentModalOpen(false);
        setSuccessMessage('Học viên đã được thêm thành công!');
        setShowSuccessMessage(true);
      }
    } catch (error) {
      console.error('Failed to add student:', error);
      setErrorMessage('Có lỗi xảy ra khi thêm học viên. Vui lòng thử lại.');
      setShowErrorMessage(true);
    } finally {
      setAddStudentLoading(false);
    }
  };

  // Add functions for reordering content
  const toggleReorderingContent = () => {
    setIsReorderingContent(!isReorderingContent);
  };
  
  const moveContentItemUp = (index: number) => {
    if (index <= 0 || courseContent.length < 2) return;
    
    const updatedContent = [...courseContent];
    const temp = updatedContent[index];
    updatedContent[index] = updatedContent[index - 1];
    updatedContent[index - 1] = temp;
    
    setCourseContent(updatedContent);
  };
  
  const moveContentItemDown = (index: number) => {
    if (index >= courseContent.length - 1) return;
    
    const updatedContent = [...courseContent];
    const temp = updatedContent[index];
    updatedContent[index] = updatedContent[index + 1];
    updatedContent[index + 1] = temp;
    
    setCourseContent(updatedContent);
  };
  
  const saveContentOrder = async () => {
    setContentOrderSaving(true);
    
    try {
      // Separate lesson IDs and quiz IDs while preserving the overall order
      const lessonIds: string[] = [];
      const quizIds: string[] = [];
      
      // Add each item to the appropriate array based on type
      courseContent.forEach(item => {
        if (item.type === 'lesson') {
          lessonIds.push(item._id);
        } else if (item.type === 'quiz') {
          quizIds.push(item._id);
        }
      });
      
      // Update both lessons and quizzes order
      if (lessonIds.length > 0) {
        await courseService.updateLessonOrder(courseId, lessonIds);
      }
      
      if (quizIds.length > 0) {
        await courseService.updateQuizOrder(courseId, quizIds);
      }
      
      // Exit reordering mode
      setIsReorderingContent(false);
      
      // Show success message
      toast.success('Thứ tự nội dung khóa học đã được cập nhật thành công');
    } catch (error) {
      console.error('Failed to save content order:', error);
      toast.error('Không thể cập nhật thứ tự nội dung khóa học. Vui lòng thử lại sau.');
    } finally {
      setContentOrderSaving(false);
    }
  };

  // Render components based on current state
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6 animate-pulse"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(item => (
              <div key={item} className="h-20 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          
          <div className="h-10 bg-gray-200 rounded w-full mb-6 animate-pulse"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(item => (
              <div key={item} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-red-500 mb-4">{error || 'Không tìm thấy khóa học'}</div>
          <button 
            onClick={() => router.back()} 
            className="bg-primary-600 text-white px-4 py-2 rounded-md inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </button>
        </div>
      </div>
    );
  }
  
  // Comment out unused variables to fix linter errors
  // const lessons = Array.isArray(course.lessons) 
  //   ? course.lessons.map(lesson => {
  //       if (typeof lesson === 'string') {
  //         // Properly type assert string to avoid 'never' type errors
  //         const lessonId = lesson as string;
  //         return { 
  //           _id: lessonId, 
  //           title: `Bài học ${lessonId.length >= 4 ? lessonId.slice(-4) : ''}`, 
  //           courseId: courseId 
  //         } as Lesson;
  //       }
  //       return lesson;
  //     }) 
  //   : [];
    
  // const quizzes = Array.isArray(course.quizzes) 
  //   ? course.quizzes.map((quiz, index) => typeof quiz === 'string' ? { _id: quiz, title: `Bài kiểm tra ${index + 1}`, questions: [] } as QuizItem : quiz) 
  //   : [];
    
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Link 
            href="/teacher/courses" 
            className="text-gray-500 hover:text-gray-700 mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">{course.title}</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Link
            href="/teacher/courses/create"
            className="bg-emerald-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Khóa học mới
          </Link>
          <Link
            href={`/teacher/courses/${courseId}/edit`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Link>
        </div>
      </div>

      {/* Course overview and Analytics */}
      {course  && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Main info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={course.thumbnail || 'https://via.placeholder.com/800x400?text=No+Thumbnail'} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h2 className="text-white text-2xl font-bold">{course.title}</h2>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold mb-4">Mô tả khóa học</h3>
                <p className="text-gray-700 mb-6">{course.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-6 h-6 text-gray-700 mb-2" />
                    <div className="text-sm text-gray-500">Thời lượng</div>
                    <div className="font-medium">{course.totalDuration || 0} phút</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-gray-700 mb-2" />
                    <div className="text-sm text-gray-500">Bài học</div>
                    <div className="font-medium">{course.lessons.length}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-6 h-6 text-gray-700 mb-2" />
                    <div className="text-sm text-gray-500">Bài kiểm tra</div>
                    <div className="font-medium">{course.quizzes?.length || 0}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 text-gray-700 mb-2" />
                    <div className="text-sm text-gray-500">Học viên</div>
                    <div className="font-medium">{course.studentsEnrolled.length}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Analytics Section */}
            {analyticsData && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <div className="flex items-center mb-4">
                  <BarChart2 className="w-5 h-5 mr-2 text-indigo-600" />
                  <h3 className="text-lg font-bold">Phân tích khóa học</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Lượt đăng ký</div>
                    <div className="text-xl font-bold">{course.registrations || course.studentsEnrolled.length}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Tỷ lệ hoàn thành</div>
                    <div className="text-xl font-bold">{analyticsData.completionRate}%</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Tiến độ trung bình</div>
                    <div className="text-xl font-bold">{analyticsData.averageProgress}%</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Doanh thu</div>
                    <div className="text-xl font-bold">${analyticsData.revenueGenerated}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side info */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-bold mb-4">Thông tin khóa học</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-5 h-5 mr-2 text-gray-400" />
                    Giá
                  </div>
                  <div className="font-medium">${course.price}</div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center text-gray-600">
                    <Star className="w-5 h-5 mr-2 text-gray-400" />
                    Đánh giá
                  </div>
                  <div className="font-medium">4.7 / 5</div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                    Ngày tạo
                  </div>
                  <div className="font-medium">{new Date(course.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="flex-1">Danh mục</div>
                  <div className="flex flex-wrap justify-end">
                    {course.category && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                        {course.category.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-6">
              <h3 className="text-lg font-bold mb-4">Thao tác nhanh</h3>
              <div className="space-y-3">
                <Link 
                  href={`/teacher/courses/${course._id}/lessons/create`}
                  className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm bài học mới
                </Link>
                <Link 
                  href={`/teacher/courses/${course._id}/quizzes/create`}
                  className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm bài kiểm tra mới
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Course overview */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="border-b">
          <nav className="flex">
           
            <button 
              className={`px-6 py-4 font-medium ${activeTab === 'lessons' 
                ? 'border-b-2 border-indigo-500 text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('lessons')}
            >
              Bài học ({course?.lessons?.length || 0})
            </button>
            <button 
              className={`px-6 py-4 font-medium ${activeTab === 'quizzes' 
                ? 'border-b-2 border-indigo-500 text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('quizzes')}
            >
              Bài kiểm tra ({course?.quizzes?.length || 0})
            </button>
            <button 
              className={`px-6 py-4 font-medium ${activeTab === 'content' 
                ? 'border-b-2 border-indigo-500 text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('content')}
            >
              Nội dung khóa học
            </button>
            <button 
              className={`px-6 py-4 font-medium ${activeTab === 'students' 
                ? 'border-b-2 border-indigo-500 text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('students')}
            >
              Học viên ({course?.studentsEnrolled?.length || 0})
            </button>
          </nav>
        </div>
        <div className="p-6">
          
          
          {activeTab === 'lessons' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Danh sách bài học</h3>
                <div className="flex space-x-2">
                  <Link 
                    href={`/teacher/courses/${course?._id}/lessons/create`}
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm bài học
                  </Link>
                </div>
              </div>
              
              <div className="space-y-4">
                {(!course?.lessons || course.lessons.length === 0) ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p>Khóa học chưa có bài học nào</p>
                    <Link 
                      href={`/teacher/courses/${course?._id}/lessons/create`}
                      className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm bài học đầu tiên
                    </Link>
                  </div>
                ) : (
                  course.lessons.map((lesson, index) => {
                    const lessonId = typeof lesson === 'string' ? lesson : lesson._id;
                    const lessonTitle = typeof lesson === 'string' ? `Bài học ${index + 1}` : lesson.title;
                    const lessonDescription = typeof lesson === 'object' ? lesson.description : '';
                    
                    return (
                      <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mr-4">
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-gray-900">{lessonTitle}</h4>
                          {lessonDescription && <p className="text-sm text-gray-500">{lessonDescription}</p>}
                        </div>
                        <div className="flex items-center ml-4">
                          <Link 
                            href={`/teacher/courses/${courseId}/lessons/${lessonId}`}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link 
                            href={`/teacher/courses/${courseId}/lessons/${lessonId}/edit`}
                            className="text-indigo-600 hover:text-indigo-800 mr-2"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => confirmDelete(lessonId, 'lesson', lessonTitle)}
                            className="text-red-600 hover:text-red-800"
                            title="Xóa bài học"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'quizzes' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Danh sách bài kiểm tra</h3>
                <div className="flex space-x-2">
                  <Link 
                    href={`/teacher/courses/${course?._id}/quizzes/create`}
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm bài kiểm tra
                  </Link>
                </div>
              </div>
              
              <div className="space-y-4">
                {(!course?.quizzes || course.quizzes.length === 0) ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p>Khóa học chưa có bài kiểm tra nào</p>
                    <Link 
                      href={`/teacher/courses/${course?._id}/quizzes/create`}
                      className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm bài kiểm tra đầu tiên
                    </Link>
                  </div>
                ) : (
                  course.quizzes.map((quiz, index) => {
                    const quizId = typeof quiz === 'string' ? quiz : quiz._id;
                    const quizTitle = typeof quiz === 'object' ? quiz.title : `Bài kiểm tra ${index + 1}`;
                    return (
                      <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mr-4">
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-gray-900">{quizTitle}</h4>
                          <p className="text-sm text-gray-500">
                            {typeof quiz === 'object' && quiz.questions 
                              ? `${quiz.questions.length} câu hỏi ${quiz.passingScore ? `• Điểm đạt: ${quiz.passingScore}%` : ''}` 
                              : 'Không có thông tin chi tiết'}
                          </p>
                        </div>
                        <div className="flex items-center ml-4">
                          <Link 
                            href={`/teacher/courses/${courseId}/quizzes/${quizId}`}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link 
                            href={`/teacher/courses/${courseId}/quizzes/${quizId}/edit`}
                            className="text-indigo-600 hover:text-indigo-800 mr-2"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => confirmDelete(quizId, 'quiz', quizTitle)}
                            className="text-red-600 hover:text-red-800"
                            title="Xóa bài kiểm tra"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'content' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Nội dung khóa học (theo thứ tự)</h3>
                <div className="flex space-x-2">
                  {isReorderingContent ? (
                    <div className="flex space-x-2">
                      <button 
                        className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                        onClick={saveContentOrder}
                        disabled={contentOrderSaving}
                      >
                        {contentOrderSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Lưu thứ tự
                          </>
                        )}
                      </button>
                      <button 
                        className="bg-gray-500 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                        onClick={() => setIsReorderingContent(false)}
                        disabled={contentOrderSaving}
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm flex items-center mr-2"
                      onClick={toggleReorderingContent}
                    >
                      <ArrowUpDown className="w-4 h-4 mr-1" />
                      Sắp xếp lại
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                {courseContent.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p>Khóa học chưa có nội dung nào</p>
                    <div className="flex justify-center mt-4 space-x-4">
                      <Link 
                        href={`/teacher/courses/${course?._id}/lessons/create`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm bài học
                      </Link>
                      <Link 
                        href={`/teacher/courses/${course?._id}/quizzes/create`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm bài kiểm tra
                      </Link>
                    </div>
                  </div>
                ) : (
                  courseContent.map((item, index) => {
                    const itemId = item._id;
                    const isLesson = item.type === 'lesson';
                    const itemTitle = item.title;
                    const itemDescription = item.description || '';
                    const order = item.order || 999;
                    
                    return (
                      <div key={item._id} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        {isReorderingContent && (
                          <div className="flex flex-col mr-2">
                            <button 
                              onClick={() => moveContentItemUp(index)}
                              disabled={index === 0}
                              className={`p-1 ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-indigo-600'}`}
                            >
                              <MoveUp className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => moveContentItemDown(index)}
                              disabled={index === courseContent.length - 1}
                              className={`p-1 ${index === courseContent.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-indigo-600'}`}
                            >
                              <MoveDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <div className={`flex-shrink-0 w-8 h-8 ${isLesson ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'} rounded-full flex items-center justify-center mr-4`}>
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <span className={`text-xs px-2 py-1 rounded mr-2 ${isLesson ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'}`}>
                              {isLesson ? 'Bài học' : 'Bài kiểm tra'}
                            </span>
                            <h4 className="font-medium text-gray-900">{itemTitle}</h4>
                          </div>
                          {itemDescription && <p className="text-sm text-gray-500 mt-1">{itemDescription}</p>}
                          <div className="text-xs text-gray-400 mt-1">Thứ tự: {order}</div>
                        </div>
                        <div className="flex items-center ml-4">
                          <Link 
                            href={`/teacher/courses/${courseId}/${isLesson ? 'lessons' : 'quizzes'}/${itemId}`}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link 
                            href={`/teacher/courses/${courseId}/${isLesson ? 'lessons' : 'quizzes'}/${itemId}/edit`}
                            className="text-indigo-600 hover:text-indigo-800 mr-2"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => confirmDelete(itemId, isLesson ? 'lesson' : 'quiz', itemTitle)}
                            className="text-red-600 hover:text-red-800"
                            title={`Xóa ${isLesson ? 'bài học' : 'bài kiểm tra'}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Danh sách học viên</h3>
                <div className="flex space-x-2">
                  <div className="flex items-center mr-4">
                    <label htmlFor="student-sort" className="mr-2 text-sm text-gray-600">Sắp xếp theo:</label>
                    <select
                      id="student-sort"
                      className="text-sm border border-gray-300 rounded-md py-1 px-2"
                      value={studentSort}
                      onChange={(e) => setStudentSort(e.target.value as 'progress' | 'name' | 'date')}
                    >
                      <option value="progress">Tiến độ</option>
                      <option value="name">Tên</option>
                      <option value="date">Ngày đăng ký</option>
                    </select>
                    
                    <button
                      onClick={() => setStudentSortDirection(studentSortDirection === 'asc' ? 'desc' : 'asc')}
                      className="ml-2 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                      title={studentSortDirection === 'asc' ? 'Đang sắp xếp tăng dần' : 'Đang sắp xếp giảm dần'}
                    >
                      {studentSortDirection === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setEnrollmentRequestsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center text-sm hover:bg-blue-700 transition-colors mr-2"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Yêu cầu ghi danh {enrollmentRequests.length > 0 && `(${enrollmentRequests.length})`}
                  </button>
                  <button
                    onClick={() => setAddStudentModalOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center text-sm hover:bg-green-700 transition-colors"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Thêm học viên
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {course.studentsEnrolled.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <p>Chưa có học viên nào đăng ký khóa học này</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...course.studentsEnrolled]
                      .sort((a, b) => {
                        const getProgress = (student: ExtendedUser | string) => 
                          typeof student !== 'string' && 'progress' in student ? student.progress || 0 : 0;
                        
                        const getName = (student: ExtendedUser | string) => {
                          if (typeof student === 'string') return '';
                          return `${student.firstName || ''} ${student.lastName || ''}`.trim();
                        };
                        
                        const getDate = (student: ExtendedUser | string) => {
                          if (typeof student === 'string') return 0;
                          if ('enrolledAt' in student && student.enrolledAt) {
                            return new Date(student.enrolledAt as Date | string).getTime();
                          }
                          return 0;
                        };
                        
                        if (studentSort === 'progress') {
                          const progressA = getProgress(a);
                          const progressB = getProgress(b);
                          return studentSortDirection === 'asc' ? progressA - progressB : progressB - progressA;
                        } else if (studentSort === 'name') {
                          const nameA = getName(a);
                          const nameB = getName(b);
                          return studentSortDirection === 'asc' 
                            ? nameA.localeCompare(nameB) 
                            : nameB.localeCompare(nameA);
                        } else { // date
                          const dateA = getDate(a);
                          const dateB = getDate(b);
                          return studentSortDirection === 'asc' ? dateA - dateB : dateB - dateA;
                        }
                      })
                      .map((student) => {
                        const studentId = typeof student === 'string' ? student : student._id;
                        const studentName = typeof student !== 'string' 
                          ? `${student.firstName || ''} ${student.lastName || ''}`.trim() 
                          : 'Unknown';
                        const studentEmail = typeof student !== 'string' ? student.email : '';
                        
                        // Generate placeholder data for demo
                        const progress = typeof student !== 'string' && 'progress' in student
                          ? student.progress || Math.floor(Math.random() * 100)
                          : Math.floor(Math.random() * 100);
                          
                        const lastActive = typeof student !== 'string' && 'lastActive' in student
                          ? student.lastActive || new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
                          : new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
                          
                        const enrolledAt = typeof student !== 'string' && 'enrolledAt' in student
                          ? student.enrolledAt || new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000)
                          : new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);

                        return (
                          <div key={studentId} className="bg-white p-4 rounded-lg shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3">
                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                  {studentName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-medium">{studentName}</h4>
                                  <p className="text-sm text-gray-500">{studentEmail}</p>
                                  <div className="mt-1 text-xs text-gray-400">
                                    Đăng ký: {new Date(enrolledAt).toLocaleDateString('vi-VN')}
                                    <span className="mx-2">•</span>
                                    Hoạt động gần đây: {new Date(lastActive).toLocaleDateString('vi-VN')}
                                  </div>
                                </div>
                              </div>
                              <button 
                                onClick={() => confirmStudentDelete(studentId, studentName)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Xóa
                              </button>
                            </div>
                            
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Tiến độ học tập</span>
                                <span className="text-sm text-gray-600">{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`${
                                    progress >= 80 
                                      ? 'bg-green-500' 
                                      : progress >= 30 
                                        ? 'bg-yellow-500' 
                                        : 'bg-red-500'
                                  } h-2 rounded-full`} 
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <div className="mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  progress === 100 
                                    ? 'bg-green-100 text-green-800' 
                                    : progress > 0 
                                      ? 'bg-yellow-100 text-yellow-800' 
                                      : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {progress === 100 
                                    ? 'Hoàn thành' 
                                    : progress > 0 
                                      ? 'Đang học' 
                                      : 'Chưa bắt đầu'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 w-6 h-6 mr-2" />
              <h3 className="text-lg font-medium">Xác nhận xóa</h3>
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
              Bạn có chắc chắn muốn xóa {itemToDelete?.type === 'lesson' ? 'bài học' : 'bài kiểm tra'} <span className="font-medium">{itemToDelete?.title}</span>? 
              Hành động này không thể hoàn tác.
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
                onClick={handleDelete}
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
                    Xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Student Delete Confirmation Modal */}
      {studentDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 w-6 h-6 mr-2" />
              <h3 className="text-lg font-medium">Xác nhận xóa học viên</h3>
            </div>
            
            {studentDeleteError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{studentDeleteError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <p className="mb-4">
              Bạn có chắc chắn muốn xóa học viên <span className="font-medium">{studentToDelete?.name}</span> khỏi khóa học này? 
              Hành động này không thể hoàn tác.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setStudentDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={studentDeleteLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleStudentDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={studentDeleteLoading}
              >
                {studentDeleteLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <UserMinus className="w-4 h-4 mr-2" />
                    Xóa học viên
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {addStudentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Thêm học viên mới</h3>
            
            <form onSubmit={handleAddStudent}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studentName">
                  Tên học viên
                </label>
                <input
                  id="studentName"
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studentEmail">
                  Email
                </label>
                <input
                  id="studentEmail"
                  type="email"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
                <p className="text-sm text-gray-500 mt-1 italic">Hệ thống sẽ kiểm tra email trùng lặp để tránh thêm một học viên nhiều lần.</p>
              </div>
              
              {showErrorMessage && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {showSuccessMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setAddStudentModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-2"
                  disabled={addStudentLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={addStudentLoading}
                >
                  {addStudentLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Thêm học viên
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enrollment Requests Modal */}
      {enrollmentRequestsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="text-blue-500 w-6 h-6 mr-2" />
                <h3 className="text-lg font-medium">Yêu cầu ghi danh</h3>
              </div>
              <button
                onClick={() => setEnrollmentRequestsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            {enrollmentRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Không có yêu cầu ghi danh nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollmentRequests.map(request => (
                  <div key={request._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="font-medium text-gray-900">{request.name}</h4>
                      <p className="text-sm text-gray-500">{request.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEnrollmentRequest(request._id, 'reject')}
                        className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        disabled={deleteLoading}
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleEnrollmentRequest(request._id, 'approve')}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700"
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                          'Chấp nhận'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setEnrollmentRequestsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md text-gray-800 hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 