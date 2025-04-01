"use client"

import type React from "react"

import { useState } from "react"
import {
  Camera,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  FileText,
  Loader2,
  MessageSquare,
  Star,
  Upload,
  Users,
  Video,
} from "lucide-react"

export default function TeacherProfile() {
  const [isLoading, setIsLoading] = useState(false)
  const [avatar, setAvatar] = useState<string>("/placeholder.svg?height=100&width=100")

  // Dữ liệu mẫu cho hồ sơ giảng viên tạo nội dung video
  const [teacherData, setTeacherData] = useState({
    name: "TS. Nguyễn Minh Tuấn",
    email: "tuannguyen@example.com",
    role: "Giảng viên",
    title: "Tiến sĩ Công nghệ thông tin",
    joinedDate: "Tháng 3 năm 2022",
    lastActive: "Hôm nay lúc 09:15",
    bio: "Tiến sĩ Công nghệ thông tin với hơn 10 năm kinh nghiệm giảng dạy. Chuyên gia về lập trình Python, phân tích dữ liệu và trí tuệ nhân tạo.",
    expertise: ["Python", "Phân tích dữ liệu", "Machine Learning", "Trí tuệ nhân tạo", "Excel nâng cao"],
    contentStats: {
      totalCourses: 12,
      totalVideos: 156,
      totalStudents: 3845,
      totalWatchHours: 28750,
      averageRating: 4.8,
      totalReviews: 1256,
      completionRate: 92,
      responseRate: 98,
    },
    publishedCourses: [
      {
        id: 1,
        title: "Lập trình Python cơ bản",
        students: 342,
        lastUpdated: "Hôm qua",
        thumbnail: "/placeholder.svg?height=60&width=100",
        rating: 4.9,
        totalVideos: 24,
        totalHours: 8.5,
        views: 12580,
      },
      {
        id: 2,
        title: "Phân tích dữ liệu với Python",
        students: 215,
        lastUpdated: "3 ngày trước",
        thumbnail: "/placeholder.svg?height=60&width=100",
        rating: 4.7,
        totalVideos: 18,
        totalHours: 6.2,
        views: 8450,
      },
      {
        id: 3,
        title: "Machine Learning cơ bản",
        students: 178,
        lastUpdated: "Hôm nay",
        thumbnail: "/placeholder.svg?height=60&width=100",
        rating: 4.8,
        totalVideos: 22,
        totalHours: 7.8,
        views: 6320,
      },
    ],
    draftCourses: [
      {
        id: 1,
        title: "Deep Learning và ứng dụng",
        progress: 75,
        lastEdited: "Hôm nay",
        videosCompleted: 12,
        videosTotal: 16,
      },
      {
        id: 2,
        title: "Xử lý ngôn ngữ tự nhiên với Python",
        progress: 40,
        lastEdited: "2 ngày trước",
        videosCompleted: 8,
        videosTotal: 20,
      },
    ],
    popularVideos: [
      {
        id: 1,
        title: "Giới thiệu về Python và cài đặt môi trường",
        course: "Lập trình Python cơ bản",
        views: 4250,
        likes: 385,
        duration: "18:25",
        thumbnail: "/placeholder.svg?height=60&width=100",
      },
      {
        id: 2,
        title: "Phân tích dữ liệu với Pandas",
        course: "Phân tích dữ liệu với Python",
        views: 3120,
        likes: 276,
        duration: "24:10",
        thumbnail: "/placeholder.svg?height=60&width=100",
      },
      {
        id: 3,
        title: "Thuật toán phân loại với Scikit-learn",
        course: "Machine Learning cơ bản",
        views: 2840,
        likes: 312,
        duration: "32:45",
        thumbnail: "/placeholder.svg?height=60&width=100",
      },
    ],
    teachingMaterials: [
      { id: 1, title: "Slide Python cơ bản.pptx", downloads: 325, date: "10/03/2024" },
      { id: 2, title: "Bài tập Machine Learning.pdf", downloads: 178, date: "05/04/2024" },
      { id: 3, title: "Dữ liệu mẫu phân tích.zip", downloads: 201, date: "01/04/2024" },
    ],
    recentReviews: [
      {
        id: 1,
        studentName: "Trần Văn Bình",
        course: "Lập trình Python cơ bản",
        rating: 5,
        comment:
          "Giảng viên giảng dạy rất dễ hiểu và nhiệt tình giải đáp thắc mắc. Tôi đã học được rất nhiều từ khóa học này.",
        date: "05/04/2024",
      },
      {
        id: 2,
        studentName: "Lê Thị Hương",
        course: "Phân tích dữ liệu với Python",
        rating: 4,
        comment:
          "Nội dung khóa học rất thực tế và áp dụng được ngay vào công việc. Tuy nhiên, một số phần hơi khó hiểu đối với người mới.",
        date: "02/04/2024",
      },
      {
        id: 3,
        studentName: "Phạm Minh Đức",
        course: "Machine Learning cơ bản",
        rating: 5,
        comment:
          "Thầy Tuấn giảng dạy rất tâm huyết và có nhiều ví dụ thực tế. Tôi đã học được cách áp dụng machine learning vào dự án của mình.",
        date: "28/03/2024",
      },
    ],
    recentQuestions: [
      {
        id: 1,
        studentName: "Nguyễn Thị Mai",
        course: "Lập trình Python cơ bản",
        video: "Làm việc với hàm trong Python",
        question:
          "Thầy ơi, em không hiểu rõ về cách sử dụng *args và **kwargs trong Python. Thầy có thể giải thích thêm được không ạ?",
        date: "Hôm nay",
        answered: false,
      },
      {
        id: 2,
        studentName: "Lê Văn Hùng",
        course: "Machine Learning cơ bản",
        video: "Thuật toán phân loại với Scikit-learn",
        question:
          "Em đang gặp vấn đề khi áp dụng Random Forest vào dữ liệu của mình. Mô hình bị overfitting. Thầy có thể gợi ý cách khắc phục không ạ?",
        date: "Hôm qua",
        answered: true,
      },
    ],
    teachingPreferences: {
      preferredLanguage: "Tiếng Việt",
      contentFormat: "Video kết hợp thực hành",
      autoTranscript: true,
      emailNotifications: true,
      allowStudentMessages: true,
      showRatings: true,
      defaultVideoQuality: "1080p",
      autoPublish: false,
    },
  })

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleSavePreferences() {
    setIsLoading(true)

    // Giả lập API call
    setTimeout(() => {
      setIsLoading(false)
      alert("Cập nhật tùy chọn giảng dạy thành công!")
    }, 1000)
  }

  // Hiển thị sao đánh giá
  function RatingStars({ rating }: { rating: number }) {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái - Thông tin giảng viên */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center border-b border-gray-200">
              <div className="relative mb-4">
                <div className="h-24 w-24 rounded-full overflow-hidden">
                  <img src={avatar || "/placeholder.svg"} alt="Ảnh đại diện" className="h-full w-full object-cover" />
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Tải ảnh lên</span>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{teacherData.name}</h2>
              <p className="text-sm text-gray-500">{teacherData.email}</p>
              <p className="text-sm text-gray-700 mt-1">{teacherData.title}</p>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {teacherData.role}
              </div>
              <a
                href="/edit-teacher-profile"
                className="inline-flex items-center mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Chỉnh sửa hồ sơ
              </a>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Tham gia: {teacherData.joinedDate}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Hoạt động gần đây: {teacherData.lastActive}</span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-900">Giới thiệu</h3>
                <p className="mt-2 text-sm text-gray-600">{teacherData.bio}</p>
              </div>

              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900">Chuyên môn</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {teacherData.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê nội dung</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{teacherData.contentStats.totalCourses}</div>
                    <div className="text-xs text-gray-500">Khóa học</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{teacherData.contentStats.totalVideos}</div>
                    <div className="text-xs text-gray-500">Video bài giảng</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {teacherData.contentStats.totalStudents.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Học viên</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {teacherData.contentStats.totalWatchHours.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Giờ xem</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{teacherData.contentStats.averageRating}</div>
                    <div className="text-xs text-gray-500">Đánh giá trung bình</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{teacherData.contentStats.totalReviews}</div>
                    <div className="text-xs text-gray-500">Lượt đánh giá</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">Câu hỏi gần đây</h3>
                <div className="space-y-3">
                  {teacherData.recentQuestions.map((question) => (
                    <div key={question.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <MessageSquare
                            className={`h-4 w-4 ${question.answered ? "text-green-500" : "text-orange-500"} mr-2`}
                          />
                          <span className="text-sm font-medium text-gray-900">{question.studentName}</span>
                        </div>
                        <span className="text-xs text-gray-500">{question.date}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {question.course} - {question.video}
                      </p>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">{question.question}</p>
                      <div className="mt-2 flex justify-end">
                        <a href="#" className="text-xs text-blue-600 hover:text-blue-800">
                          {question.answered ? "Xem câu trả lời" : "Trả lời"}
                        </a>
                      </div>
                    </div>
                  ))}
                  <div className="text-center mt-2">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                      Xem tất cả câu hỏi
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - Khóa học & Đánh giá */}
        <div className="lg:col-span-2">
          {/* Khóa học đã xuất bản */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Khóa học đã xuất bản</h3>
              <p className="text-sm text-gray-500">Các khóa học hiện có trên nền tảng</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {teacherData.publishedCourses.map((course) => (
                  <div key={course.id} className="border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                        <img
                          src={course.thumbnail || "/placeholder.svg"}
                          alt={course.title}
                          className="h-16 w-28 object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="text-base font-medium text-gray-900">{course.title}</h4>
                          <RatingStars rating={course.rating} />
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <Users className="h-4 w-4 mr-1" />
                          <span>{course.students} học viên</span>
                          <span className="mx-2">•</span>
                          <span>Cập nhật: {course.lastUpdated}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Video className="h-4 w-4 text-gray-500 mr-1" />
                            <span>{course.totalVideos} video</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-500 mr-1" />
                            <span>{course.totalHours} giờ</span>
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 text-gray-500 mr-1" />
                            <span>{course.views.toLocaleString()} lượt xem</span>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium mr-4">
                            Thống kê
                          </a>
                          <a href="#" className="text-sm text-green-600 hover:text-green-800 font-medium mr-4">
                            Cập nhật
                          </a>
                          <a href="#" className="text-sm text-gray-600 hover:text-gray-800 font-medium">
                            Xem
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                  + Tạo khóa học mới
                </button>
              </div>
            </div>
          </div>

          {/* Khóa học đang soạn thảo */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Khóa học đang soạn thảo</h3>
              <p className="text-sm text-gray-500">Các khóa học đang trong quá trình chuẩn bị</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {teacherData.draftCourses.map((course) => (
                  <div key={course.id} className="border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">{course.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {course.videosCompleted}/{course.videosTotal} video đã hoàn thành
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Chỉnh sửa: {course.lastEdited}</p>
                        <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Bản nháp
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-yellow-500 h-2.5 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">Hoàn thành {course.progress}%</span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <a href="#" className="text-sm text-blue-600 hover:text-blue-800 mr-4">
                        Tiếp tục chỉnh sửa
                      </a>
                      <a href="#" className="text-sm text-green-600 hover:text-green-800">
                        Xuất bản
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Video phổ biến */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Video phổ biến nhất</h3>
              <p className="text-sm text-gray-500">Các video được xem nhiều nhất của bạn</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {teacherData.popularVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex flex-col sm:flex-row border border-gray-100 rounded-lg p-3 shadow-sm"
                  >
                    <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4 relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="h-24 w-40 object-cover rounded-md"
                      />
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-base font-medium text-gray-900">{video.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{video.course}</p>
                      <div className="flex flex-wrap gap-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 text-gray-500 mr-1" />
                          <span>{video.views.toLocaleString()} lượt xem</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-red-500 mr-1" />
                          <span>{video.likes} lượt thích</span>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 mr-4">
                          Thống kê
                        </a>
                        <a href="#" className="text-sm text-gray-600 hover:text-gray-800">
                          Xem
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Xem tất cả video →
                </a>
              </div>
            </div>
          </div>

          {/* Tài liệu giảng dạy */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Tài liệu bổ sung</h3>
              <p className="text-sm text-gray-500">Các tài liệu bạn đã tải lên cho học viên</p>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tên tài liệu
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Ngày tải lên
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Lượt tải
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {teacherData.teachingMaterials.map((material) => (
                      <tr key={material.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <div className="text-sm font-medium text-gray-900">{material.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{material.date}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{material.downloads}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a href="#" className="text-blue-600 hover:text-blue-800 mr-4">
                            Xem
                          </a>
                          <a href="#" className="text-red-600 hover:text-red-800">
                            Xóa
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-center">
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
                  <Upload className="h-4 w-4 mr-2" />
                  Tải lên tài liệu mới
                </button>
              </div>
            </div>
          </div>

          {/* Đánh giá gần đây */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Đánh giá gần đây</h3>
              <p className="text-sm text-gray-500">Phản hồi từ học viên của bạn</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {teacherData.recentReviews.map((review) => (
                  <div key={review.id} className="border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start">
                        <div className="mr-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {review.studentName.charAt(0)}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{review.studentName}</h4>
                          <p className="text-xs text-gray-500 mt-1">Khóa học: {review.course}</p>
                          <RatingStars rating={review.rating} />
                          <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{review.date}</div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button className="text-sm text-blue-600 hover:text-blue-800">
                        <MessageSquare className="h-4 w-4 inline mr-1" />
                        Phản hồi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Xem tất cả đánh giá →
                </a>
              </div>
            </div>
          </div>

          {/* Tùy chọn giảng dạy */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Tùy chọn nội dung</h3>
              <p className="text-sm text-gray-500">Tùy chỉnh trải nghiệm tạo nội dung của bạn</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Ngôn ngữ giảng dạy
                  </label>
                  <select
                    id="language"
                    name="language"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    defaultValue={teacherData.teachingPreferences.preferredLanguage}
                  >
                    <option>Tiếng Việt</option>
                    <option>Tiếng Anh</option>
                    <option>Song ngữ Việt-Anh</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="content-format" className="block text-sm font-medium text-gray-700">
                    Định dạng nội dung ưa thích
                  </label>
                  <select
                    id="content-format"
                    name="content-format"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    defaultValue={teacherData.teachingPreferences.contentFormat}
                  >
                    <option>Video</option>
                    <option>Video kết hợp thực hành</option>
                    <option>Bài giảng tương tác</option>
                    <option>Slide và tài liệu</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="video-quality" className="block text-sm font-medium text-gray-700">
                    Chất lượng video mặc định
                  </label>
                  <select
                    id="video-quality"
                    name="video-quality"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    defaultValue={teacherData.teachingPreferences.defaultVideoQuality}
                  >
                    <option>720p</option>
                    <option>1080p</option>
                    <option>1440p</option>
                    <option>4K</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="auto-transcript"
                    name="auto-transcript"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked={teacherData.teachingPreferences.autoTranscript}
                  />
                  <label htmlFor="auto-transcript" className="ml-2 block text-sm text-gray-700">
                    Tự động tạo phụ đề cho video
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="email-notifications"
                    name="email-notifications"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked={teacherData.teachingPreferences.emailNotifications}
                  />
                  <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                    Nhận thông báo qua email về đăng ký khóa học mới
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="allow-messages"
                    name="allow-messages"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked={teacherData.teachingPreferences.allowStudentMessages}
                  />
                  <label htmlFor="allow-messages" className="ml-2 block text-sm text-gray-700">
                    Cho phép học viên nhắn tin trực tiếp
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="show-ratings"
                    name="show-ratings"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked={teacherData.teachingPreferences.showRatings}
                  />
                  <label htmlFor="show-ratings" className="ml-2 block text-sm text-gray-700">
                    Hiển thị đánh giá công khai trên trang hồ sơ
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="auto-publish"
                    name="auto-publish"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked={teacherData.teachingPreferences.autoPublish}
                  />
                  <label htmlFor="auto-publish" className="ml-2 block text-sm text-gray-700">
                    Tự động xuất bản video sau khi tải lên
                  </label>
                </div>

                <div className="pt-5">
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Lưu tùy chọn
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

