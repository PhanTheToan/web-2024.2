// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Camera, Loader2 } from "lucide-react"

// export default function EditProfilePage() {
//   const [isLoading, setIsLoading] = useState(false)
//   const [avatar, setAvatar] = useState<string>("/placeholder.svg?height=100&width=100")
//   const [formData, setFormData] = useState({
//     name: "John Doe",
//     email: "john.doe@example.com",
//     bio: "I'm a software developer based in San Francisco.",
//     website: "https://example.com",
//     twitter: "johndoe",
//     linkedin: "https://linkedin.com/in/johndoe",
//   })

//   function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
//     const { name, value } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   function handleSubmit(e: React.FormEvent) {
//     e.preventDefault()
//     setIsLoading(true)

//     // Simulate API call
//     setTimeout(() => {
//       console.log(formData)
//       setIsLoading(false)
//       alert("Profile updated successfully!")
//     }, 1000)
//   }

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

//   return (
//     <div className="max-w-2xl mx-auto py-10 px-4">
//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         <div className="p-6 border-b border-gray-200">
//           <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
//           <p className="text-sm text-gray-500">
//             Update your profile information and how others see you on the platform.
//           </p>
//         </div>

//         <div className="p-6">
//           <div className="mb-6 flex flex-col items-center space-y-4">
//             <div className="relative">
//               <div className="h-24 w-24 rounded-full overflow-hidden">
//                 <img src={avatar || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" />
//               </div>
//               <label
//                 htmlFor="avatar-upload"
//                 className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-sm hover:bg-blue-700"
//               >
//                 <Camera className="h-4 w-4" />
//                 <span className="sr-only">Upload avatar</span>
//               </label>
//               <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
//             </div>
//             <p className="text-sm text-gray-500">Click the camera icon to upload a new profile picture</p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label htmlFor="name" className="block text-sm font-medium text-gray-700">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 id="name"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//                 placeholder="Your name"
//               />
//               <p className="mt-1 text-sm text-gray-500">This is your public display name.</p>
//             </div>

//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 id="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//                 placeholder="Your email address"
//               />
//               <p className="mt-1 text-sm text-gray-500">We'll never share your email with anyone else.</p>
//             </div>

//             <div>
//               <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
//                 Bio
//               </label>
//               <textarea
//                 id="bio"
//                 name="bio"
//                 value={formData.bio}
//                 onChange={handleChange}
//                 rows={3}
//                 className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//                 placeholder="Tell us a little bit about yourself"
//               />
//               <p className="mt-1 text-sm text-gray-500">You can @mention other users and organizations.</p>
//             </div>

//             <div className="space-y-4">
//               <div className="text-sm font-medium text-gray-700">Social Links</div>

//               <div>
//                 <label htmlFor="website" className="block text-sm font-medium text-gray-700">
//                   Website
//                 </label>
//                 <input
//                   type="url"
//                   id="website"
//                   name="website"
//                   value={formData.website}
//                   onChange={handleChange}
//                   className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//                   placeholder="https://your-website.com"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="twitter" className="block text-sm font-medium text-gray-700">
//                   Twitter
//                 </label>
//                 <input
//                   type="text"
//                   id="twitter"
//                   name="twitter"
//                   value={formData.twitter}
//                   onChange={handleChange}
//                   className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//                   placeholder="@username"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
//                   LinkedIn
//                 </label>
//                 <input
//                   type="url"
//                   id="linkedin"
//                   name="linkedin"
//                   value={formData.linkedin}
//                   onChange={handleChange}
//                   className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
//                   placeholder="https://linkedin.com/in/username"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end pt-5">
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
//               >
//                 {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//                 Save Changes
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   )
// }


"use client"

import type React from "react"

import { useState } from "react"
import { Camera, Loader2 } from "lucide-react"

export default function EditProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [avatar, setAvatar] = useState<string>("/placeholder.svg?height=100&width=100")
  const [formData, setFormData] = useState({
    name: "Nguyễn Văn An",
    email: "nguyenvanan@example.com",
    phone: "0912345678",
    bio: "Tôi là một nhân viên văn phòng đang tìm kiếm cơ hội học tập để nâng cao kỹ năng chuyên môn.",
    education: "Đại học Kinh tế Quốc dân",
    jobTitle: "Nhân viên kinh doanh",
    company: "Công ty ABC",
    website: "https://example.com",
    facebook: "nguyenvanan",
    linkedin: "https://linkedin.com/in/nguyenvanan",
    learningGoals: "Nâng cao kỹ năng Excel và tiếng Anh giao tiếp",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    // Giả lập API call
    setTimeout(() => {
      console.log(formData)
      setIsLoading(false)
      alert("Cập nhật hồ sơ thành công!")
    }, 1000)
  }

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

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Chỉnh sửa hồ sơ học viên</h2>
          <p className="text-sm text-gray-500">Cập nhật thông tin cá nhân và mục tiêu học tập của bạn</p>
        </div>

        <div className="p-6">
          <div className="mb-6 flex flex-col items-center space-y-4">
            <div className="relative">
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
              <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <p className="text-sm text-gray-500">Nhấp vào biểu tượng máy ảnh để tải lên ảnh đại diện mới</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Nhập họ tên của bạn"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Nhập địa chỉ email của bạn"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Nhập số điện thoại của bạn"
                />
              </div>

              <div>
                <label htmlFor="education" className="block text-sm font-medium text-gray-700">
                  Trình độ học vấn
                </label>
                <input
                  type="text"
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Trường/Bằng cấp của bạn"
                />
              </div>

              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                  Chức danh công việc
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Vị trí công việc hiện tại"
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Công ty/Tổ chức
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="Nơi bạn đang làm việc"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Giới thiệu bản thân
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Hãy giới thiệu một chút về bản thân"
              />
            </div>

            <div>
              <label htmlFor="learningGoals" className="block text-sm font-medium text-gray-700">
                Mục tiêu học tập
              </label>
              <textarea
                id="learningGoals"
                name="learningGoals"
                value={formData.learningGoals}
                onChange={handleChange}
                rows={2}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                placeholder="Bạn muốn đạt được điều gì từ việc học trực tuyến?"
              />
            </div>

            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-700">Liên kết mạng xã hội</div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="https://website-cua-ban.com"
                />
              </div>

              <div>
                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700">
                  Facebook
                </label>
                <input
                  type="text"
                  id="facebook"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="username"
                />
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                  LinkedIn
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="flex justify-end pt-5">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

