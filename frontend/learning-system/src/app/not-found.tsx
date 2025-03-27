import { Metadata } from "next";
import Link from "next/link";
import Image from 'next/image';

export const metadata: Metadata = {
  title: "404 Not Found",
  description: "Không tìm thấy trang này.",
};

export default function NotFoundPage() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 pb-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-gray-500 hover:text-gray-700">
              Homepage
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-500">Errors</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-2xl font-bold">Error</h2>

          <div className="flex justify-center">
            <Image
              src="/images/Frame.png"
              width={600}
              height={400}
              alt="Error illustration"
              className="max-w-full h-auto"
            />
          </div>
        </div>
      </main>
    </>
  );
}
