import type { Metadata } from "next";
import CategoryControl from "./categorycontrol";

export const metadata: Metadata = {
  title: "Trang quản lý danh mục",
  description: "Trang quản lý danh mục",
};

export default function AdminCategoryPage() {
  return (
    <>
      <CategoryControl />
    </>
  );
}