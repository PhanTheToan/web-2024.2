"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

const BASE_URL = process.env.BASE_URL || ""

export function ProfileDetails() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    id: "Truyen Id nguoi dung",
    username: "hoande",
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    phone: "123-456-7890",
    dateOfBirth: "1990-01-01", // Sẽ thay đổi dựa trên dữ liệu GET
    gender: "Male",
    profileImage: "http://example.com/profile.jpg",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/check`, {
          method: "GET",
          credentials: "include", // Đảm bảo cookie được gửi
        })

        if (response.ok) {
          const data = await response.json()
          if (data.data) {
            const { dateOfBirth, ...rest } = data.data
            const formattedDateOfBirth = `${dateOfBirth[0]}-${String(dateOfBirth[1]).padStart(2, '0')}-${String(dateOfBirth[2]).padStart(2, '0')}`
            setProfile({ ...rest, dateOfBirth: formattedDateOfBirth })
          }
        } else {
          console.error("Failed to fetch profile")
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/edit`, {
        method: "PUT",
        credentials: "include", // Đảm bảo cookie được gửi
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),  // Gửi profile đã được cập nhật, bao gồm cả ảnh đại diện
      })

      if (response.ok) {
        alert("Lưu thay đổi thành công")
        setIsEditing(false)
      } else {
        alert("Lỗi khi lưu thay đổi")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Đã xảy ra lỗi khi lưu thay đổi")
    }
  }

  return (
    <div className="space-y-6">
      {isEditing ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                value={profile.username || ""}
                onChange={(e) => handleChange("username", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={profile.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" value={profile.phone || ""} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Ngày sinh</Label>
              <Input
                id="dob"
                type="date"
                value={profile.dateOfBirth ? profile.dateOfBirth : ''}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select value={profile.gender || ""} onValueChange={(value) => handleChange("gender", value)}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Nam</SelectItem>
                  <SelectItem value="FeMale">Nữ</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileImage">Ảnh đại diện</Label>
              <Input
                id="profileImage"
                type="text"
                value={profile.profileImage || ""}
                onChange={(e) => handleChange("profileImage", e.target.value)}
                placeholder="Nhập URL ảnh đại diện"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>Lưu thay đổi</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Hủy
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-muted-foreground">Tên đăng nhập</h3>
              <p>{profile.username}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Email</h3>
              <p>{profile.email}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Số điện thoại</h3>
              <p>{profile.phone}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Ngày sinh</h3>
              <p>{profile.dateOfBirth}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Giới tính</h3>
              <p>{profile.gender === "Male" ? "Nam" : profile.gender === "FeMale" ? "Nữ" : "Khác"}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Ảnh đại diện</h3>
              <img src={profile.profileImage || "https://www.google.com/imgres?q=m%C3%A8o&imgurl=https%3A%2F%2Ffagopet.vn%2Fstorage%2Fin%2Fr5%2Finr5f4qalj068szn2bs34qmv28r2_phoi-giong-meo-munchkin.webp"} alt="Profile Image" className="w-32 h-32 rounded-full" />
            </div>
          </div>
          <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
        </>
      )}
    </div>
  )
}
