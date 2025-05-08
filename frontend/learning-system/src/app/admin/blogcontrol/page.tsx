import type { Metadata } from "next";
import BlogControl from "./blogcontrol";

export const metadata: Metadata = {
  title: "Trang quản lý blog",
  description: "Trang quản lý blog",
};

export default function AdminBlogPage() {
  return (
    <>
      <BlogControl />
    </>
  );
}