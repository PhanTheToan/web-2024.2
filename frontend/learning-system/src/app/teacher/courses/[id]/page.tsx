"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { 
  Edit, Eye, Plus, ArrowLeft, BookOpen, Users, 
  Calendar, Clock, Trash2, AlertTriangle, UserMinus, 
  UserPlus, DollarSign, Star, FileText, BarChart2, ArrowUpDown, MoveUp, MoveDown
} from 'lucide-react';
import { Course, Lesson, User } from '@/app/types';
import { lessonService } from '@/services/lessonService';
import { quizService } from '@/services/quizService';

// Define extended interfaces to manage types until the backend is complete
interface ExtendedUser extends User {
  progress?: number;
  lastActive?: Date | string;
  enrolledAt?: Date | string;
  completedLessons?: number;
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
  const [isReorderingLessons, setIsReorderingLessons] = useState(false);
  const [isReorderingQuizzes, setIsReorderingQuizzes] = useState(false);
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
  const [addStudentSuccess, setAddStudentSuccess] = useState(false);
  const [addStudentError, setAddStudentError] = useState<string | null>(null);
  const [studentSort, setStudentSort] = useState<'progress' | 'name' | 'date'>('progress');
  const [studentSortDirection, setStudentSortDirection] = useState<'asc' | 'desc'>('desc');

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
            
            // Create a new student object
            const newStudent = {
              _id: approvedStudent._id,
              firstName: approvedStudent.name.split(' ').pop() || '',
              lastName: approvedStudent.name.split(' ').slice(0, -1).join(' ') || '',
              email: approvedStudent.email
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

  // Add function to handle adding a student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudentName || !newStudentEmail) {
      setAddStudentError('Vui lòng nhập đầy đủ thông tin học viên');
      return;
    }
    
    setAddStudentLoading(true);
    setAddStudentError(null);
    
