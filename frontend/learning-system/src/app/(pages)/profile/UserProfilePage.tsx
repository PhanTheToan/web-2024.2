"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Camera, Clock, FileText, Loader2 } from "lucide-react"

export default function LMSUserProfile() {
  const [isLoading, setIsLoading] = useState(false)
  const [avatar, setAvatar] = useState<string>("/placeholder.svg?height=100&width=100")

  // Sample user data for an LMS profile
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    role: "Student",
    joinedDate: "September 2023",
    lastActive: "Today at 10:30 AM",
    completionRate: 78,
    totalCoursesCompleted: 12,
    totalHoursLearned: 87,
    certificatesEarned: 8,
    currentCourses: [
      {
        id: 1,
        title: "Advanced Web Development",
        progress: 65,
        lastAccessed: "Yesterday",
        thumbnail: "/placeholder.svg?height=60&width=100",
      },
      {
        id: 2,
        title: "UX Design Fundamentals",
        progress: 42,
        lastAccessed: "3 days ago",
        thumbnail: "/placeholder.svg?height=60&width=100",
      },
      {
        id: 3,
        title: "Data Science Essentials",
        progress: 89,
        lastAccessed: "Today",
        thumbnail: "/placeholder.svg?height=60&width=100",
      },
    ],
    completedCourses: [
      {
        id: 4,
        title: "Introduction to JavaScript",
        completedDate: "August 15, 2023",
        grade: "A",
        certificate: true,
      },
      {
        id: 5,
        title: "Responsive Web Design",
        completedDate: "July 22, 2023",
        grade: "A-",
        certificate: true,
      },
      {
        id: 6,
        title: "HTML & CSS Basics",
        completedDate: "June 10, 2023",
        grade: "B+",
        certificate: true,
      },
    ],
    achievements: [
      { id: 1, title: "Fast Learner", description: "Completed 5 courses in one month", icon: "🚀", date: "July 2023" },
      {
        id: 2,
        title: "Perfect Score",
        description: "Achieved 100% on a course assessment",
        icon: "🏆",
        date: "August 2023",
      },
      {
        id: 3,
        title: "Consistent Learner",
        description: "Logged in for 30 consecutive days",
        icon: "🔥",
        date: "September 2023",
      },
    ],
    learningPreferences: {
      preferredLanguage: "English",
      contentFormat: "Video",
      studyReminders: true,
      emailNotifications: true,
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

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      alert("Learning preferences updated successfully!")
    }, 1000)
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 flex flex-col items-center text-center border-b border-gray-200">
              <div className="relative mb-4">
                <div className="h-24 w-24 rounded-full overflow-hidden">
                  <img src={avatar || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" />
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Upload avatar</span>
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
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Joined: {userData.joinedDate}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="mr-2 h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">Last active: {userData.lastActive}</span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{userData.completionRate}%</div>
                    <div className="text-xs text-gray-500">Completion Rate</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{userData.totalCoursesCompleted}</div>
                    <div className="text-xs text-gray-500">Courses Completed</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{userData.totalHoursLearned}</div>
                    <div className="text-xs text-gray-500">Hours Learned</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{userData.certificatesEarned}</div>
                    <div className="text-xs text-gray-500">Certificates</div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Achievements</h3>
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
            </div>
          </div>
        </div>

        {/* Right Column - Course Progress & Settings */}
        <div className="lg:col-span-2">
          {/* Current Courses */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Current Courses</h3>
              <p className="text-sm text-gray-500">Your ongoing learning journey</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {userData.currentCourses.map((course) => (
                  <div key={course.id} className="flex flex-col sm:flex-row sm:items-center">
                    <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
                      <img
                        src={course.thumbnail || "/placeholder.svg"}
                        alt={course.title}
                        className="h-16 w-28 object-cover rounded-md"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-base font-medium text-gray-900">{course.title}</h4>
                        <span className="text-sm text-gray-500">Last accessed: {course.lastAccessed}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">{course.progress}% complete</span>
                        <a href="#" className="text-xs text-blue-600 hover:text-blue-800">
                          Continue Learning
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Completed Courses */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Completed Courses</h3>
              <p className="text-sm text-gray-500">Courses you've successfully finished</p>
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
                        Course
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Completed
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Grade
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Certificate
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
                          <div className="text-sm text-gray-500">{course.completedDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{course.grade}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {course.certificate ? (
                            <a href="#" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
                              <FileText className="h-4 w-4 mr-1" />
                              View
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

          {/* Learning Preferences */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Learning Preferences</h3>
              <p className="text-sm text-gray-500">Customize your learning experience</p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Preferred Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    defaultValue={userData.learningPreferences.preferredLanguage}
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Chinese</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="content-format" className="block text-sm font-medium text-gray-700">
                    Preferred Content Format
                  </label>
                  <select
                    id="content-format"
                    name="content-format"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    defaultValue={userData.learningPreferences.contentFormat}
                  >
                    <option>Video</option>
                    <option>Text</option>
                    <option>Audio</option>
                    <option>Interactive</option>
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
                    Enable study reminders
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
                    Receive email notifications about new courses and updates
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
                    Save Preferences
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

