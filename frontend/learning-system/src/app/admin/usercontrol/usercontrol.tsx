"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as dotenv from "dotenv"
dotenv.config()

interface User {
  UserId: string
  Username: string
  FirstName: string
  LastName: string
  Email: string
  Phone: string
  DateOfBirth: string
  Role: string
  Status: string
}

const BASE_URL = process.env.BASE_URL

export const UserControl = () => {
  const [userData, setUserData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("USER")
  const [showInactive, setShowInactive] = useState(false)

  const fetchUserData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${BASE_URL}/user`, {
        method: "GET",
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok) {
        setUserData(data.body)
      } else {
        setError(data.message || "Không thể lấy thông tin người dùng!")
      }
    } catch (err) {
      setError("Lỗi kết nối, vui lòng thử lại sau!")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleStatusChange = async (userId: string, newStatus: "ACTIVE" | "INACTIVE") => {
    try {
      const url = `${BASE_URL}/admin/delete-user/${userId}`
      const response = await fetch(url, {
        method: "PUT",
        credentials: "include",
      })

      const text = await response.text()
      console.log("Status code:", response.status)
      console.log("Raw response text:", text)

      let data
      try {
        data = JSON.parse(text)
      } catch {
        data = { message: text }
      }

      if (response.ok) {
        console.log(`${newStatus === "INACTIVE" ? "Xóa" : "Khôi phục"} thành công.`)
        setIsDeleteConfirmOpen(false)
        await fetchUserData()
      } else {
        console.warn("Phản hồi lỗi từ server:", data)
        alert(data.message || `Không thể ${newStatus === "INACTIVE" ? "xóa" : "khôi phục"} người dùng!`)
      }
    } catch (err: any) {
      console.error("Lỗi kết nối:", err)
      alert(`Lỗi kết nối: ${err.message || err}`)
    }
  }

  const handleDelete = (userId: string) => {
    setUserToDelete(userId)
    setIsDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      const user = userData.find(u => u.UserId === userToDelete)
      const newStatus = user?.Status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
      await handleStatusChange(userToDelete, newStatus)
    }
  }

  const handleAdd = (role: string) => {
    setEditingUser(null)
    setSelectedRole(role)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmit = async () => {
    try {
      const username = (document.getElementById("username") as HTMLInputElement)?.value
      const email = (document.getElementById("email") as HTMLInputElement)?.value
      const password = (document.getElementById("password") as HTMLInputElement)?.value
      const firstName = (document.getElementById("firstName") as HTMLInputElement)?.value
      const lastName = (document.getElementById("lastName") as HTMLInputElement)?.value
      const phone = (document.getElementById("phone") as HTMLInputElement)?.value
      const dateOfBirth = (document.getElementById("dateOfBirth") as HTMLInputElement)?.value
      const gender = (document.getElementById("gender") as HTMLSelectElement)?.value

      if (!username || !email || !password || !firstName || !lastName || !phone || !dateOfBirth) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc!")
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        alert("Email không hợp lệ!")
        return
      }

      const userData = {
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gender,
        profileImage: null,
        coursesEnrolled: [],
      }

      let apiUrl
      if (selectedRole === "TEACHER") {
        apiUrl = `${BASE_URL}/admin/teacher-signup`
      } else if (selectedRole === "ADMIN") {
        apiUrl = `${BASE_URL}/admin/admin-signup`
      } else {
        apiUrl = `${BASE_URL}/admin/user-signup`
      }

      console.log("Gửi tới:", apiUrl)
      console.log("Dữ liệu gửi đi:", userData)

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      console.log("Phản hồi API:", data)

      if (response.ok) {
        alert("Tạo tài khoản thành công!")
        await fetchUserData()
        closeModal()
      } else {
        alert(data.message || "Không thể tạo tài khoản!")
      }
    } catch (err: any) {
      console.error("Lỗi trong quá trình gửi:", err)
      alert(`Lỗi kết nối: ${err.message || err}`)
    }
  }

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
        Đang tải dữ liệu người dùng...
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center text-red-500">
        {error}
      </motion.div>
    )
  }

  const filteredUsers = userData.filter(user => user.Status === (showInactive ? "INACTIVE" : "ACTIVE"))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <motion.h3 initial={{ x: -20 }} animate={{ x: 0 }} className="font-semibold text-2xl text-gray-800">
            Danh sách người dùng:
          </motion.h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowInactive(!showInactive)}
            className={`px-4 py-2 rounded-md text-white transition-colors duration-200 ${
              showInactive ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"
            }`}
          >
            {showInactive ? "Tài khoản đang hoạt động" : "Tài khoản đã xóa"}
          </motion.button>
        </div>
        {!showInactive && (
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAdd("USER")}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center transition-colors duration-200"
            >
              <span className="mr-2">+</span>
              Tạo tài khoản User
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAdd("TEACHER")}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center transition-colors duration-200"
            >
              <span className="mr-2">+</span>
              Tạo tài khoản Teacher
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAdd("ADMIN")}
              className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 flex items-center transition-colors duration-200"
            >
              <span className="mr-2">+</span>
              Tạo tài khoản Admin
            </motion.button>
          </div>
        )}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="overflow-x-auto bg-white shadow-lg rounded-lg"
      >
        <table className="min-w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium">Username</th>
              <th className="px-6 py-3 font-medium">Họ và tên</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Điện thoại</th>
              <th className="px-6 py-3 font-medium">Ngày sinh</th>
              <th className="px-6 py-3 font-medium">Vai trò</th>
              <th className="px-6 py-3 font-medium">Trạng thái</th>
              <th className="px-6 py-3 font-medium text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.UserId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4">{user.Username}</td>
                  <td className="px-6 py-4">
                    {user.FirstName} {user.LastName}
                  </td>
                  <td className="px-6 py-4">{user.Email}</td>
                  <td className="px-6 py-4">{user.Phone}</td>
                  <td className="px-6 py-4">{new Date(user.DateOfBirth).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{user.Role}</td>
                  <td className="px-6 py-4">
                    <motion.span
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className={`px-2 py-1 rounded-full text-white ${user.Status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`}
                    >
                      {user.Status}
                    </motion.span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      {user.Status === "ACTIVE" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(user)}
                          className="bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600 transition-colors duration-200 flex items-center text-sm"
                        >
                          Sửa
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDelete(user.UserId)}
                        className={`text-white px-3 py-1.5 rounded transition-colors duration-200 flex items-center text-sm ${
                          user.Status === "ACTIVE"
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        {user.Status === "ACTIVE" ? "Xóa" : "Khôi phục"}
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-lg w-1/3"
            >
              <h3 className="text-xl font-semibold mb-4">
                {editingUser ? "Chỉnh sửa người dùng" : `Tạo tài khoản ${selectedRole}`}
              </h3>
              <p className="text-sm text-gray-500 mb-4">Các trường có dấu * là bắt buộc</p>
              <div className="mb-4">
                <label className="block mb-2">Tên đăng nhập *</label>
                <input
                  id="username"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  defaultValue={editingUser?.Username || ""}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Email *</label>
                <input
                  id="email"
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  defaultValue={editingUser?.Email || ""}
                />
              </div>
              {!editingUser && (
                <div className="mb-4">
                  <label className="block mb-2">Mật khẩu *</label>
                  <input
                    id="password"
                    type="password"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2">Họ *</label>
                  <input
                    id="lastName"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    defaultValue={editingUser?.LastName || ""}
                  />
                </div>
                <div>
                  <label className="block mb-2">Tên *</label>
                  <input
                    id="firstName"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    defaultValue={editingUser?.FirstName || ""}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Số điện thoại *</label>
                <input
                  id="phone"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  defaultValue={editingUser?.Phone || ""}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Ngày sinh *</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  defaultValue={editingUser ? new Date(editingUser.DateOfBirth).toISOString().split("T")[0] : ""}
                />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Giới tính *</label>
                <select
                  id="gender"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={closeModal}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors duration-200"
                >
                  Hủy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                >
                  {editingUser ? "Cập nhật" : "Tạo tài khoản"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white p-6 rounded-lg shadow-lg w-1/3"
            >
              <h3 className="text-xl font-semibold mb-4">Xác nhận</h3>
              <p className="mb-4">
                {showInactive
                  ? "Bạn chắc chắn muốn khôi phục người dùng này?"
                  : "Bạn chắc chắn muốn xóa người dùng này?"}
              </p>
              <div className="flex justify-end space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors duration-200"
                >
                  Hủy
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteConfirm}
                  className={`text-white px-4 py-2 rounded-md transition-colors duration-200 ${
                    showInactive ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {showInactive ? "Khôi phục" : "Xóa"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default UserControl