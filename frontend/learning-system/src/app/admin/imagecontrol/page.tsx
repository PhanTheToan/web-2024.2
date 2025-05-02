import type { Metadata } from "next";
import { Imagecontrol } from './imagecontrol'; 

export const metadata: Metadata = {
  title: "Trang quản lý ảnh",
  description: "Trang quản lý ảnh"
};

export default function AdminUserPage() {
  return (
    <>
      <Imagecontrol />  
    </>
  );
}
