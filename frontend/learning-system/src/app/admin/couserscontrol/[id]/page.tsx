"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Edit, Trash, BookOpen, DollarSign, 
  BarChart2, Star, Calendar, Users, Clock, FileText, 
  Eye, MoveUp, MoveDown, AlertTriangle, CheckCircle2,
  ArrowUpDown, Plus, UserMinus, UserPlus,
  Loader2, Trash2
} from 'lucide-react';
import { User } from '@/app/types';
import { toast } from 'react-hot-toast';
import { courseService } from '@/services/courseService';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8082/api';

// Extend the User interface to include properties for student progress
interface ExtendedUser extends User {
  enrolledAt?: string | Date;
  progress?: number;
}

interface ContentItem {
  _id: string;
  title: string;
  description?: string;
  type: 'lesson' | 'quiz';
  order?: number;
}

// Define interface for enrollment requests
interface EnrollmentRequest {
  _id?: string;
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  courseId?: string;
}

// Update the interfaces to match the API response structure
interface Lesson {
  _id?: string;
  lessonId?: string;
  title?: string;
  lessonTitle?: string;
  lessonShortTitle?: string;
  description?: string;
  orderLesson?: number;
  order?: number;
  [key: string]: any; // Allow for additional properties
}

interface Quiz {
  _id?: string;
  quizId?: string;
  title?: string;
  description?: string;
  orderQuiz?: number;
  order?: number;
  questionCount?: number;
  passingScore?: number;
  [key: string]: any; // Allow for additional properties
}

interface Course {
  id: string;
  teacherId: string;
  teacherFullName: string;
  teacherName: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  courseStatus: string;
  contentCount: number;
  totalTimeLimit: number;
  totalDuration?: number;
  studentsCount: number;
  categories: string[];
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
  quizzes: Quiz[];
  studentsEnrolled: ExtendedUser[];
  registrations?: number;
  rating?: number;
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
  const [deletingItem, setDeletingItem] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{id: string, name: string, email: string} | null>(null);
  const [studentDeleteModalOpen, setStudentDeleteModalOpen] = useState(false);
  const [studentDeleteLoading, setStudentDeleteLoading] = useState(false);
  const [studentDeleteError, setStudentDeleteError] = useState<string | null>(null);
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([]);
  const [enrollmentRequestsModalOpen, setEnrollmentRequestsModalOpen] = useState(false);
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [addStudentLoading, setAddStudentLoading] = useState(false);
  const [addStudentSuccess, setAddStudentSuccess] = useState(false);
  const [addStudentError, setAddStudentError] = useState<string | null>(null);
  const [courseContent, setCourseContent] = useState<ContentItem[]>([]);
  const [isReorderingContent, setIsReorderingContent] = useState(false);
  const [contentOrderSaving, setContentOrderSaving] = useState(false);
  
  // Added state for deletion confirmations
  const [lessonToDelete, setLessonToDelete] = useState<{id: string, title: string} | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<{id: string, title: string} | null>(null);
  const [lessonDeleteModalOpen, setLessonDeleteModalOpen] = useState(false);
  const [quizDeleteModalOpen, setQuizDeleteModalOpen] = useState(false);
  
  const courseId = params.id as string;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
        const response = await fetch(`${API_BASE_URL}/auth/check`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Bạn cần đăng nhập để tiếp tục');
        }
        
        const data = await response.json();
        const userData = data.data;
        
        if (userData.role !== 'ROLE_ADMIN') {
          toast.error('Bạn không có quyền truy cập trang này');
          router.push('/login?redirect=/admin/couserscontrol');
          return;
        }
        
        console.log("Authenticated user:", userData);
        
        // Add user's name to document title for more context
        if (userData.firstName || userData.lastName) {
          const adminName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
          document.title = adminName ? `Quản lý khóa học | ${adminName}` : 'Quản lý khóa học';
        }
        
