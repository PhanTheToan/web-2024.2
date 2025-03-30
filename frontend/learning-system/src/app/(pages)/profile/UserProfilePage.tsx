// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Calendar, Camera, Clock, FileText, Loader2 } from "lucide-react"

// export default function LMSUserProfile() {
//   const [isLoading, setIsLoading] = useState(false)
//   const [avatar, setAvatar] = useState<string>("/placeholder.svg?height=100&width=100")

//   // Sample user data for an LMS profile
//   const [userData, setUserData] = useState({
//     name: "Alex Johnson",
//     email: "alex.johnson@example.com",
//     role: "Student",
//     joinedDate: "September 2023",
//     lastActive: "Today at 10:30 AM",
//     completionRate: 78,
//     totalCoursesCompleted: 12,
//     totalHoursLearned: 87,
//     certificatesEarned: 8,
//     currentCourses: [
//       {
//         id: 1,
//         title: "Advanced Web Development",
//         progress: 65,
//         lastAccessed: "Yesterday",
//         thumbnail: "/placeholder.svg?height=60&width=100",
//       },
//       {
//         id: 2,
//         title: "UX Design Fundamentals",
//         progress: 42,
//         lastAccessed: "3 days ago",
//         thumbnail: "/placeholder.svg?height=60&width=100",
//       },
//       {
//         id: 3,
//         title: "Data Science Essentials",
//         progress: 89,
//         lastAccessed: "Today",
//         thumbnail: "/placeholder.svg?height=60&width=100",
//       },
//     ],
//     completedCourses: [
//       {
//         id: 4,
//         title: "Introduction to JavaScript",
//         completedDate: "August 15, 2023",
//         grade: "A",
//         certificate: true,
//       },
//       {
//         id: 5,
//         title: "Responsive Web Design",
//         completedDate: "July 22, 2023",
//         grade: "A-",
//         certificate: true,
//       },
//       {
//         id: 6,
//         title: "HTML & CSS Basics",
//         completedDate: "June 10, 2023",
//         grade: "B+",
//         certificate: true,
//       },
//     ],
//     achievements: [
//       { id: 1, title: "Fast Learner", description: "Completed 5 courses in one month", icon: "🚀", date: "July 2023" },
//       {
//         id: 2,
//         title: "Perfect Score",
//         description: "Achieved 100% on a course assessment",
//         icon: "🏆",
//         date: "August 2023",
//       },
//       {
//         id: 3,
//         title: "Consistent Learner",
//         description: "Logged in for 30 consecutive days",
//         icon: "🔥",
//         date: "September 2023",
//       },
//     ],
//     learningPreferences: {
//       preferredLanguage: "English",
//       contentFormat: "Video",
//       studyReminders: true,
//       emailNotifications: true,
//     },
//   })

//   function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
//     const file = event.target.files?.[0]
//     if (file) {
//       const reader = new FileReader()
//       reader.onload = (e) => {
//         setAvatar(e.target?.result as string)
//       }
//       reader.readAsDataURL(file)
//     }
//   }

//   function handleSavePreferences() {
//     setIsLoading(true)

//     // Simulate API call
//     setTimeout(() => {
//       setIsLoading(false)
//       alert("Learning preferences updated successfully!")
//     }, 1000)
//   }

//   return (
//     <div className="max-w-6xl mx-auto py-8 px-4">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Left Column - User Info */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <div className="p-6 flex flex-col items-center text-center border-b border-gray-200">
//               <div className="relative mb-4">
//                 <div className="h-24 w-24 rounded-full overflow-hidden">
//                   <img src={avatar || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" />
//                 </div>
//                 <label
//                   htmlFor="avatar-upload"
//                   className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700"
//                 >
//                   <Camera className="h-4 w-4" />
//                   <span className="sr-only">Upload avatar</span>
//                 </label>
//                 <input
//                   id="avatar-upload"
//                   type="file"
//                   accept="image/*"
//                   className="hidden"
//                   onChange={handleAvatarChange}
//                 />
//               </div>
//               <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
//               <p className="text-sm text-gray-500">{userData.email}</p>
//               <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
//                 {userData.role}
//               </div>
//             </div>

