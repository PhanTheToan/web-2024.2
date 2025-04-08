import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import AccordionItem from "./FAQs";

export const metadata: Metadata = {
  title: "Câu hỏi thường gặp",
  description: "Trang Câu hỏi thường gặp về hệ thống khóa học",
};

export default function FAQsPage() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 pb-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Trang chủ
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">FAQs</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto flex-1 py-8 px-4">
        <h2 className="text-2xl font-bold mb-8">Câu hỏi thường gặp</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cột 1 */}
          <div className="space-y-4">
            <AccordionItem 
              title="Làm thế nào để đăng ký khóa học?" 
              content="Bạn có thể đăng ký khóa học bằng cách tạo tài khoản, tìm kiếm khóa học phù hợp và nhấn vào nút 'Đăng ký'."
            />
            <AccordionItem 
              title="Tôi có thể học trên điện thoại không?" 
              content="Có, hệ thống hỗ trợ học tập trên điện thoại di động thông qua trình duyệt hoặc ứng dụng (nếu có)."
            />
            <AccordionItem 
              title="Khóa học có thời hạn không?" 
              content="Tùy vào từng khóa học, một số khóa có thời hạn cố định, trong khi số khác có thể học trọn đời."
            />
          </div>

          {/* Cột 2 */}
          <div className="space-y-4">
            <AccordionItem 
              title="Có chứng chỉ sau khi hoàn thành khóa học không?" 
              content="Có, sau khi hoàn thành khóa học và bài kiểm tra, bạn sẽ nhận được chứng chỉ hoàn thành."
            />
            <AccordionItem 
              title="Tôi có thể hoàn tiền nếu không hài lòng?" 
              content="Bạn có thể yêu cầu hoàn tiền trong vòng 7 ngày nếu không hài lòng với khóa học."
            />
            <AccordionItem 
              title="Làm thế nào để liên hệ với giảng viên?" 
              content="Bạn có thể gửi tin nhắn hoặc tham gia diễn đàn thảo luận trong khóa học để đặt câu hỏi cho giảng viên."
            />
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Image
            src="/images/Frame _14.png"
            alt="Hình minh họa FAQ"
            width={1000}
            height={800}
            className="max-w-full"
          />
        </div>
      </main>
    </>
  );
}