        fetchCourse();
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Vui lòng đăng nhập để tiếp tục');
        router.push('/login?redirect=/admin/couserscontrol');
      }
    };
    
    checkAuth();
  }, [router]);

  const fetchCourse = async () => {
    setLoading(true);
    try {
      // Fetch course information
      console.log(`Fetching course details for ID: ${courseId}`);
      const response = await fetch(`${API_BASE_URL}/course/info/${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể tải thông tin khóa học');
      }
      
      const courseData = await response.json();
      console.log("Course data:", courseData);
      
      // Parse course data based on API response structure
      let parsedCourse: Course;
      
      if (courseData.body) {
        // Handle nested response structure
        parsedCourse = {
          id: courseData.body.id || courseId,
          teacherId: courseData.body.teacherId || '',
          teacherFullName: courseData.body.teacherFullName || courseData.body.teacherName || '',
          teacherName: courseData.body.teacherName || '',
          title: courseData.body.title || '',
          description: courseData.body.description || '',
          thumbnail: courseData.body.thumbnail || '',
          price: courseData.body.price || 0,
          courseStatus: courseData.body.courseStatus || 'INACTIVE',
          contentCount: courseData.body.contentCount || 0,
          totalTimeLimit: courseData.body.totalTimeLimit || 0,
          totalDuration: courseData.body.totalDuration || 0,
          studentsCount: courseData.body.studentsCount || 0,
          categories: courseData.body.categories || [],
          createdAt: courseData.body.createdAt || new Date().toISOString(),
          updatedAt: courseData.body.updatedAt || new Date().toISOString(),
          registrations: courseData.body.registrations || 0,
          rating: courseData.body.rating || 0,
          lessons: [],
          quizzes: [],
          studentsEnrolled: []
        };
      } else {
        // Handle direct response structure
        parsedCourse = {
          id: courseData.id || courseId,
          teacherId: courseData.teacherId || '',
          teacherFullName: courseData.teacherFullName || courseData.teacherName || '',
          teacherName: courseData.teacherName || '',
          title: courseData.title || '',
          description: courseData.description || '',
          thumbnail: courseData.thumbnail || '',
          price: courseData.price || 0,
          courseStatus: courseData.courseStatus || 'INACTIVE',
          contentCount: courseData.contentCount || 0,
          totalTimeLimit: courseData.totalTimeLimit || 0,
          totalDuration: courseData.totalDuration || 0,
          studentsCount: courseData.studentsCount || 0,
          categories: courseData.categories || [],
          createdAt: courseData.createdAt || new Date().toISOString(),
          updatedAt: courseData.updatedAt || new Date().toISOString(),
          registrations: courseData.registrations || 0,
          rating: courseData.rating || 0,
          lessons: [],
          quizzes: [],
          studentsEnrolled: []
        };
      }
      
      // Fetch lessons and quizzes
      await fetchLessonsAndQuizzes(parsedCourse);
      
      // Fetch students
      await fetchStudents(parsedCourse);
      
      setCourse(parsedCourse);
      
      // Add analytics data
      setAnalyticsData({
        totalViews: parsedCourse.studentsCount * 10 || 100,
        completionRate: Math.floor(Math.random() * 60) + 20,
        averageProgress: Math.floor(Math.random() * 70) + 10,
        revenueGenerated: (parsedCourse.price * parsedCourse.studentsCount).toFixed(2)
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      setError("Không thể tải khóa học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonsAndQuizzes = async (parsedCourse: Course) => {
    try {
      // Fetch lessons and quizzes
      const lessonsQuizResponse = await fetch(`${API_BASE_URL}/course/lesson_quiz/${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (lessonsQuizResponse.ok) {
        const lessonsQuizData = await lessonsQuizResponse.json();
        console.log("Lessons and quizzes data:", lessonsQuizData);
        
        if (lessonsQuizData.body) {
          // Parse lessons
          if (lessonsQuizData.body.lessons && Array.isArray(lessonsQuizData.body.lessons)) {
            parsedCourse.lessons = lessonsQuizData.body.lessons;
          }
          
          // Parse quizzes
          if (lessonsQuizData.body.quizzes && Array.isArray(lessonsQuizData.body.quizzes)) {
            parsedCourse.quizzes = lessonsQuizData.body.quizzes;
          }
        }
      } else {
        console.error("Could not fetch lessons and quizzes");
      }
    } catch (error) {
      console.error("Error fetching lessons and quizzes:", error);
    }
  };

  const fetchStudents = async (parsedCourse: Course) => {
    try {
      // Fetch enrolled students
      console.log("Fetching enrolled students for course:", courseId);
      const studentsResponse = await fetch(`${API_BASE_URL}/course/admin/all-user/${courseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        console.log("Students data:", studentsData);
        
        if (studentsData.body && Array.isArray(studentsData.body)) {
          parsedCourse.studentsEnrolled = studentsData.body;
          console.log("Students enrolled:", studentsData.body);
        }
      } else {
        console.error("Could not fetch enrolled students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'content' && course) {
      loadCourseContent();
    }
  }, [activeTab, courseId]);

  const loadCourseContent = async () => {
    if (!courseId || !course) return;
    
    try {
      // Create a combined list of lessons and quizzes
      const content: ContentItem[] = [];
      
      // Add lessons
      if (course.lessons && Array.isArray(course.lessons)) {
        course.lessons.forEach(lesson => {
          // Type guard to ensure we're working with an object
          if (typeof lesson === 'object') {
            content.push({
              _id: lesson.lessonId || lesson._id || '',
              title: lesson.lessonTitle || lesson.title || 'Bài học',
              description: lesson.lessonShortTitle || lesson.description || '',
              order: lesson.orderLesson || 0,
              type: 'lesson'
            });
          }
        });
      }
      
      // Add quizzes
      if (course.quizzes && Array.isArray(course.quizzes)) {
        course.quizzes.forEach(quiz => {
          // Type guard to ensure we're working with an object
          if (typeof quiz === 'object') {
            content.push({
              _id: quiz.quizId || quiz._id || '',
              title: quiz.title || `Bài kiểm tra ${quiz.orderQuiz || ''}`,
              description: `${quiz.questionCount || 0} câu hỏi • Điểm đạt: ${quiz.passingScore || 60}%`,
              order: quiz.orderQuiz || 999,
              type: 'quiz'
            });
          }
        });
      }
      
      // Sort by order property - lessons and quizzes are merged and sorted by their order values
      content.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      setCourseContent(content);
      
      // Log the sorted content to verify
      console.log("Sorted course content:", content);
    } catch (error) {
      console.error("Error loading course content:", error);
    }
  };

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

  // Delete lesson or quiz functionality
  const handleDeleteItem = async (id: string | undefined, type: 'lesson' | 'quiz', title: string | undefined) => {
    if (!id) {
      console.error(`Cannot delete ${type} with undefined id`);
      toast.error(`Cannot delete ${type}. Missing ID information.`);
      return;
    }
    
    // Show confirmation dialog based on type
    if (type === 'lesson') {
      setLessonToDelete({id, title: title || 'Unnamed lesson'});
      setLessonDeleteModalOpen(true);
      return;
    } else {
      setQuizToDelete({id, title: title || 'Unnamed quiz'});
      setQuizDeleteModalOpen(true);
      return;
    }
  };

  // Confirm and execute lesson deletion
  const confirmLessonDelete = async () => {
    if (!lessonToDelete || !lessonToDelete.id) return;
    
    setDeletingItem(true);
    
    try {
      const url = `${API_BASE_URL}/course/delete-lesson/${lessonToDelete.id}?courseId=${courseId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể xóa bài học');
      }
      
      // Update course state
      if (course) {
        setCourse({
          ...course,
          lessons: course.lessons.filter(lesson => 
            lesson.lessonId !== lessonToDelete.id && lesson._id !== lessonToDelete.id
          )
        });
      }
      
      // Update course content if in content tab
      if (activeTab === 'content') {
        setCourseContent(prevContent => 
          prevContent.filter(item => !(item._id === lessonToDelete.id && item.type === 'lesson'))
        );
      }
      
      toast.success('Bài học đã được xóa thành công');
      
      // Close modal and reset state
      setLessonDeleteModalOpen(false);
      setLessonToDelete(null);
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast.error('Không thể xóa bài học. Vui lòng thử lại sau.');
    } finally {
      setDeletingItem(false);
    }
  };

  // Confirm and execute quiz deletion
  const confirmQuizDelete = async () => {
    if (!quizToDelete || !quizToDelete.id) return;
    
    setDeletingItem(true);
    
    try {
      const url = `${API_BASE_URL}/course/delete-quiz/${quizToDelete.id}?courseId=${courseId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Không thể xóa bài kiểm tra');
      }
      
      // Update course state
      if (course) {
        setCourse({
          ...course,
          quizzes: course.quizzes.filter(quiz => 
            quiz.quizId !== quizToDelete.id && quiz._id !== quizToDelete.id
          )
        });
      }
      
      // Update course content if in content tab
      if (activeTab === 'content') {
        setCourseContent(prevContent => 
          prevContent.filter(item => !(item._id === quizToDelete.id && item.type === 'quiz'))
        );
      }
      
      toast.success('Bài kiểm tra đã được xóa thành công');
      
      // Close modal and reset state
      setQuizDeleteModalOpen(false);
      setQuizToDelete(null);
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Không thể xóa bài kiểm tra. Vui lòng thử lại sau.');
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
      const email = studentToDelete.email || '';
      console.log(`Deleting student with email ${email} from course ${courseId}`);
      
      // API delete using query params for admin
      const response = await fetch(
        `${API_BASE_URL}/enrollments/admin/delete?courseId=${encodeURIComponent(courseId)}&email=${encodeURIComponent(email)}`, 
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.error(`DELETE ${API_BASE_URL}/enrollments/admin/delete?courseId=${courseId}&email=${email}: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error('Không thể xóa học viên khỏi khóa học');
      }
      
      // Update course state
      if (course?.studentsEnrolled) {
        setCourse({
          ...course,
          studentsEnrolled: course.studentsEnrolled.filter(student => student.email !== email),
          studentsCount: (course.studentsCount || 0) - 1
        });
      }
      
      toast.success('Học viên đã được xóa khỏi khóa học');
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
  const confirmStudentDelete = (studentId: string, name: string, email: string) => {
    setStudentToDelete({ id: studentId, name: name, email: email });
    setStudentDeleteModalOpen(true);
  };

  // Add function to handle enrollment approval/rejection
  const handleEnrollmentRequest = async (requestData: EnrollmentRequest, action: 'accept' | 'reject') => {
    if (!course || !courseId) return;
    
    try {
      // Check request information
      if (!requestData || !requestData.email) {
        throw new Error('Không tìm thấy thông tin yêu cầu ghi danh');
      }
      
      console.log(`Processing ${action} for email ${requestData.email} in course ${courseId}`);
      
      // Use the admin endpoint with query params
      const response = await fetch(
        `${API_BASE_URL}/enrollments/admin/${action}?email=${encodeURIComponent(requestData.email)}&courseId=${courseId}`, 
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Không thể ${action === 'accept' ? 'chấp nhận' : 'từ chối'} yêu cầu`);
      }
      
      // Remove the request from the list
      setEnrollmentRequests(prevRequests => 
        prevRequests.filter(req => req.email !== requestData.email)
      );
      
      // If accepted, fetch students again to update the list
      if (action === 'accept') {
        if (course) {
          await fetchStudents(course);
        }
        
        // Update studentsCount manually in case API doesn't return updated count
        setCourse(prevCourse => {
          if (!prevCourse) return prevCourse;
          return {
            ...prevCourse,
            studentsCount: (prevCourse.studentsCount || 0) + 1
          };
        });
      }
      
      toast.success(`Yêu cầu ghi danh đã được ${action === 'accept' ? 'chấp nhận' : 'từ chối'}`);
    } catch (error) {
      console.error(`Error ${action} enrollment request:`, error);
      toast.error(error instanceof Error ? error.message : `Không thể ${action === 'accept' ? 'chấp nhận' : 'từ chối'} yêu cầu ghi danh`);
    }
  };

  // Add function to handle adding a student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!courseId || !newStudentEmail.trim() || !course) return;
    
    setAddStudentLoading(true);
    setAddStudentError(null);
    
    try {
      // Check if the student email already exists in the course
      if (course.studentsEnrolled) {
        const emailExists = course.studentsEnrolled.some(
          student => student.email?.toLowerCase() === newStudentEmail.toLowerCase()
        );
        
        if (emailExists) {
          setAddStudentError("Email này đã được đăng ký trong khóa học.");
          setAddStudentLoading(false);
          return;
        }
      }

      console.log(`Adding student with email ${newStudentEmail} to course ${courseId}`);
      
      // Use query params according to Postman format with admin endpoint
      const response = await fetch(
        `${API_BASE_URL}/enrollments/admin/add?email=${encodeURIComponent(newStudentEmail)}&courseId=${encodeURIComponent(courseId)}`, 
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể thêm học viên');
      }
      
      // Refresh student list if course is not null
      if (course) {
        await fetchStudents(course);
      } else {
        // Fetch all course information if needed
        fetchCourse();
      }
      
      // Update UI
      setNewStudentName('');
      setNewStudentEmail('');
      setAddStudentModalOpen(false);
      setAddStudentSuccess(true);
      toast.success('Học viên đã được thêm thành công!');
      
      // Hide success message after a delay
      setTimeout(() => {
        setAddStudentSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to add student:', error);
      setAddStudentError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi thêm học viên. Vui lòng thử lại.');
      toast.error('Không thể thêm học viên');
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
    if (!course) return;
    setContentOrderSaving(true);
    
    try {
      // Separate lesson IDs and quiz IDs while preserving the overall order
      const lessons = courseContent
        .filter(item => item.type === 'lesson')
        .map((item, index) => ({
          lessonId: item._id,
          orderLesson: index + 1
        }));
      
      const quizzes = courseContent
        .filter(item => item.type === 'quiz')
        .map((item, index) => ({
          quizId: item._id,
          orderQuiz: index + 1
        }));
      
      // Update lessons order
      if (lessons.length > 0) {
        const lessonResponse = await fetch(`${API_BASE_URL}/lesson/reorder`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            courseId: course.id,
            lessons: lessons
          })
        });
        
        if (!lessonResponse.ok) {
          throw new Error('Không thể cập nhật thứ tự bài học');
        }
      }
      
      // Update quizzes order
      if (quizzes.length > 0) {
        const quizResponse = await fetch(`${API_BASE_URL}/quiz/reorder`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            courseId: course.id,
            quizzes: quizzes
          })
        });
        
        if (!quizResponse.ok) {
          throw new Error('Không thể cập nhật thứ tự bài kiểm tra');
        }
      }
      
      // Exit reordering mode
      setIsReorderingContent(false);
      
      // Show success message
      toast.success('Thứ tự nội dung khóa học đã được cập nhật thành công');
      
      // Refetch course data to get updated orders
      fetchCourse();
    } catch (error) {
      console.error('Failed to save content order:', error);
      toast.error('Không thể cập nhật thứ tự nội dung khóa học. Vui lòng thử lại sau.');
    } finally {
      setContentOrderSaving(false);
    }
  };

  // Add useEffect to fetch enrollment requests
  useEffect(() => {
    const fetchEnrollmentRequests = async () => {
      if (!courseId) return;
      
      try {
        console.log("Fetching enrollment requests for course ID:", courseId);
        const response = await fetch(`${API_BASE_URL}/enrollments/all-request/${courseId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("Enrollment requests data:", data);
          
          if (data.body && data.body.request && Array.isArray(data.body.request)) {
            console.log("Raw request data:", data.body.request);
            
            setEnrollmentRequests(data.body.request.map((req: {
              _id?: string;
              id?: string;
              email?: string;
              fullName?: string;
              courseId?: string;
            }) => {
              const processed = {
                _id: req._id || req.id,
                email: req.email,
                fullName: req.fullName,
                courseId: courseId
              };
              console.log("Processed request:", processed);
              return processed;
            }));
          } else {
            console.log("No enrollment requests found or invalid format");
            setEnrollmentRequests([]);
          }
        } else {
          console.error("Failed to fetch enrollment requests:", await response.text());
          setEnrollmentRequests([]);
        }
      } catch (error) {
        console.error("Error fetching enrollment requests:", error);
        setEnrollmentRequests([]);
      }
    };
    
    // Fetch requests immediately
    fetchEnrollmentRequests();
    
    // Set up polling every 30 seconds to check for new requests
    const intervalId = setInterval(fetchEnrollmentRequests, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [courseId]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Link 
            href="/admin/couserscontrol" 
            className="text-gray-500 hover:text-gray-700 mr-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">{course.title}</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {enrollmentRequests.length > 0 && (
            <button
              onClick={() => setEnrollmentRequestsModalOpen(true)}
              className="bg-amber-500 text-white px-4 py-2 rounded-md flex items-center hover:bg-amber-600 transition-colors"
            >
              <Users className="w-4 h-4 mr-2" />
              Yêu cầu tham gia ({enrollmentRequests.length})
            </button>
          )}
          <Link
            href={`/admin/couserscontrol/${course.id}/edit`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Link>
          <button 
            onClick={() => setDeleteModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-red-700 transition-colors"
          >
            <Trash className="w-4 h-4 mr-2" />
            Xóa khóa học
          </button>
        </div>
      </div>

      {/* Course overview and Analytics */}
      {course && (
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
                    <div className="font-medium">{course.totalTimeLimit || 0} phút</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-gray-700 mb-2" />
                    <div className="text-sm text-gray-500">Bài học</div>
                    <div className="font-medium">{course.lessons?.length || 0}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-6 h-6 text-gray-700 mb-2" />
                    <div className="text-sm text-gray-500">Bài kiểm tra</div>
                    <div className="font-medium">{course.quizzes?.length || 0}</div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-6 h-6 text-gray-700 mb-2" />
                    <div className="text-sm text-gray-500">Học viên</div>
                    <div className="font-medium">{course.studentsEnrolled?.length || 0}</div>
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
                    <div className="text-xl font-bold">{course.studentsCount || (course.studentsEnrolled ? course.studentsEnrolled.length : 0)}</div>
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
              <h3 className="text-lg font-bold mb-4">Giảng viên</h3>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  <img 
                    src={'https://via.placeholder.com/100'} 
                    alt={course.teacherFullName || 'Giảng viên'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-4">
                  <div className="font-medium">{course.teacherFullName || course.teacherName || 'Chưa có thông tin'}</div>
                  <div className="text-sm text-gray-500">{course.teacherId || 'Chưa có thông tin'}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
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
                  <div className="font-medium">{course.rating || 0} / 5</div>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                    Ngày tạo
                  </div>
                  <div className="font-medium">
                    {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <div className="flex-1">Danh mục</div>
                  <div className="flex flex-wrap justify-end">
                    {course.categories && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mr-1 mb-1">
                        {course.categories.join(', ')}
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
                  href={`/admin/couserscontrol/${course?.id || courseId}/lessons/create`}
                  className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm bài học
                </Link>
                <Link 
                  href={`/admin/couserscontrol/${course?.id || courseId}/quizzes/create`}
                  className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm bài kiểm tra
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
          {/* Lessons tab */}
          {activeTab === 'lessons' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Danh sách bài học</h3>
                <div className="flex space-x-2">
                  <Link 
                    href={`/admin/couserscontrol/${course?.id || courseId}/lessons/create`}
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
                      href={`/admin/couserscontrol/${course?.id || courseId}/lessons/create`}
                      className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm bài học đầu tiên
                    </Link>
                  </div>
                ) : (
                  course.lessons.map((lesson, index) => {
                    const lessonId = typeof lesson === 'string' ? lesson : (lesson._id || lesson.lessonId);
                    const lessonTitle = typeof lesson === 'string' ? `Bài học ${index + 1}` : (lesson.lessonTitle || lesson.title || `Bài học ${index + 1}`);
                    const lessonDescription = typeof lesson === 'object' ? (lesson.description || lesson.lessonShortTitle || '') : '';
                    
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
                            href={`/admin/couserscontrol/${courseId}/lessons/${lessonId}`}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link 
                            href={`/admin/couserscontrol/${courseId}/lessons/${lessonId}/edit`}
                            className="text-indigo-600 hover:text-indigo-800 mr-2"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteItem(lessonId, 'lesson', lessonTitle)}
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

          {/* Quizzes tab */}
          {activeTab === 'quizzes' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Danh sách bài kiểm tra</h3>
                <div className="flex space-x-2">
                  <Link 
                    href={`/admin/couserscontrol/${course?.id || courseId}/quizzes/create`}
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
                      href={`/admin/couserscontrol/${course?.id || courseId}/quizzes/create`}
                      className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm bài kiểm tra đầu tiên
                    </Link>
                  </div>
                ) : (
                  course.quizzes.map((quiz, index) => {
                    const quizId = typeof quiz === 'string' ? quiz : (quiz.quizId || quiz._id);
                    const quizTitle = typeof quiz === 'object' && quiz.title ? quiz.title : `Bài kiểm tra ${index + 1}`;
                    
                    return (
                      <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center mr-4">
                          {index + 1}
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-gray-900">{quizTitle}</h4>
                          <p className="text-sm text-gray-500">
                            {typeof quiz === 'object' && quiz.questionCount ? `${quiz.questionCount} câu hỏi` : 'Không có thông tin chi tiết'}
                          </p>
                        </div>
                        <div className="flex items-center ml-4">
                          <Link 
                            href={`/admin/couserscontrol/${courseId}/quizzes/${quizId}`}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link 
                            href={`/admin/couserscontrol/${courseId}/quizzes/${quizId}/edit`}
                            className="text-indigo-600 hover:text-indigo-800 mr-2"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteItem(quizId, 'quiz', quizTitle)}
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
                        href={`/admin/couserscontrol/${course?.id || courseId}/lessons/create`}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm bài học
                      </Link>
                      <Link 
                        href={`/admin/couserscontrol/${course?.id || courseId}/quizzes/create`}
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
                            href={`/admin/couserscontrol/${courseId}/${isLesson ? 'lessons' : 'quizzes'}/${itemId}`}
                            className="text-blue-600 hover:text-blue-800 mr-2"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link 
                            href={`/admin/couserscontrol/${courseId}/${isLesson ? 'lessons' : 'quizzes'}/${itemId}/edit`}
                            className="text-indigo-600 hover:text-indigo-800 mr-2"
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteItem(itemId, isLesson ? 'lesson' : 'quiz', itemTitle)}
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

          {/* Students tab */}
          {activeTab === 'students' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Danh sách học viên</h3>
                <div className="flex space-x-2">
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
                {!course?.studentsEnrolled || course.studentsEnrolled.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    <p>Chưa có học viên nào đăng ký khóa học này</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {course.studentsEnrolled.map((student) => {
                      const studentId = typeof student === 'string' ? student : student._id;
                      const studentName = typeof student !== 'string' 
                        ? `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.username || 'Học viên'
                        : 'Học viên';
                      const studentEmail = typeof student !== 'string' ? student.email : 'email@example.com';
                      const enrolledDate = new Date((typeof student !== 'string' && student.enrolledAt) || Date.now());
                      const progress = (typeof student !== 'string' && student.progress) || 0;
                      
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
                                  Đăng ký: {enrolledDate.toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => confirmStudentDelete(studentId, studentName, studentEmail)}
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
              Bạn có chắc chắn muốn xóa học viên <span className="font-medium">{studentToDelete?.name}</span> <span className="text-gray-600">({studentToDelete?.email})</span> khỏi khóa học này? 
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
                      <p className="text-sm text-green-700">Học viên đã được thêm thành công!</p>
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
                  <div key={request._id || request.email} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="mb-3 sm:mb-0">
                      <h4 className="font-medium text-gray-900">{request.fullName || request.name}</h4>
                      <p className="text-sm text-gray-500">{request.email}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEnrollmentRequest(request, 'reject')}
                        className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleEnrollmentRequest(request, 'accept')}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Chấp nhận
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

      {/* Delete confirmation modal for course */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 w-6 h-6 mr-2" />
              <h3 className="text-lg font-medium">Xác nhận xóa</h3>
            </div>
            
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa khóa học &quot;{course.title}&quot;? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setDeleteModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center hover:bg-red-700"
                onClick={handleDeleteCourse}
              >
                <Trash className="w-4 h-4 mr-2" />
                Xóa khóa học
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal for lesson */}
      {lessonDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 w-6 h-6 mr-2" />
              <h3 className="text-lg font-medium">Xác nhận xóa bài học</h3>
            </div>
            
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa bài học &quot;{lessonToDelete?.title}&quot;? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setLessonDeleteModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center hover:bg-red-700"
                onClick={confirmLessonDelete}
              >
                <Trash className="w-4 h-4 mr-2" />
                Xóa bài học
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal for quiz */}
      {quizDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 w-6 h-6 mr-2" />
              <h3 className="text-lg font-medium">Xác nhận xóa bài kiểm tra</h3>
            </div>
            
            <p className="mb-6">
              Bạn có chắc chắn muốn xóa bài kiểm tra &quot;{quizToDelete?.title}&quot;? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={() => setQuizDeleteModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center hover:bg-red-700"
                onClick={confirmQuizDelete}
              >
                <Trash className="w-4 h-4 mr-2" />
                Xóa bài kiểm tra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}