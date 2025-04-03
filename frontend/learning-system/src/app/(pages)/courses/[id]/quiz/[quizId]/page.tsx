import type { Metadata } from "next";
import QuizPage from "./QuizPage";

export const metadata: Metadata = {
  title: "Làm bài kiểm tra",
  description: "Trang làm bài kiểm tra"
};

export default function QuizPageWrapper() {
  return (
    <>
      <QuizPage />
    </>
  );
} 