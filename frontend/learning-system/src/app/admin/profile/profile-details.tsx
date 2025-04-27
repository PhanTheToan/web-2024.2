"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

const BASE_URL = process.env.BASE_URL || ""

export function ProfileDetails() {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [profile, setProfile] = useState({
    id: "Truyen Id nguoi dung",
    username: "hoande",
    firstName: "John",
    lastName: "Doe",
    email: "johndoe@example.com",
    phone: "123-456-7890",
    createdAt: "1990-01-01",
    gender: "Male",
    profileImage: "http://example.com/profile.jpg",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/check`, {
          method: "GET",
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.data) {
            const { createdAt, ...rest } = data.data
            const formattedDateOfBirth = `${createdAt[0]}-${String(createdAt[1]).padStart(2, '0')}-${String(createdAt[2]).padStart(2, '0')}`
            setProfile({ ...rest, createdAt: formattedDateOfBirth })
            setPreviewUrl(data.data.profileImage)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    let imageUrl = profile.profileImage
    const fallbackUrl = "https://pub-82683fceb06e4dd98da0d728fdcd9630.r2.dev/1745549344137_SVjDV7m0W1uU3m4KLXHu33bV4Pmg7LxYGRNCxKCW44g.jpg"
  
    if (selectedFile) {
      const formData = new FormData()
      formData.append("file", selectedFile)
  
      try {
        const res = await fetch(`${BASE_URL}/api/upload`, {
          method: "POST",
          body: formData,
        })
  
        if (res.ok) {
          const data = await res.json()
          imageUrl = data.url || fallbackUrl
        } else {
          console.warn("Upload ảnh thất bại, dùng ảnh mặc định.")
          imageUrl = fallbackUrl
        }
      } catch (error) {
        console.error("Lỗi khi upload ảnh:", error)
        imageUrl = fallbackUrl
      }
    }
  
    // Loại bỏ createdAt khỏi profile để tránh lỗi
    const { createdAt, ...profileToUpdate } = profile
    const updatedProfile = { ...profileToUpdate, profileImage: imageUrl }
  
    try {
      const response = await fetch(`${BASE_URL}/user/edit`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      })
  
      if (response.ok) {
        alert("Lưu thay đổi thành công")
        setProfile({ ...updatedProfile, createdAt }) // giữ lại createdAt cũ
        setIsEditing(false)
        setSelectedFile(null)
      } else {
        const errorText = await response.text()
        console.error("Lỗi từ server:", errorText)
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
            {/* <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                value={profile.username || ""} disabled
              />
            </div> */}
            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <Input id="username" type="username" value={profile.username || ""} disabled />
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
              <Label htmlFor="dob">Ngày khởi tạo</Label>
              <Input
                id="dob"
                type="date"
                value={profile.createdAt ? profile.createdAt : ''}
                disabled
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
              <Input id="profileImage" type="file" accept="image/*" onChange={handleFileChange} />
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="w-32 h-32 rounded-full object-cover mt-2" />
              )}
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
              <h3 className="font-medium text-muted-foreground">Ngày khởi tạo</h3>
              <p>{profile.createdAt}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Giới tính</h3>
              <p>{profile.gender === "Male" ? "Nam" : profile.gender === "FeMale" ? "Nữ" : "Khác"}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Ảnh đại diện</h3>
              <img src={profile.profileImage || "https://via.placeholder.com/150"} alt="Profile" className="w-32 h-32 rounded-full" />
            </div>
          </div>
          <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
        </>
      )}
    </div>
  )
}
