"use client"; // Đảm bảo trang này là trang client-side
import { useState, useEffect } from "react";
import * as dotenv from "dotenv";
dotenv.config();

interface User {
  UserId: string;
  Username: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  DateOfBirth: string;
  Role: string;
  Status: string;
}

export const UserControl = () => {
  const [userData, setUserData] = useState<User[]>([]); // Lưu trữ mảng người dùng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null); // Thông tin người dùng đang chỉnh sửa
  const [isModalOpen, setIsModalOpen] = useState(false); // Kiểm tra modal có mở hay không
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // Kiểm tra popup xóa có mở hay không
  const [userToDelete, setUserToDelete] = useState<string | null>(null); // Người dùng cần xóa

  const BASE_URL = process.env.BASE_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/user`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok) {
          setUserData(data.body); // Dữ liệu người dùng nằm trong trường 'body' của API
        } else {
          setError(data.message || "Không thể lấy thông tin người dùng!");
        }
      } catch (err) {
        setError("Lỗi kết nối, vui lòng thử lại sau!");
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true); // Mở modal để chỉnh sửa
  };

  const handleDelete = (userId: string) => {
    setUserToDelete(userId);
    setIsDeleteConfirmOpen(true); // Mở popup xác nhận xóa
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        const response = await fetch(`${BASE_URL}/user/${userToDelete}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          setUserData(userData.filter((user) => user.UserId !== userToDelete)); // Xóa người dùng khỏi mảng
          setIsDeleteConfirmOpen(false); // Đóng popup
        } else {
          alert("Không thể xóa người dùng!");
        }
      } catch (err) {
        alert("Lỗi kết nối, vui lòng thử lại sau!");
      }
    }
  };

  const handleAdd = () => {
    setEditingUser(null); // Reset thông tin người dùng khi thêm mới
    setIsModalOpen(true); // Mở modal để thêm người dùng mới
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = () => {
    // Gửi dữ liệu thêm hoặc sửa người dùng vào API ở đây
    alert("Đã gửi thông tin!");
    closeModal();
  };

  if (loading) {
    return <div className="text-center py-4">Đang tải dữ liệu người dùng...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h3 className="font-semibold text-2xl text-gray-800 mb-6">Danh sách người dùng:</h3>

      {/* Nút Thêm người dùng */}
      <div className="mb-4">
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Thêm người dùng
        </button>
      </div>

      {/* Hiển thị bảng người dùng */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
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
              <th className="px-6 py-3 font-medium">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((user) => (
              <tr key={user.UserId} className="border-b hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4">{user.Username}</td>
                <td className="px-6 py-4">{user.FirstName} {user.LastName}</td>
                <td className="px-6 py-4">{user.Email}</td>
                <td className="px-6 py-4">{user.Phone}</td>
                <td className="px-6 py-4">{new Date(user.DateOfBirth).toLocaleDateString()}</td>
                <td className="px-6 py-4">{user.Role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-white ${user.Status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {user.Status}
                  </span>
                </td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(user.UserId)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm/Sửa người dùng */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">{editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng"}</h3>
            <div className="mb-4">
              <label className="block mb-2">Tên đăng nhập</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md"
                defaultValue={editingUser?.Username || ""}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">Email</label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded-md"
                defaultValue={editingUser?.Email || ""}
              />
            </div>
            {/* Thêm các trường khác ở đây */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeModal}
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                {editingUser ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup xác nhận xóa */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Xác nhận xóa</h3>
            <p className="mb-4">Bạn chắc chắn muốn xóa người dùng này?</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
