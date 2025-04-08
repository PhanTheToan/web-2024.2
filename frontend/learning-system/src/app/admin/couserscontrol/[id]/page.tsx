"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { courseService } from '@/services/courseService';
import { 
  ArrowLeft, Edit, Trash, BookOpen, DollarSign, 
  BarChart2, Star, Calendar, Users, Clock, FileText, 
  Eye, MoveUp, MoveDown, AlertCircle, CheckCircle2, 
  ArrowUpDown, Plus, UserMinus, UserCheck, UserX, UserPlus,
  Loader2, Trash2
} from 'lucide-react';
import { Course, Lesson, Quiz, User } from '@/app/types';
import { toast } from 'react-hot-toast';

interface ContentItem {
  _id: string;
  title: string;
  description?: string;
  type: 'lesson' | 'quiz';
  order?: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('lessons');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isReorderingLessons, setIsReorderingLessons] = useState(false);
  const [isReorderingQuizzes, setIsReorderingQuizzes] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<{
    totalViews: number;
    completionRate: number;
    averageProgress: number;
    revenueGenerated: string;
  } | null>(null);
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
  const [removingStudent, setRemovingStudent] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<string | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [deletingItem, setDeletingItem] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string} | null>(null);
  const [studentDeleteModalOpen, setStudentDeleteModalOpen] = useState(false);
  const [studentDeleteLoading, setStudentDeleteLoading] = useState(false);
  const [studentDeleteError, setStudentDeleteError] = useState<string | null>(null);
  const [enrollmentRequests, setEnrollmentRequests] = useState<{_id: string, name: string, email: string}[]>([]);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [addStudentSuccess, setAddStudentSuccess] = useState(false);
  const [addStudentError, setAddStudentError] = useState<string | null>(null);
  const [courseContent, setCourseContent] = useState<ContentItem[]>([]);
  const [isReorderingContent, setIsReorderingContent] = useState(false);
  const [contentOrderSaving, setContentOrderSaving] = useState(false);
  
  const courseId = params.id as string;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await courseService.getCourseById(courseId);
        setCourse(data as Course);
        
        // Fetch some basic analytics
        // In a real app, this would be a separate API call
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

        // Load course content for the content tab
        loadCourseContent(data);
      } catch (error) {
        console.error('Failed to fetch course:', error);
        setError('Không thể tải thông tin khóa học');
      } finally {
        setLoading(false);
      }
    };

    // Function to load and merge lessons and quizzes for content tab
    const loadCourseContent = (courseData: any) => {
      if (!courseData) return;

      const contentItems: ContentItem[] = [];

      // Add lessons to content
      if (Array.isArray(courseData.lessons)) {
        courseData.lessons.forEach((lesson: string | Lesson, index: number) => {
          // Skip if lesson is just a string ID
          if (typeof lesson === 'string') return;
          
          // Only process lesson objects
          contentItems.push({
            _id: lesson._id,
            title: lesson.title,
            description: lesson.description,
            type: 'lesson',
            order: lesson.order || index + 1
          });
        });
      }

      // Add quizzes to content
      if (Array.isArray(courseData.quizzes)) {
        courseData.quizzes.forEach((quiz: string | Quiz, index: number) => {
          // Skip if quiz is just a string ID
          if (typeof quiz === 'string') return;
          
          // Only process quiz objects
          contentItems.push({
            _id: quiz._id,
            title: quiz.title,
            description: quiz.description,
            type: 'quiz',
            order: quiz.order || index + 1
          });
        });
      }

      // Sort by order property
      contentItems.sort((a, b) => (a.order || 999) - (b.order || 999));
      setCourseContent(contentItems);
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  useEffect(() => {
    const loadCourseContent = async () => {
      if (activeTab === 'content' && courseId) {
        try {
          const content = await courseService.getCourseContent(courseId);
          
          // Convert the content items to the proper format
          const typedContent = content.map(item => {
            // Destructure to avoid duplicating properties
            const { _id = '', courseId = '', title = '', description, order, type, ...rest } = item;
            return {
              _id,
              courseId,
              title, 
              description,
              order,
              type: type as 'lesson' | 'quiz',
              ...rest
            };
          }) as ContentItem[];
          
          setCourseContent(typedContent);
        } catch (error) {
          console.error("Error loading course content:", error);
          toast.error("Không thể tải nội dung khóa học");
        }
      }
    };

    if (course) {
      loadCourseContent();
    }
  }, [activeTab, courseId, course]);

  const handleDeleteCourse = async () => {
    try {
      setLoading(true);
      await courseService.deleteCourse(courseId);
      
      // Close modal and redirect
      setDeleteModalOpen(false);
      router.push('/admin/couserscontrol');
    } catch (error) {
      console.error('Failed to delete course:', error);
      setError('Không thể xóa khóa học. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };
  
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
    });
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
    });
  };
  
  const saveLessonOrder = async () => {
    if (!course) return;
    
    try {
      setSavingOrder(true);
      
      // Get the lesson IDs
      const lessonIds = course.lessons.map((lesson: any) => lesson._id);
      
      // Call the service to update the order
      await courseService.updateLessonOrder(courseId, lessonIds);
      
      setIsReorderingLessons(false);
      
      // Show success message
      alert('Thứ tự bài học đã được cập nhật thành công');
    } catch (error) {
      console.error('Failed to save lesson order:', error);
      alert('Không thể cập nhật thứ tự bài học. Vui lòng thử lại sau.');
    } finally {
      setSavingOrder(false);
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
    });
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
    });
  };
  
  const saveQuizOrder = async () => {
    if (!course) return;
    
    try {
      setSavingOrder(true);
      
      // Get the quiz IDs
      const quizIds = course.quizzes.map((quiz: any) => 
        typeof quiz === 'object' ? quiz._id : quiz
      );
      
      // Call the service to update the order
      await courseService.updateQuizOrder(courseId, quizIds);
      
      setIsReorderingQuizzes(false);
      
      // Show success message
      alert('Thứ tự bài kiểm tra đã được cập nhật thành công');
    } catch (error) {
      console.error('Failed to save quiz order:', error);
      alert('Không thể cập nhật thứ tự bài kiểm tra. Vui lòng thử lại sau.');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      setRemovingStudent(true);
      
      // Call the service to remove the student
      await courseService.removeStudentFromCourse(courseId, studentId);
      
      // Update the UI by removing the student from the list
      if (course) {
        const updatedStudents = course.studentsEnrolled.filter(
          (student: any) => typeof student === 'object' && student._id !== studentId
        );
        
        setCourse({
          ...course,
          studentsEnrolled: updatedStudents
        });
      }
      
      setStudentToRemove(null);
    } catch (error) {
      console.error('Failed to remove student:', error);
      alert('Không thể hủy đăng ký. Vui lòng thử lại sau.');
    } finally {
      setRemovingStudent(false);
    }
  };

  // Delete lesson functionality
  const handleDeleteLesson = async (lessonId: string) => {
    try {
      setDeletingItem(true);
      
      // Call API to delete lesson
      await courseService.deleteLesson(courseId, lessonId);
      
      // Update the UI by removing the lesson from the list
      if (course) {
        const updatedLessons = course.lessons.filter(
          (lesson) => lesson._id !== lessonId
        );
        
        setCourse({
          ...course,
          lessons: updatedLessons
        } as Course);
      }
      
      setLessonToDelete(null);
    } catch (error) {
      console.error('Failed to delete lesson:', error);
      alert('Không thể xóa bài học. Vui lòng thử lại sau.');
    } finally {
      setDeletingItem(false);
    }
  };
  
  // Delete quiz functionality
  const handleDeleteQuiz = async (quizId: string) => {
    try {
      setDeletingItem(true);
      
      // Call API to delete quiz
      await courseService.deleteQuiz(courseId, quizId);
      
      // Update the UI by removing the quiz from the list
      if (course) {
        const updatedQuizzes = course.quizzes.filter(
          (quiz) => typeof quiz === 'object' ? quiz._id !== quizId : quiz !== quizId
        );
        
        setCourse({
          ...course,
          quizzes: updatedQuizzes
        } as Course);
      }
      
      setQuizToDelete(null);
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      alert('Không thể xóa bài kiểm tra. Vui lòng thử lại sau.');
    } finally {
      setDeletingItem(false);
    }
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
        } as Course;
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
  const confirmStudentDelete = (id: string, name: string) => {
    setStudentToDelete({ id, name });
    setStudentDeleteModalOpen(true);
  };

  // Add function to handle enrollment approval/rejection
  const handleEnrollmentRequest = async (requestId: string, isApproved: boolean) => {
    setEnrollmentLoading(true);
    
    try {
      // In a real app, call an API to approve/reject the enrollment
      // await courseService.processEnrollmentRequest(courseId, requestId, isApproved);
      
      // Update local state to remove the processed request
      setEnrollmentRequests(prev => prev.filter(req => req._id !== requestId));
      
      // If approved, add the student to the course
      if (isApproved && course) {
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
            } as Course;
          });
        }
      }
    } catch (err) {
      console.error('Error processing enrollment request:', err);
    } finally {
      setEnrollmentLoading(false);
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
        } as Course;
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-40 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error || 'Không tìm thấy khóa học'}
        </div>
        <Link href="/admin/couserscontrol" className="flex items-center text-primary-600">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center mb-2">
            <Link href="/admin/couserscontrol" className="text-primary-600 hover:text-primary-800 flex items-center mr-4">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Quay lại
            </Link>
            <h1 className="text-2xl font-bold">{course.title}</h1>
          </div>
          <div className="text-gray-500">ID: {course._id}</div>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Link 
            href={`/admin/couserscontrol/${course._id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Link>
          <button 
            className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash className="w-4 h-4 mr-2" />
            Xóa
          </button>
        </div>
      </div>

      {/* Course overview and Analytics */}
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
                  <div className="font-medium">{course.quizzes.length}</div>
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
                <BarChart2 className="w-5 h-5 mr-2 text-primary-600" />
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
                <div className="font-medium">{course.rating || '0'} / 5</div>
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
                  {course.categories.map((category, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Giảng viên</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                {course.teacherId && typeof course.teacherId === 'object' && (
                  <img 
                    src={course.teacherId.profileImage || 'https://via.placeholder.com/100'} 
                    alt={`${course.teacherId.firstName} ${course.teacherId.lastName}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="ml-4">
                {course.teacherId && typeof course.teacherId === 'object' && (
                  <>
                    <div className="font-medium">{course.teacherId.firstName} {course.teacherId.lastName}</div>
                    <div className="text-sm text-gray-500">{course.teacherId.email}</div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-bold mb-4">Thao tác nhanh</h3>
            <div className="space-y-3">
              <Link 
                href={`/admin/couserscontrol/${course._id}/lessons/create`}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm bài học mới
              </Link>
              <Link 
                href={`/admin/couserscontrol/${course._id}/quizzes/create`}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm bài kiểm tra mới
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for lessons, students, and quizzes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            <button 
              className={`px-6 py-4 font-medium ${activeTab === 'lessons' 
                ? 'border-b-2 border-primary-500 text-primary-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('lessons')}
            >
              Bài học ({course.lessons.length})
            </button>
            <button 
              className={`px-6 py-4 font-medium ${activeTab === 'quizzes' 
                ? 'border-b-2 border-primary-500 text-primary-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('quizzes')}
            >
              Bài kiểm tra ({course.quizzes.length})
            </button>
            <button 
              className={`px-6 py-4 font-medium ${activeTab === 'content' 
                ? 'border-b-2 border-primary-500 text-primary-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('content')}
            >
              Nội dung khóa học
            </button>
            <button 
              className={`px-6 py-4 font-medium ${activeTab === 'students' 
                ? 'border-b-2 border-primary-500 text-primary-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('students')}
            >
              Học viên ({course.studentsEnrolled.length})
            </button>
          </nav>
        </div>
        <div className="p-6">
          {/* Lessons tab */}
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
                        disabled={savingOrder}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {savingOrder ? 'Đang lưu...' : 'Lưu thứ tự'}
                      </button>
                      <button 
                        className="bg-gray-500 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                        onClick={toggleReorderingLessons}
                        disabled={savingOrder}
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm flex items-center mr-2"
                        onClick={toggleReorderingLessons}
                      >
                        <ArrowUpDown className="w-4 h-4 mr-1" />
                        Sắp xếp lại
                      </button>
                      <Link 
                        href={`/admin/couserscontrol/${course._id}/lessons/create`}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm bài học
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                {!course.lessons || course.lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p>Khóa học chưa có bài học nào</p>
                    <Link 
                      href={`/admin/couserscontrol/${course?._id}/lessons/create`}
                      className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-800"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm bài học đầu tiên
                    </Link>
                  </div>
                ) : (
                  course.lessons.map((lesson, index) => (
                    <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      {isReorderingLessons ? (
                        <div className="flex flex-col mr-2">
                          <button 
                            onClick={() => moveLessonUp(index)}
                            disabled={index === 0}
                            className={`p-1 ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-primary-600'}`}
                          >
                            <MoveUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => moveLessonDown(index)}
                            disabled={index === course.lessons.length - 1}
                            className={`p-1 ${index === course.lessons.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-primary-600'}`}
                          >
                            <MoveDown className="w-4 h-4" />
                          </button>
                        </div>
                      ) : null}
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mr-4">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                        <p className="text-sm text-gray-500">{lesson.description || 'Không có mô tả'}</p>
                      </div>
                      <div className="flex items-center ml-4">
                        <Link 
                          href={`/admin/couserscontrol/${course._id}/lessons/${lesson._id}`}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                        <Link 
                          href={`/admin/couserscontrol/${course._id}/lessons/${lesson._id}/edit`}
                          className="text-primary-600 hover:text-primary-800 mr-2"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => setLessonToDelete(lesson._id)}
                          className="text-red-600 hover:text-red-800"
                          title="Xóa bài học"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Quizzes tab */}
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
                        disabled={savingOrder}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {savingOrder ? 'Đang lưu...' : 'Lưu thứ tự'}
                      </button>
                      <button 
                        className="bg-gray-500 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                        onClick={toggleReorderingQuizzes}
                        disabled={savingOrder}
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm flex items-center mr-2"
                        onClick={toggleReorderingQuizzes}
                      >
                        <ArrowUpDown className="w-4 h-4 mr-1" />
                        Sắp xếp lại
                      </button>
                      <Link 
                        href={`/admin/couserscontrol/${course?._id}/quizzes/create`}
                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm bài kiểm tra
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                {!course?.quizzes || course.quizzes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p>Khóa học chưa có bài kiểm tra nào</p>
                    <Link 
                      href={`/admin/couserscontrol/${course?._id}/quizzes/create`}
                      className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-800"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm bài kiểm tra đầu tiên
                    </Link>
                  </div>
                ) : (
                  course.quizzes.map((quiz, index) => {
                    const quizTitle = typeof quiz === 'object' ? quiz.title : `Bài kiểm tra ${index + 1}`;
                    const quizId = typeof quiz === 'object' ? quiz._id : quiz;
                    
                    return (
                      <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        {isReorderingQuizzes ? (
                          <div className="flex flex-col mr-2">
                            <button 
                              onClick={() => moveQuizUp(index)}
                              disabled={index === 0}
                              className={`p-1 ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-primary-600'}`}
                            >
                              <MoveUp className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => moveQuizDown(index)}
                              disabled={index === course.quizzes.length - 1}
                              className={`p-1 ${index === course.quizzes.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-primary-600'}`}
                            >
                              <MoveDown className="w-4 h-4" />
                            </button>
                          </div>
                        ) : null}
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mr-4">
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-gray-900">{quizTitle}</h4>
                          <p className="text-sm text-gray-500">
                            {typeof quiz === 'object' && quiz.questions 
                              ? `${quiz.questions.length} câu hỏi • Điểm đạt: ${quiz.passingScore || 70}%` 
                              : 'Không có thông tin chi tiết'}
                          </p>
                        </div>
                        <div className="flex items-center ml-4">
                          <Link 
                            href={`/admin/couserscontrol/${course._id}/quizzes/${quizId}`}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link 
                            href={`/admin/couserscontrol/${course._id}/quizzes/${quizId}/edit`}
                            className="text-primary-600 hover:text-primary-800 mr-2"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => setQuizToDelete(quizId)}
                            className="text-red-600 hover:text-red-800"
                            title="Xóa bài kiểm tra"
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Content tab */}
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
                        href={`/admin/couserscontrol/${course?._id}/lessons/create`}
                        className="inline-flex items-center text-primary-600 hover:text-primary-800"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm bài học
                      </Link>
                      <Link 
                        href={`/admin/couserscontrol/${course?._id}/quizzes/create`}
                        className="inline-flex items-center text-primary-600 hover:text-primary-800"
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
                              className={`p-1 ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-primary-600'}`}
                            >
                              <MoveUp className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => moveContentItemDown(index)}
                              disabled={index === courseContent.length - 1}
                              className={`p-1 ${index === courseContent.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-primary-600'}`}
                            >
                              <MoveDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <div className={`flex-shrink-0 w-8 h-8 ${isLesson ? 'bg-primary-100 text-primary-700' : 'bg-purple-100 text-purple-700'} rounded-full flex items-center justify-center mr-4`}>
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center">
                            <span className={`text-xs px-2 py-1 rounded mr-2 ${isLesson ? 'bg-primary-100 text-primary-800' : 'bg-purple-100 text-purple-800'}`}>
                              {isLesson ? 'Bài học' : 'Bài kiểm tra'}
                            </span>
                            <h4 className="font-medium text-gray-900">{itemTitle}</h4>
                          </div>
                          {itemDescription && <p className="text-sm text-gray-500 mt-1">{itemDescription}</p>}
                          <div className="text-xs text-gray-400 mt-1">Thứ tự: {order}</div>
                        </div>
                        <div className="flex items-center ml-4">
                          <Link 
                            href={`/admin/couserscontrol/${courseId}/${isLesson ? 'lessons' : 'quizzes'}/${itemId}`}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link 
                            href={`/admin/couserscontrol/${courseId}/${isLesson ? 'lessons' : 'quizzes'}/${itemId}/edit`}
                            className="text-primary-600 hover:text-primary-800 mr-2"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => isLesson ? setLessonToDelete(itemId) : setQuizToDelete(itemId)}
                            className="text-red-600 hover:text-red-800"
                            title={`Xóa ${isLesson ? 'bài học' : 'bài kiểm tra'}`}
                          >
                            <Trash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Students tab */}
          {activeTab === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg-semibold">Danh sách học viên</h3>
                
                <div className="flex items-center space-x-2">
                  {/* Add student button */}
                  <button
                    onClick={() => setAddStudentModalOpen(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center text-sm hover:bg-green-700 transition-colors"
                  >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Thêm học viên
                  </button>
                  
                  {/* Show enrollment requests notification badge if there are requests */}
                  {enrollmentRequests.length > 0 && (
                    <div className="text-sm text-indigo-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {enrollmentRequests.length} yêu cầu đăng ký mới
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Enrollment Requests Section */}
              {enrollmentRequests.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-indigo-800 mb-3">Yêu cầu đăng ký</h4>
                  <div className="space-y-3">
                    {enrollmentRequests.map(request => (
                      <div key={request._id} className="bg-white p-3 rounded-md shadow-sm flex justify-between items-center">
                        <div>
                          <div className="font-medium">{request.name}</div>
                          <div className="text-sm text-gray-500">{request.email}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEnrollmentRequest(request._id, true)}
                            className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                            disabled={enrollmentLoading}
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEnrollmentRequest(request._id, false)}
                            className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                            disabled={enrollmentLoading}
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {course.studentsEnrolled.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <p className="text-gray-500">Chưa có học viên nào đăng ký khóa học này</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {course.studentsEnrolled.map((student) => {
                    const studentId = typeof student === 'string' ? student : student._id;
                    const studentName = typeof student !== 'string' 
                      ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Học viên'
                      : 'Học viên';
                    const studentEmail = typeof student !== 'string' ? student.email : 'email@example.com';
                    const enrolledDate = new Date((typeof student !== 'string' && (student as ExtendedUser).enrolledAt) || Date.now());
                    const progress = (typeof student !== 'string' && (student as ExtendedUser).progress) || 0;
                    
                    return (
                      <div key={studentId} className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-md transition-shadow p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3 text-lg font-bold">
                              {typeof student !== 'string' && student.firstName 
                                ? student.firstName.charAt(0).toUpperCase() 
                                : 'U'}
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{studentName}</h4>
                              <p className="text-sm text-gray-600">{studentEmail}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => confirmStudentDelete(studentId, studentName)}
                            className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                            title="Xóa học viên"
                          >
                            <UserMinus className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="border-t border-gray-100 pt-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-600">Ngày đăng ký:</span>
                            <span className="text-sm text-gray-800">{enrolledDate.toLocaleDateString('vi-VN')}</span>
                          </div>
                          
                          <div className="mb-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-600">Tiến độ:</span>
                              <span className="text-sm text-gray-800">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-indigo-600 h-2.5 rounded-full" 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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

      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-bold">Xác nhận xóa</h3>
            </div>
            <p className="mb-6">Bạn có chắc chắn muốn xóa khóa học "{course.title}"? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                onClick={() => setDeleteModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md"
                onClick={handleDeleteCourse}
              >
                Xóa khóa học
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 