    try {
      // In a real app, call an API to add the student
      // await courseService.addStudentToCourse(courseId, { name: newStudentName, email: newStudentEmail });
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the course state to add the student
      const nameParts = newStudentName.split(' ');
      const firstName = nameParts.pop() || '';
      const lastName = nameParts.join(' ');
      
      const newStudent = {
        _id: `student-${Date.now()}`,
        firstName,
        lastName,
        email: newStudentEmail,
        enrolledAt: new Date(),
        progress: 0
      };
      
      setCourse(prev => {
        if (!prev) return prev;
        
        const updatedStudents = Array.isArray(prev.studentsEnrolled) 
          ? [...prev.studentsEnrolled, newStudent]
          : [newStudent];
          
        return {
          ...prev,
          studentsEnrolled: updatedStudents
        } as ExtendedCourse;
      });
      
      // Show success message
      setAddStudentSuccess(true);
      
      // Reset form
      setNewStudentName('');
      setNewStudentEmail('');
      
      // Close modal after a delay
      setTimeout(() => {
        setAddStudentModalOpen(false);
        setAddStudentSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Error adding student:', err);
      setAddStudentError('Không thể thêm học viên. Vui lòng thử lại sau.');
    } finally {
      setAddStudentLoading(false);
    }
  };

  // Add functions for reordering lessons
  const toggleReorderingLessons = () => {
    setIsReorderingLessons(!isReorderingLessons);
  };
  
  const moveLessonUp = (index: number) => {
    if (index <= 0 || !course || !course.lessons) return;
    
    const updatedLessons = [...course.lessons];
    const temp = updatedLessons[index];
    updatedLessons[index] = updatedLessons[index - 1];
    updatedLessons[index - 1] = temp;
    
    setCourse({
      ...course,
      lessons: updatedLessons
    } as ExtendedCourse);
  };
  
  const moveLessonDown = (index: number) => {
    if (!course || !course.lessons || index >= course.lessons.length - 1) return;
    
    const updatedLessons = [...course.lessons];
    const temp = updatedLessons[index];
    updatedLessons[index] = updatedLessons[index + 1];
    updatedLessons[index + 1] = temp;
    
    setCourse({
      ...course,
      lessons: updatedLessons
    } as ExtendedCourse);
  };
  
  const saveLessonOrder = async () => {
    if (!course) return;
    
    setDeleteLoading(true);
    
    try {
      // Get the lesson IDs
      const lessonIds = course.lessons.map(lesson => 
        typeof lesson === 'object' ? lesson._id : lesson
      );
      
      // Call the service to update the order
      await courseService.updateLessonOrder(courseId, lessonIds);
      
      setIsReorderingLessons(false);
      
      // Show success message
      alert('Thứ tự bài học đã được cập nhật thành công');
    } catch (error) {
      console.error('Failed to save lesson order:', error);
      alert('Không thể cập nhật thứ tự bài học. Vui lòng thử lại sau.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Quizzes reordering
  const toggleReorderingQuizzes = () => {
    setIsReorderingQuizzes(!isReorderingQuizzes);
  };
  
  const moveQuizUp = (index: number) => {
    if (index <= 0 || !course || !course.quizzes) return;
    
    const updatedQuizzes = [...course.quizzes];
    const temp = updatedQuizzes[index];
    updatedQuizzes[index] = updatedQuizzes[index - 1];
    updatedQuizzes[index - 1] = temp;
    
    setCourse({
      ...course,
      quizzes: updatedQuizzes
    } as ExtendedCourse);
  };
  
  const moveQuizDown = (index: number) => {
    if (!course || !course.quizzes || index >= course.quizzes.length - 1) return;
    
    const updatedQuizzes = [...course.quizzes];
    const temp = updatedQuizzes[index];
    updatedQuizzes[index] = updatedQuizzes[index + 1];
    updatedQuizzes[index + 1] = temp;
    
    setCourse({
      ...course,
      quizzes: updatedQuizzes
    } as ExtendedCourse);
  };
  
  const saveQuizOrder = async () => {
    if (!course) return;
    
    setDeleteLoading(true);
    
    try {
      // Get the quiz IDs
      const quizIds = course.quizzes?.map(quiz => 
        typeof quiz === 'object' ? quiz._id : quiz
      ) || [];
      
      // Call the service to update the order
      await courseService.updateQuizOrder(courseId, quizIds);
      
      setIsReorderingQuizzes(false);
      
      // Show success message
      alert('Thứ tự bài kiểm tra đã được cập nhật thành công');
    } catch (error) {
      console.error('Failed to save quiz order:', error);
      alert('Không thể cập nhật thứ tự bài kiểm tra. Vui lòng thử lại sau.');
    } finally {
      setDeleteLoading(false);
    }
  };

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
  
  // Ensure lessons and quizzes are always arrays and properly typed
  const lessons = Array.isArray(course.lessons) 
    ? course.lessons.map(lesson => {
        if (typeof lesson === 'string') {
          // Properly type assert string to avoid 'never' type errors
          const lessonId = lesson as string;
          return { 
            _id: lessonId, 
            title: `Bài học ${lessonId.length >= 4 ? lessonId.slice(-4) : ''}`, 
            courseId: courseId 
          } as Lesson;
        }
        return lesson;
      }) 
    : [];
    
  const quizzes = Array.isArray(course.quizzes) 
    ? course.quizzes.map((quiz, index) => typeof quiz === 'string' ? { _id: quiz, title: `Bài kiểm tra ${index + 1}`, questions: [] } as QuizItem : quiz) 
    : [];
    
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
              className={`px-6 py-4 font-medium ${activeTab === 'overview' 
                ? 'border-b-2 border-indigo-500 text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('overview')}
            >
              Tổng quan
            </button>
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
          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-bold mb-4">Tổng quan khóa học</h3>
              {analyticsData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
              )}
            </div>
          )}
          
          {activeTab === 'lessons' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Danh sách bài học</h3>
                <div className="flex space-x-2">
                  {isReorderingLessons ? (
                    <div className="flex space-x-2">
                      <button 
                        className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                        onClick={saveLessonOrder}
                        disabled={deleteLoading}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {deleteLoading ? 'Đang lưu...' : 'Lưu thứ tự'}
                      </button>
                      <button 
                        className="bg-gray-500 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                        onClick={() => setIsReorderingLessons(false)}
                        disabled={deleteLoading}
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm flex items-center mr-2"
                        onClick={() => setIsReorderingLessons(true)}
                      >
                        <ArrowUpDown className="w-4 h-4 mr-1" />
                        Sắp xếp lại
                      </button>
                      <Link 
                        href={`/teacher/courses/${course?._id}/lessons/create`}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm bài học
                      </Link>
                    </>
                  )}
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
                        {isReorderingLessons && (
                          <div className="flex flex-col mr-2">
                            <button 
                              onClick={() => moveLessonUp(index)}
                              disabled={index === 0}
                              className={`p-1 ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-indigo-600'}`}
                            >
                              <MoveUp className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => moveLessonDown(index)}
                              disabled={index === (course.lessons?.length || 0) - 1}
                              className={`p-1 ${index === (course.lessons?.length || 0) - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-indigo-600'}`}
                            >
                              <MoveDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
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
                  {isReorderingQuizzes ? (
                    <div className="flex space-x-2">
                      <button 
                        className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                        onClick={saveQuizOrder}
                        disabled={deleteLoading}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {deleteLoading ? 'Đang lưu...' : 'Lưu thứ tự'}
                      </button>
                      <button 
                        className="bg-gray-500 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                        onClick={() => setIsReorderingQuizzes(false)}
                        disabled={deleteLoading}
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm flex items-center mr-2"
                        onClick={() => setIsReorderingQuizzes(true)}
                      >
                        <ArrowUpDown className="w-4 h-4 mr-1" />
                        Sắp xếp lại
                      </button>
                      <Link 
                        href={`/teacher/courses/${course?._id}/quizzes/create`}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm bài kiểm tra
                      </Link>
                    </>
                  )}
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
                        {isReorderingQuizzes && (
                          <div className="flex flex-col mr-2">
                            <button 
                              onClick={() => moveQuizUp(index)}
                              disabled={index === 0}
                              className={`p-1 ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-indigo-600'}`}
                            >
                              <MoveUp className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => moveQuizDown(index)}
                              disabled={index === (course.quizzes?.length || 0) - 1}
                              className={`p-1 ${index === (course.quizzes?.length || 0) - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-indigo-600'}`}
                            >
                              <MoveDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <UserPlus className="text-green-500 w-6 h-6 mr-2" />
                <h3 className="text-lg font-medium">Thêm học viên mới</h3>
              </div>
              <button
                onClick={() => setAddStudentModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            {addStudentError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{addStudentError}</p>
                  </div>
                </div>
              </div>
            )}
            
            {addStudentSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-green-700">Thêm học viên thành công!</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleAddStudent}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studentName">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="studentName"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="studentEmail">
                  Email
                </label>
                <input
                  type="email"
                  id="studentEmail"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={newStudentEmail}
                  onChange={(e) => setNewStudentEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>
              
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