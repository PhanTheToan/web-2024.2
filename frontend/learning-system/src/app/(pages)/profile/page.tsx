import type { Metadata } from "next";
import UserProfilePage from "./UserProfilePage";

export const metadata: Metadata = {
  title: "Trang Profile",
  description: "Trang Profile"
};

export default function CoursePage() {
  return (
    <>
      <UserProfilePage />
    </>
  )
}