//             <div className="p-6">
//               <div className="space-y-4">
//                 <div className="flex items-center text-sm">
//                   <Calendar className="mr-2 h-4 w-4 text-gray-500" />
//                   <span className="text-gray-700">Joined: {userData.joinedDate}</span>
//                 </div>
//                 <div className="flex items-center text-sm">
//                   <Clock className="mr-2 h-4 w-4 text-gray-500" />
//                   <span className="text-gray-700">Last active: {userData.lastActive}</span>
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Statistics</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-gray-50 p-4 rounded-lg text-center">
//                     <div className="text-2xl font-bold text-blue-600">{userData.completionRate}%</div>
//                     <div className="text-xs text-gray-500">Completion Rate</div>
//                   </div>
//                   <div className="bg-gray-50 p-4 rounded-lg text-center">
//                     <div className="text-2xl font-bold text-blue-600">{userData.totalCoursesCompleted}</div>
//                     <div className="text-xs text-gray-500">Courses Completed</div>
//                   </div>
//                   <div className="bg-gray-50 p-4 rounded-lg text-center">
//                     <div className="text-2xl font-bold text-blue-600">{userData.totalHoursLearned}</div>
//                     <div className="text-xs text-gray-500">Hours Learned</div>
//                   </div>
//                   <div className="bg-gray-50 p-4 rounded-lg text-center">
//                     <div className="text-2xl font-bold text-blue-600">{userData.certificatesEarned}</div>
//                     <div className="text-xs text-gray-500">Certificates</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <h3 className="text-lg font-medium text-gray-900 mb-4">Achievements</h3>
//                 <div className="space-y-4">
//                   {userData.achievements.map((achievement) => (
//                     <div key={achievement.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
//                       <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 text-xl">
//                         {achievement.icon}
//                       </div>
//                       <div className="ml-3">
//                         <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
//                         <p className="text-xs text-gray-500">{achievement.description}</p>
//                         <p className="text-xs text-gray-400 mt-1">{achievement.date}</p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Course Progress & Settings */}
//         <div className="lg:col-span-2">
//           {/* Current Courses */}
//           <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
//             <div className="p-6 border-b border-gray-200">
//               <h3 className="text-lg font-medium text-gray-900">Current Courses</h3>
//               <p className="text-sm text-gray-500">Your ongoing learning journey</p>
//             </div>
//             <div className="p-6">
//               <div className="space-y-6">
//                 {userData.currentCourses.map((course) => (
//                   <div key={course.id} className="flex flex-col sm:flex-row sm:items-center">
//                     <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
//                       <img
//                         src={course.thumbnail || "/placeholder.svg"}
//                         alt={course.title}
//                         className="h-16 w-28 object-cover rounded-md"
//                       />
//                     </div>
//                     <div className="flex-grow">
//                       <div className="flex justify-between items-start mb-2">
//                         <h4 className="text-base font-medium text-gray-900">{course.title}</h4>
//                         <span className="text-sm text-gray-500">Last accessed: {course.lastAccessed}</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2.5">
//                         <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
//                       </div>
//                       <div className="flex justify-between mt-1">
//                         <span className="text-xs text-gray-500">{course.progress}% complete</span>
//                         <a href="#" className="text-xs text-blue-600 hover:text-blue-800">
//                           Continue Learning
//                         </a>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Completed Courses */}
//           <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
//             <div className="p-6 border-b border-gray-200">
//               <h3 className="text-lg font-medium text-gray-900">Completed Courses</h3>
//               <p className="text-sm text-gray-500">Courses you've successfully finished</p>
//             </div>
//             <div className="p-6">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th
//                         scope="col"
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Course
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Completed
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Grade
//                       </th>
//                       <th
//                         scope="col"
//                         className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                       >
//                         Certificate
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {userData.completedCourses.map((course) => (
//                       <tr key={course.id}>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-gray-900">{course.title}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-500">{course.completedDate}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm font-medium text-gray-900">{course.grade}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {course.certificate ? (
//                             <a href="#" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
//                               <FileText className="h-4 w-4 mr-1" />
//                               View
//                             </a>
//                           ) : (
//                             <span className="text-sm text-gray-500">N/A</span>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>

//           {/* Learning Preferences */}
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <div className="p-6 border-b border-gray-200">
//               <h3 className="text-lg font-medium text-gray-900">Learning Preferences</h3>
//               <p className="text-sm text-gray-500">Customize your learning experience</p>
//             </div>
//             <div className="p-6">
//               <div className="space-y-6">
//                 <div>
//                   <label htmlFor="language" className="block text-sm font-medium text-gray-700">
//                     Preferred Language
//                   </label>
//                   <select
//                     id="language"
//                     name="language"
//                     className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
//                     defaultValue={userData.learningPreferences.preferredLanguage}
//                   >
//                     <option>English</option>
//                     <option>Spanish</option>
//                     <option>French</option>
//                     <option>German</option>
//                     <option>Chinese</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label htmlFor="content-format" className="block text-sm font-medium text-gray-700">
//                     Preferred Content Format
//                   </label>
//                   <select
//                     id="content-format"
//                     name="content-format"
//                     className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
//                     defaultValue={userData.learningPreferences.contentFormat}
//                   >
//                     <option>Video</option>
//                     <option>Text</option>
//                     <option>Audio</option>
//                     <option>Interactive</option>
//                   </select>
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     id="study-reminders"
//                     name="study-reminders"
//                     type="checkbox"
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                     defaultChecked={userData.learningPreferences.studyReminders}
//                   />
//                   <label htmlFor="study-reminders" className="ml-2 block text-sm text-gray-700">
//                     Enable study reminders
//                   </label>
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     id="email-notifications"
//                     name="email-notifications"
//                     type="checkbox"
//                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                     defaultChecked={userData.learningPreferences.emailNotifications}
//                   />
//                   <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
//                     Receive email notifications about new courses and updates
//                   </label>
//                 </div>

//                 <div className="pt-5">
//                   <button
//                     type="button"
//                     onClick={handleSavePreferences}
//                     disabled={isLoading}
//                     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                   >
//                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                     Save Preferences
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

"use client"

import type React from "react"

import { useState } from "react"
import {
  Award,
  BookOpen,
  Calendar,
  Camera,
  Clock,
  Download,
  Edit,
  FileText,
  Headphones,
  Loader2,
  Monitor,
  Video,
} from "lucide-react"

export default function LMSUserProfile() {
  const [isLoading, setIsLoading] = useState(false)
  const [avatar, setAvatar] = useState<string>("/placeholder.svg?height=100&width=100")

  // Dữ liệu mẫu cho hồ sơ học viên trực tuyến
  const [userData, setUserData] = useState({
    name: "Nguyễn Văn An",
    email: "nguyenvanan@example.com",
    role: "Học viên",
    joinedDate: "Tháng 9 năm 2023",
    lastActive: "Hôm nay lúc 10:30",
    completionRate: 78,
    totalCoursesCompleted: 12,
    totalHoursLearned: 87,
    certificatesEarned: 8,
    learningStreak: 15, // Số ngày học liên tiếp
    totalQuizzesPassed: 42,
    totalAssignmentsSubmitted: 28,
    currentCourses: [
      {
        id: 1,
        title: "Tiếng Anh giao tiếp cơ bản",
        progress: 65,
        lastAccessed: "Hôm qua",
        thumbnail: "/placeholder.svg?height=60&width=100",
        instructor: "Cô Phương Anh",
        nextLesson: "Bài 7: Giao tiếp tại nhà hàng",
        type: "video",
      },
      {
        id: 2,
        title: "Excel cho công việc văn phòng",
        progress: 42,
        lastAccessed: "3 ngày trước",
        thumbnail: "/placeholder.svg?height=60&width=100",
        instructor: "Thầy Minh Tuấn",
        nextLesson: "Bài 5: Hàm VLOOKUP nâng cao",
        type: "interactive",
      },
      {
        id: 3,
        title: "Lập trình Python cơ bản",
        progress: 89,
        lastAccessed: "Hôm nay",
        thumbnail: "/placeholder.svg?height=60&width=100",
        instructor: "Thầy Hoàng Nam",
        nextLesson: "Bài 12: Xử lý file",
        type: "video",
      },
    ],
    completedCourses: [
      {
        id: 4,
        title: "Kỹ năng thuyết trình chuyên nghiệp",
        completedDate: "15/08/2023",
        grade: "Xuất sắc",
        certificate: true,
        instructor: "Cô Thu Hà",
      },
      {
        id: 5,
        title: "Marketing Online cơ bản",
        completedDate: "22/07/2023",
        grade: "Giỏi",
        certificate: true,
        instructor: "Thầy Đức Anh",
      },
      {
        id: 6,
        title: "Photoshop cho người mới bắt đầu",
        completedDate: "10/06/2023",
        grade: "Khá",
        certificate: true,
        instructor: "Cô Minh Tâm",
      },
    ],
    upcomingWebinars: [
      {
        id: 1,
        title: "Xu hướng công nghệ 2024",
        date: "15/04/2024",
        time: "19:30 - 21:00",
        speaker: "Chuyên gia Trần Đức Minh",
      },
      {
        id: 2,
        title: "Kỹ năng phỏng vấn xin việc",
        date: "22/04/2024",
        time: "20:00 - 21:30",
        speaker: "Chuyên gia Nguyễn Thị Hương",
      },
    ],
    achievements: [
      {
        id: 1,
        title: "Học viên chăm chỉ",
        description: "Hoàn thành 5 khóa học trong một tháng",
        icon: "🚀",
        date: "Tháng 7/2023",
      },
      {
        id: 2,
        title: "Điểm cao nhất",
        description: "Đạt điểm cao nhất trong bài kiểm tra",
        icon: "🏆",
        date: "Tháng 8/2023",
      },
      {
        id: 3,
        title: "Siêu học viên",
        description: "Đăng nhập học 30 ngày liên tiếp",
        icon: "🔥",
        date: "Tháng 9/2023",
      },
    ],
    downloadedMaterials: [
      { id: 1, title: "Tài liệu Excel nâng cao.pdf", date: "10/04/2024" },
      { id: 2, title: "Bài tập Python.zip", date: "05/04/2024" },
      { id: 3, title: "Slide Tiếng Anh giao tiếp.pptx", date: "01/04/2024" },
    ],
    learningPreferences: {
      preferredLanguage: "Tiếng Việt",
      contentFormat: "Video",
      studyReminders: true,
      emailNotifications: true,
      preferredStudyTime: "Buổi tối",
      videoQuality: "HD",
      downloadEnabled: true,
      subtitlesEnabled: true,
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
      alert("Cập nhật tùy chọn học tập thành công!")
    }, 1000)
  }

  // Hiển thị icon phù hợp với loại khóa học
  function CourseTypeIcon({ type }: { type: string }) {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-red-500" />
      case "interactive":
        return <Monitor className="h-4 w-4 text-green-500" />
      case "audio":
        return <Headphones className="h-4 w-4 text-purple-500" />
      default:
        return <BookOpen className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cột trái - Thông tin học viên */}
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
              <h2 className="text-xl font-bold text-gray-900">{userData.name}</h2>
              <p className="text-sm text-gray-500">{userData.email}</p>
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {userData.role}
              </div>
              <a
                href="/profile/edit"
                className="inline-flex items-center mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Chỉnh sửa hồ sơ
              </a>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Tham gia: {userData.joinedDate}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Hoạt động gần đây: {userData.lastActive}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Award className="mr-2 h-4 w-4 text-orange-500" />
                  <span className="text-gray-700">Học liên tục: {userData.learningStreak} ngày</span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thống kê học tập</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{userData.completionRate}%</div>
                    <div className="text-xs text-gray-500">Tỷ lệ hoàn thành</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{userData.totalCoursesCompleted}</div>
                    <div className="text-xs text-gray-500">Khóa học đã hoàn thành</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{userData.totalHoursLearned}</div>
                    <div className="text-xs text-gray-500">Giờ học tập</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{userData.certificatesEarned}</div>
                    <div className="text-xs text-gray-500">Chứng chỉ</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{userData.totalQuizzesPassed}</div>
                    <div className="text-xs text-gray-500">Bài kiểm tra đã vượt qua</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{userData.totalAssignmentsSubmitted}</div>
                    <div className="text-xs text-gray-500">Bài tập đã nộp</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Thành tích</h3>
                <div className="space-y-4">
                  {userData.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 text-xl">
                        {achievement.icon}
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
                        <p className="text-xs text-gray-500">{achievement.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{achievement.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tài liệu đã tải</h3>
                <div className="space-y-2">
                  {userData.downloadedMaterials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Download className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-700">{material.title}</span>
                      </div>
                      <span className="text-xs text-gray-500">{material.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - Tiến độ khóa học & Cài đặt */}
        <div className="lg:col-span-2">
          {/* Khóa học đang học */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Khóa học đang học</h3>
              <p className="text-sm text-gray-500">Hành trình học tập của bạn</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {userData.currentCourses.map((course) => (
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
                          <div className="flex items-center">
                            <CourseTypeIcon type={course.type} />
                            <h4 className="text-base font-medium text-gray-900 ml-2">{course.title}</h4>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Giảng viên: {course.instructor}</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">Hoàn thành {course.progress}%</span>
                          <span className="text-xs text-gray-500">Truy cập gần đây: {course.lastAccessed}</span>
                        </div>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-xs text-gray-600">Bài tiếp theo: {course.nextLesson}</span>
                          <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                            Tiếp tục học
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Webinar sắp diễn ra */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Webinar sắp diễn ra</h3>
              <p className="text-sm text-gray-500">Các buổi học trực tuyến bạn đã đăng ký</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {userData.upcomingWebinars.map((webinar) => (
                  <div key={webinar.id} className="border border-gray-100 rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">{webinar.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">Diễn giả: {webinar.speaker}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{webinar.date}</p>
                        <p className="text-sm text-gray-500">{webinar.time}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                        Thêm vào lịch
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Khóa học đã hoàn thành */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Khóa học đã hoàn thành</h3>
              <p className="text-sm text-gray-500">Các khóa học bạn đã học xong</p>
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
                        Khóa học
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Giảng viên
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Ngày hoàn thành
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Kết quả
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Chứng chỉ
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userData.completedCourses.map((course) => (
                      <tr key={course.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{course.instructor}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{course.completedDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{course.grade}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {course.certificate ? (
                            <a href="#" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
                              <FileText className="h-4 w-4 mr-1" />
                              Xem
                            </a>
                          ) : (
                            <span className="text-sm text-gray-500">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Tùy chọn học tập */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Tùy chọn học tập</h3>
              <p className="text-sm text-gray-500">Tùy chỉnh trải nghiệm học trực tuyến của bạn</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Ngôn ngữ ưa thích
                  </label>
                  <select
                    id="language"
                    name="language"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    defaultValue={userData.learningPreferences.preferredLanguage}
                  >
                    <option>Tiếng Việt</option>
                    <option>Tiếng Anh</option>
                    <option>Tiếng Pháp</option>
                    <option>Tiếng Nhật</option>
                    <option>Tiếng Trung</option>
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
                    defaultValue={userData.learningPreferences.contentFormat}
                  >
                    <option>Video</option>
                    <option>Văn bản</option>
                    <option>Âm thanh</option>
                    <option>Tương tác</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="study-time" className="block text-sm font-medium text-gray-700">
                    Thời gian học ưa thích
                  </label>
                  <select
                    id="study-time"
                    name="study-time"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    defaultValue={userData.learningPreferences.preferredStudyTime}
                  >
                    <option>Buổi sáng</option>
                    <option>Buổi trưa</option>
                    <option>Buổi chiều</option>
                    <option>Buổi tối</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="video-quality" className="block text-sm font-medium text-gray-700">
                    Chất lượng video
                  </label>
                  <select
                    id="video-quality"
                    name="video-quality"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    defaultValue={userData.learningPreferences.videoQuality}
                  >
                    <option>Tự động</option>
                    <option>Thấp (tiết kiệm dữ liệu)</option>
                    <option>Trung bình</option>
                    <option>HD</option>
                    <option>Full HD</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="study-reminders"
                    name="study-reminders"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked={userData.learningPreferences.studyReminders}
                  />
                  <label htmlFor="study-reminders" className="ml-2 block text-sm text-gray-700">
                    Bật nhắc nhở học tập
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="email-notifications"
                    name="email-notifications"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked={userData.learningPreferences.emailNotifications}
                  />
                  <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700">
                    Nhận thông báo qua email về khóa học mới và cập nhật
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="download-enabled"
                    name="download-enabled"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked={userData.learningPreferences.downloadEnabled}
                  />
                  <label htmlFor="download-enabled" className="ml-2 block text-sm text-gray-700">
                    Cho phép tải xuống tài liệu học tập
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    id="subtitles-enabled"
                    name="subtitles-enabled"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked={userData.learningPreferences.subtitlesEnabled}
                  />
                  <label htmlFor="subtitles-enabled" className="ml-2 block text-sm text-gray-700">
                    Hiển thị phụ đề trong video bài giảng
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

