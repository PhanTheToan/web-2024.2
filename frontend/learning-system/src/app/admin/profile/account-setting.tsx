"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import Link from "next/link"
import { useEffect, useState } from "react"

const BASE_URL = process.env.BASE_URL || ""

export function AccountSettings() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [userId, setUserId] = useState("")

  // Lấy userId từ API xác thực
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/check`, {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setUserId(data?.data?.id || "") // Gán userId từ backend
        }
      } catch (err) {
        console.error("Error fetching user ID:", err)
      }
    }
    fetchUser()
  }, [])

  const handleDelete = async () => {
    if (!userId) {
      alert("Không tìm thấy ID người dùng.")
      return
    }

    if (confirm("Bạn có chắc chắn muốn xóa tài khoản này không?")) {
      setIsDeleting(true)
      try {
        const response = await fetch(`${BASE_URL}/user/delete-user/${userId}`, {
          method: "DELETE",
          credentials: "include",
        })

        if (response.ok) {
          alert("Tài khoản đã được xóa thành công")
          // Có thể chuyển hướng tại đây
        } else {
          alert("Có lỗi xảy ra khi xóa tài khoản")
        }
      } catch (error) {
        console.error("Error deleting account:", error)
        alert("Đã xảy ra lỗi khi xóa tài khoản")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Cập nhật mật khẩu để bảo vệ tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/reset-password">
            <Button>Cập nhật mật khẩu</Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông báo</CardTitle>
          <CardDescription>Quản lý cài đặt thông báo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Các thiết lập thông báo */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Thông báo qua email</Label>
              <p className="text-sm text-muted-foreground">Nhận thông báo về khóa học qua email</p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ngôn ngữ</CardTitle>
          <CardDescription>Chọn ngôn ngữ hiển thị</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue="vietnamese">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vietnamese" id="vietnamese" />
              <Label htmlFor="vietnamese">Tiếng Việt</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="english" id="english" />
              <Label htmlFor="english">Tiếng Anh</Label>
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button>Lưu cài đặt</Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Xóa tài khoản</CardTitle>
          <CardDescription>Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Khi bạn xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa tài khoản"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
