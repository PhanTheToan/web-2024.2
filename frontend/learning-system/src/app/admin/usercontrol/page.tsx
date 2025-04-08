import type { Metadata } from "next";
import { UserControl } from './usercontrol'; // Sửa cú pháp import

export const metadata: Metadata = {
  title: "Trang quản lý user",
  description: "Trang quản lý user"
};

export default function AdminUserPage() {
  return (
    <>
      <h1 className="text-[38px] font-[700]">Trang quản lý user</h1>
      <UserControl />  {/* Hiển thị UserControl tại đây */}
    </>
  );
}
