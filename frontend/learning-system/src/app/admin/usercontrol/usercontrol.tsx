"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import * as dotenv from "dotenv"
import { Trash2, Edit, Undo } from "lucide-react"
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
  const [selectedRole, setSelectedRole] = useState<string>("ROLE_USER");
  const [showInactive, setShowInactive] = useState(false)
  const [isPermanentDeleteModalOpen, setIsPermanentDeleteModalOpen] = useState(false);
  const [confirmUsernameInput, setConfirmUsernameInput] = useState("");
  const [userToPermanentlyDelete, setUserToPermanentlyDelete] = useState<{ userId: string; username: string } | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError((err as Error).message || "Lỗi kết nối, vui lòng thử lại sau!");
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
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      alert(`Lỗi kết nối: ${(err as Error).message || err}`);
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

  const handleAdd = () => {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false);  
    setConfirmPassword(""); // Clear confirm password field
  }

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    try {
      const username = (document.getElementById("username") as HTMLInputElement)?.value;
      const email = (document.getElementById("email") as HTMLInputElement)?.value;
      const password = (document.getElementById("password") as HTMLInputElement)?.value;
      const confirmPasswordInput = (document.getElementById("confirmPassword") as HTMLInputElement)?.value;
      const firstName = (document.getElementById("firstName") as HTMLInputElement)?.value;
      const lastName = (document.getElementById("lastName") as HTMLInputElement)?.value;
      const phone = (document.getElementById("phone") as HTMLInputElement)?.value;
      const dateOfBirth = (document.getElementById("dateOfBirth") as HTMLInputElement)?.value;

      if (!username || !email || (!editingUser && !password) || (!editingUser && !confirmPasswordInput) || !firstName || !lastName || !phone || !dateOfBirth) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
        setIsSubmitting(false);
        return;
      }

      if (!editingUser && password !== confirmPasswordInput) {
        alert("Mật khẩu xác nhận không khớp!");
        setIsSubmitting(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Email không hợp lệ!");
        setIsSubmitting(false);
        return;
      }

      const userData = {
        username,
        email,
        password: editingUser ? undefined : password, // Only send password for new users
        firstName,
        lastName,
        role: selectedRole,
        phone,
        dateOfBirth,
        profileImage: null,
        coursesEnrolled: [],
      };

      const apiUrl = editingUser 
        ? `${BASE_URL}/user/editUser/${editingUser.UserId}` 
        : `${BASE_URL}/admin/admin-signup`;

      const response = await fetch(apiUrl, {
        method: editingUser ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      const contentType = response.headers.get("Content-Type");
      let data;

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (response.ok) {
        alert(editingUser ? "Cập nhật tài khoản thành công!" : "Tạo tài khoản thành công!");
        await fetchUserData();
        closeModal();
      } else {
        alert(data.message || (editingUser ? "Không thể cập nhật tài khoản!" : "Không thể tạo tài khoản!"));
      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      alert(`Lỗi kết nối: ${(err as Error).message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPermanentDeleteModal = (userId: string, username: string) => {
    setUserToPermanentlyDelete({ userId, username });
    setConfirmUsernameInput("");
    setIsPermanentDeleteModalOpen(true);
  };

  const handlePermanentDeleteConfirm = async () => {
    if (!userToPermanentlyDelete) return;

    const { userId, username } = userToPermanentlyDelete;

    if (confirmUsernameInput !== username) {
      alert("Username không khớp. Hủy thao tác xóa.");
      return;
    }

    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này? Hành động này không thể hoàn tác.");
    if (!confirmDelete) return;

    try {
      const url = `${BASE_URL}/admin/delete-forever/${userId}`;
      const response = await fetch(url, {
        method: "DELETE",
        credentials: "include",
      });

      const text = await response.text();

      if (response.ok) {
        if (text === "Xóa người dùng thành công") {
          alert("Xóa người dùng thành công!");
          await fetchUserData();
        } else {
          alert("Phản hồi không mong đợi từ server: " + text);
        }
      } else {
        try {
          const data = JSON.parse(text);
          alert(data.message || "Không thể xóa vĩnh viễn người dùng!");
        } catch {
          alert("Lỗi không xác định: " + text);
        }
      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      alert(`Lỗi kết nối: ${(err as Error).message || err}`);
    } finally {
      setIsPermanentDeleteModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="text-center py-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Đang tải dữ liệu người dùng...
          </motion.div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        <div className="text-center text-red-500">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            {error}
          </motion.div>
        </div>
      </div>
    )
  }

  const filteredUsers = userData.filter(user => user.Status === (showInactive ? "INACTIVE" : "ACTIVE"))

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="font-semibold text-2xl text-gray-800">
            <div className="font-semibold text-2xl text-gray-800">
              <motion.div initial={{ x: -20 }} animate={{ x: 0 }}>
                Danh sách người dùng:
              </motion.div>
            </div>
          </div>
          <div onClick={() => setShowInactive(!showInactive)} className={`px-4 py-2 rounded-md text-white transition-colors duration-200 ${showInactive ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}`}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              {showInactive ? "Tài khoản đang hoạt động" : "Tài khoản đã xóa"}
            </motion.button>
          </div>
        </div>
        {!showInactive && (
          <div className="flex gap-3">
            <div onClick={handleAdd} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center transition-colors duration-200">
                Tạo tài khoản
            </div>
          </div>
        )}
      </div>

      <div className="w-full overflow-hidden bg-white shadow-lg rounded-lg">
        <div className="w-full overflow-hidden bg-white shadow-lg rounded-lg">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
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
                      {...{ className: "border-b hover:bg-gray-50 transition-colors duration-200" }}
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
                        <span className={`px-2 py-1 rounded-full text-white ${user.Status === "ACTIVE" ? "bg-green-500" : "bg-red-500"}`}>
                          <motion.span initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                            {user.Status}
                          </motion.span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          {user.Status === "ACTIVE" && (
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-2xl"
                            >
                              <Edit />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user.UserId)}
                            className="text-red-500 hover:text-red-700 transition-colors duration-200 text-2xl"
                          >
                            {user.Status === "ACTIVE" ? <Trash2 /> : <Undo />}
                          </button>
                          {user.Status === "INACTIVE" && (
                            <button
                              onClick={() => openPermanentDeleteModal(user.UserId, user.Username)}
                              className="text-red-700 hover:text-red-900 transition-colors duration-200 text-2xl"
                            >
                              <Trash2 />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
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
                  <>
                    <div className="mb-4">
                      <label className="block mb-2">Mật khẩu *</label>
                      <input
                        id="password"
                        type="password"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-2">Xác nhận mật khẩu *</label>
                      <input
                        id="confirmPassword"
                        type="password"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </>
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
                  <label className="block mb-2">Vai trò *</label>
                  <select
                    id="role"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="ROLE_USER">User</option>
                    <option value="ROLE_TEACHER">Teacher</option>
                    <option value="ROLE_ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-2">
                  <div onClick={closeModal} className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors duration-200">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Hủy
                    </motion.button>
                  </div>
                  <div onClick={handleSubmit} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      {editingUser ? "Cập nhật" : "Tạo tài khoản"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <h3 className="text-xl font-semibold mb-4">Xác nhận</h3>
                <p className="mb-4">
                  {showInactive
                    ? "Bạn chắc chắn muốn khôi phục người dùng này?"
                    : "Bạn chắc chắn muốn xóa người dùng này?"}
                </p>
                <div className="flex justify-end space-x-2">
                  <div onClick={() => setIsDeleteConfirmOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors duration-200">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Hủy
                    </motion.button>
                  </div>
                  <div onClick={handleDeleteConfirm} className={`text-white px-4 py-2 rounded-md transition-colors duration-200 ${showInactive ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      {showInactive ? "Khôi phục" : "Xóa"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {isPermanentDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-xl font-semibold mb-4">Xác nhận xóa vĩnh viễn</h3>
              <p className="mb-4">Vui lòng nhập &quot;{userToPermanentlyDelete?.username}&quot; để xác nhận xóa vĩnh viễn:</p>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 mb-4"
                value={confirmUsernameInput}
                onChange={(e) => setConfirmUsernameInput(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <div onClick={() => setIsPermanentDeleteModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors duration-200">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 98 }}>
                    Hủy
                  </motion.button>
                </div>
                <div onClick={handlePermanentDeleteConfirm} className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Xóa vĩnh viễn
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserControl