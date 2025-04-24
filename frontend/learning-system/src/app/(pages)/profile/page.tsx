"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, User } from "lucide-react"
import { ProfileDetails } from "./profile-details"
import { AccountSettings } from "./account-setting"
import Link from "next/link"

const BASE_URL = process.env.BASE_URL || ""

interface Profile {
  firstName: string
  lastName: string
  email: string
  profileImage?: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/check`, {
          credentials: "include", // quan trọng để gửi cookie
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
      <div className="bg-gray-100 py-3 mb-5">
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

      {/* Avatar và Thông tin */}
      <div className="mb-5 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={
                profile?.profileImage ||
                "https://fagopet.vn/storage/in/r5/inr5f4qalj068szn2bs34qmv28r2_phoi-giong-meo-munchkin.webp"
              }
              alt="Avatar"
            />
            <AvatarFallback>HV</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {profile ? `${profile.username}` : "Đang tải..."}
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
      </Tabs>
    </div>
  )
}
