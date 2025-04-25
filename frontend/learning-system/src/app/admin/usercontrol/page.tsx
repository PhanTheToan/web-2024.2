import type { Metadata } from "next";
import { UserControl } from './usercontrol'; // Sửa cú pháp import

export const metadata: Metadata = {
  title: "Trang quản lý user",
  description: "Trang quản lý user"
};

export default function AdminUserPage() {
  return (
    <>
      <UserControl />  
    </>
  );
}
