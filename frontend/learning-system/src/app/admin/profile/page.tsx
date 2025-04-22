"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, KeyRound, Settings, User, Users } from "lucide-react"
import { ProfileDetails } from "./profile-details"
import { AccountSettings } from "./account-setting"
import Link from "next/link"

export default function ProfilePage() {
  return (
    <div className="container mx-auto">
      <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder.svg?height=80&width=80" alt="Avatar" />
            <AvatarFallback>HV</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Nguyễn Văn A</h1>
            <p className="text-muted-foreground">nguyenvana@example.com</p>
          </div>
        </div>
      </div>
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
        <TabsContent value="management">
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
                  Chức năng này cho phép bạn quản lý tất cả dữ liệu truy nhập của người dùng.
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
                  Chức năng này cho phép bạn xem thông tin người dùng và thay đổi mật khẩu khách hàng.
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
                  Chức năng này cho phép bạn cập nhật tỷ giá tiền tệ, đơn giá cân và hình ảnh theo thời gian thực.
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
