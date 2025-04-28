"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, ClipboardList, GraduationCap, Settings, User, Users } from "lucide-react"
import { ProfileDetails } from "./profile-details"
import { AccountSettings } from "./account-setting"
import Link from "next/link"

const BASE_URL = process.env.BASE_URL || ""

interface Profile {
  username: string
  email: string
  profileImage?: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/check`, {
          credentials: "include",
        })
        const json = await res.json()
        if (res.ok) {
          setProfile(json.data)
        } else {
          console.error("Lỗi khi lấy thông tin người dùng", json.message)
        }
      } catch (err) {
        console.error("Lỗi kết nối", err)
      }
    }

    fetchProfile()
  }, [])

  return (
    <div className="container mx-auto">
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-3 mb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-orange-500">
              Homepage
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700">Profile</span>
          </div>
        </div>
      </div>
      {/* Header Profile */}
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={
                profile?.profileImage ||
                "/placeholder.svg?height=80&width=80"
              }
              alt="Avatar"
            />
            <AvatarFallback>HV</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {profile ? profile.username : "Đang tải..."}
            </h1>
            <p className="text-muted-foreground">
              {profile ? profile.email : "Đang tải email..."}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Hồ sơ</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Cài đặt</span>
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Quản lý Website</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Hồ sơ */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileDetails />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Cài đặt */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt tài khoản</CardTitle>
              <CardDescription>Quản lý cài đặt tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <AccountSettings />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Quản lý */}
        {/* <TabsContent value="management">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-100 to-green-300">
                <img
                  src="/placeholder.svg?height=192&width=384"
                  alt="Class Management"
                  className="h-full w-full object-cover opacity-70"
                />
              </div>
              <CardHeader>
                <CardTitle>Quản Lý Lớp Học</CardTitle>
                <CardDescription>
                  Chức năng này cho phép bạn quản lý các lớp học, lịch giảng dạy và thông tin chi tiết về lớp.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/teacher/classes">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Truy cập
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-100 to-green-300">
                <img
                  src="/placeholder.svg?height=192&width=384"
                  alt="Student Management"
                  className="h-full w-full object-cover opacity-70"
                />
              </div>
              <CardHeader>
                <CardTitle>Quản Lý Học Viên</CardTitle>
                <CardDescription>
                  Chức năng này cho phép bạn xem danh sách học viên, theo dõi tiến độ và quản lý điểm số.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/teacher/students">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <Users className="mr-2 h-4 w-4" />
                    Truy cập
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-100 to-green-300">
                <img
                  src="/placeholder.svg?height=192&width=384"
                  alt="Teaching Materials"
                  className="h-full w-full object-cover opacity-70"
                />
              </div>
              <CardHeader>
                <CardTitle>Tài Liệu Giảng Dạy</CardTitle>
                <CardDescription>
                  Chức năng này cho phép bạn tạo, cập nhật và quản lý tài liệu giảng dạy, bài tập và tài nguyên học tập.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/teacher/materials">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Truy cập
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent> */}
      </Tabs>
    </div>
  )
}


// "use client"

// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { ClipboardList, GraduationCap, Settings, User, Users } from "lucide-react"
// import { ProfileDetails } from "./profile-details"
// import { AccountSettings } from "./account-setting"
// import Link from "next/link"

// export default function TeacherProfilePage() {
//   return (
//     <div className="container mx-auto">
//       <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
//         <div className="flex items-center gap-4">
//           <Avatar className="h-20 w-20">
//             <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Avatar" />
//             <AvatarFallback>GV</AvatarFallback>
//           </Avatar>
//           <div>
//             <h1 className="text-2xl font-bold">Nguyễn Thị B</h1>
//             <p className="text-muted-foreground">nguyenthib@example.com</p>
//           </div>
//         </div>
//         <Button>Chỉnh sửa hồ sơ</Button>
//       </div>
//       <Tabs defaultValue="profile" className="w-full">
//         <TabsList className="grid w-full grid-cols-3 md:w-auto">
//           <TabsTrigger value="profile" className="flex items-center gap-2">
//             <User className="h-4 w-4" />
//             <span className="hidden md:inline">Hồ sơ</span>
//           </TabsTrigger>
//           <TabsTrigger value="settings" className="flex items-center gap-2">
//             <Settings className="h-4 w-4" />
//             <span className="hidden md:inline">Cài đặt</span>
//           </TabsTrigger>
//           <TabsTrigger value="management" className="flex items-center gap-2">
//             <GraduationCap className="h-4 w-4" />
//             <span className="hidden md:inline">Quản lý Giảng dạy</span>
//           </TabsTrigger>
//         </TabsList>
//         <TabsContent value="profile">
//           <Card>
//             <CardHeader>
//               <CardTitle>Thông tin cá nhân</CardTitle>
//               <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ProfileDetails />
//             </CardContent>
//           </Card>
//         </TabsContent>
//         <TabsContent value="settings">
//           <Card>
//             <CardHeader>
//               <CardTitle>Cài đặt tài khoản</CardTitle>
//               <CardDescription>Quản lý cài đặt tài khoản của bạn</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <AccountSettings />
//             </CardContent>
//           </Card>
//         </TabsContent>
//         <TabsContent value="management">
//           <div className="grid gap-6 md:grid-cols-3">
//             <Card className="overflow-hidden">
//               <div className="h-48 bg-gradient-to-br from-green-100 to-green-300">
//                 <img
//                   src="/placeholder.svg?height=192&width=384"
//                   alt="Class Management"
//                   className="h-full w-full object-cover opacity-70"
//                 />
//               </div>
//               <CardHeader>
//                 <CardTitle>Quản Lý Lớp Học</CardTitle>
//                 <CardDescription>
//                   Chức năng này cho phép bạn quản lý các lớp học, lịch giảng dạy và thông tin chi tiết về lớp.
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Link href="/teacher/classes">
//                   <Button className="w-full bg-green-600 hover:bg-green-700">
//                     <GraduationCap className="mr-2 h-4 w-4" />
//                     Truy cập
//                   </Button>
//                 </Link>
//               </CardContent>
//             </Card>

//             <Card className="overflow-hidden">
//               <div className="h-48 bg-gradient-to-br from-green-100 to-green-300">
//                 <img
//                   src="/placeholder.svg?height=192&width=384"
//                   alt="Student Management"
//                   className="h-full w-full object-cover opacity-70"
//                 />
//               </div>
//               <CardHeader>
//                 <CardTitle>Quản Lý Học Viên</CardTitle>
//                 <CardDescription>
//                   Chức năng này cho phép bạn xem danh sách học viên, theo dõi tiến độ và quản lý điểm số.
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Link href="/teacher/students">
//                   <Button className="w-full bg-green-600 hover:bg-green-700">
//                     <Users className="mr-2 h-4 w-4" />
//                     Truy cập
//                   </Button>
//                 </Link>
//               </CardContent>
//             </Card>

//             <Card className="overflow-hidden">
//               <div className="h-48 bg-gradient-to-br from-green-100 to-green-300">
//                 <img
//                   src="/placeholder.svg?height=192&width=384"
//                   alt="Teaching Materials"
//                   className="h-full w-full object-cover opacity-70"
//                 />
//               </div>
//               <CardHeader>
//                 <CardTitle>Tài Liệu Giảng Dạy</CardTitle>
//                 <CardDescription>
//                   Chức năng này cho phép bạn tạo, cập nhật và quản lý tài liệu giảng dạy, bài tập và tài nguyên học tập.
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <Link href="/teacher/materials">
//                   <Button className="w-full bg-green-600 hover:bg-green-700">
//                     <ClipboardList className="mr-2 h-4 w-4" />
//                     Truy cập
//                   </Button>
//                 </Link>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   )
// }
