"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {  Settings, User } from "lucide-react"
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
              Trang chủ
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700">Trang cá nhân</span>
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
        <TabsList className="grid w-full grid-cols-2 md:w-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Hồ sơ</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Cài đặt</span>
          </TabsTrigger>
          {/* <TabsTrigger value="management" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:inline">Quản lý Website</span>
          </TabsTrigger> */}
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
              <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-300">
                <img
                  src="/placeholder.svg?height=192&width=384"
                  alt="User Management"
                  className="h-full w-full object-cover opacity-70"
                />
              </div>
              <CardHeader>
                <CardTitle>Quản Lý User</CardTitle>
                <CardDescription>
                  Chức năng này cho phép bạn quản lý dữ liệu truy nhập của người dùng.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/users">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <Users className="mr-2 h-4 w-4" />
                    Truy cập
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-300">
                <img
                  src="/placeholder.svg?height=192&width=384"
                  alt="Password Management"
                  className="h-full w-full object-cover opacity-70"
                />
              </div>
              <CardHeader>
                <CardTitle>Đổi Mật Khẩu</CardTitle>
                <CardDescription>
                  Xem và thay đổi mật khẩu người dùng.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/passwords">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Truy cập
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-300">
                <img
                  src="/placeholder.svg?height=192&width=384"
                  alt="Course Management"
                  className="h-full w-full object-cover opacity-70"
                />
              </div>
              <CardHeader>
                <CardTitle>Quản Lý Khóa Học</CardTitle>
                <CardDescription>
                  Cập nhật đơn giá, hình ảnh và tỷ giá theo thời gian thực.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/courses">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    <BookOpen className="mr-2 h-4 w-4" />
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
