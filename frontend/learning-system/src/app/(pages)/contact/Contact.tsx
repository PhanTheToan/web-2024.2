"use client";

import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
    saveInfo: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, saveInfo: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Đã gửi form:", formData);
    // Ở đây có thể gửi dữ liệu lên backend
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4">Liên hệ với chúng tôi</h2>
      <p className="text-gray-600 mb-6">Email của bạn sẽ không được hiển thị công khai. Các trường bắt buộc được đánh dấu *</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              id="name"
              name="name"
              placeholder="Họ và tên *"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md"
            />
          </div>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md"
            />
          </div>
        </div>

        <div>
          <textarea
            id="comment"
            name="comment"
            placeholder="Ý kiến đóng góp"
            value={formData.comment}
            onChange={handleChange}
            className="w-full p-3 border rounded-md min-h-[150px]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="saveInfo"
            checked={formData.saveInfo}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="saveInfo" className="text-sm text-gray-600">
            Lưu thông tin của tôi cho lần liên hệ sau
          </label>
        </div>

        <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md">
          Gửi phản hồi
        </button>
      </form>
    </div>
  );
}
