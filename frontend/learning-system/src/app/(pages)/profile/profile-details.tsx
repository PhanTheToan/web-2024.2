"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export function ProfileDetails() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState({
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "0912345678",
    dob: "01/01/1995",
    gender: "male",
    address: "123 Đường ABC, Quận XYZ, TP. Hồ Chí Minh",
    bio: "Tôi là một học viên đam mê học hỏi và phát triển bản thân thông qua các khóa học trực tuyến.",
  })

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    // Here you would typically save the profile data to your backend
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {isEditing ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input
                id="fullName"
                value={profile.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => handleChange("email", e.target.value)}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" value={profile.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Ngày sinh</Label>
              <Input id="dob" value={profile.dob} onChange={(e) => handleChange("dob", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select value={profile.gender} onValueChange={(value) => handleChange("gender", value)}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input id="address" value={profile.address} onChange={(e) => handleChange("address", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Giới thiệu bản thân</Label>
            <Textarea id="bio" rows={4} value={profile.bio} onChange={(e) => handleChange("bio", e.target.value)} />
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
              <h3 className="font-medium text-muted-foreground">Họ và tên</h3>
              <p>{profile.fullName}</p>
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
              <p>{profile.dob}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Giới tính</h3>
              <p>{profile.gender === "male" ? "Nam" : profile.gender === "female" ? "Nữ" : "Khác"}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Địa chỉ</h3>
              <p>{profile.address}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-muted-foreground">Giới thiệu bản thân</h3>
            <p>{profile.bio}</p>
          </div>
          <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
        </>
      )}
    </div>
  )
}

