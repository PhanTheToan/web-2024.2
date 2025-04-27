'use client';

import { useState, useEffect } from "react";

const BASE_URL = process.env.BASE_URL || ""

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
    saveInfo: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Lấy thông tin từ localStorage khi load trang
  useEffect(() => {
    const savedName = localStorage.getItem('contactName');
    const savedEmail = localStorage.getItem('contactEmail');
    if (savedName && savedEmail) {
      setFormData((prev) => ({
        ...prev,
        name: savedName,
        email: savedEmail,
        saveInfo: true,
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, saveInfo: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${BASE_URL}/email/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: formData.comment,
          fullName: formData.name,
          email: formData.email,
        }),
      });

      if (response.ok) {
        setMessage('Gửi phản hồi thành công!');
        
        // Lưu thông tin nếu checkbox được chọn
        if (formData.saveInfo) {
          localStorage.setItem('contactName', formData.name);
          localStorage.setItem('contactEmail', formData.email);
        } else {
          localStorage.removeItem('contactName');
          localStorage.removeItem('contactEmail');
        }

        // Reset form sau khi gửi thành công
        setFormData({
          name: '',
          email: '',
          comment: '',
          saveInfo: false,
        });
      } else {
        const errorData = await response.json();
        setMessage(`Lỗi: ${errorData.message || 'Không thể gửi phản hồi.'}`);
      }
    } catch (error) {
      console.error('Gửi lỗi:', error);
      setMessage('Có lỗi xảy ra khi gửi phản hồi.');
    } finally {
      setLoading(false);

      // Thông báo gửi thành công sẽ mất sau 5s
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    }
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

        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md"
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-green-600">{message}</p>
        )}
      </form>
    </div>
  );
}
