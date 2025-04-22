import Image from "next/image"
import Link from "next/link"
import { CalendarIcon, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BlogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-orange-500">
              Homepage
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700">Blog</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Blog Posts */}
          <div className="w-full lg:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">All Articles</h1>
              <Link href="/blog/submit-post">
                <Button className="flex items-center gap-2">
                  <PlusCircle size={16} />
                  <span>Submit Post</span>
                </Button>
              </Link>
            </div>

            <div className="space-y-8">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <article
                  key={index}
                  className="flex flex-col md:flex-row gap-6 bg-white rounded-lg overflow-hidden border"
                >
                  <div className="md:w-1/3">
                    <Image
                      src={`/placeholder.svg?height=200&width=300`}
                      alt="Blog post thumbnail"
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 md:w-2/3">
                    <h2 className="text-xl font-semibold mb-2">
                      <Link href="#" className="hover:text-orange-500">
                        Best LearnPress WordPress Theme Collection For 2023
                      </Link>
                    </h2>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <CalendarIcon size={14} className="mr-1" />
                      <span>Jan 24, 2023</span>
                    </div>
                    <p className="text-gray-600">
                      Looking for an amazing & well-functional LearnPress WordPress Theme? Online education...
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-1">
                <Link href="#" className="p-2 text-gray-500 hover:text-orange-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-left"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </Link>
                <Link href="#" className="px-3 py-1 bg-orange-500 text-white rounded-full">
                  1
                </Link>
                <Link href="#" className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-full">
                  2
                </Link>
                <Link href="#" className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-full">
                  3
                </Link>
                <Link href="#" className="p-2 text-gray-500 hover:text-orange-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-right"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </Link>
              </nav>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-1/3">
            {/* Categories */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Category</h3>
              <ul className="space-y-2">
                {[
                  { name: "Commercial", count: 15 },
                  { name: "Office", count: 15 },
                  { name: "Shop", count: 15 },
                  { name: "Educate", count: 15 },
                  { name: "Academy", count: 15 },
                  { name: "Single family home", count: 15 },
                ].map((category, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <Link href="#" className="text-gray-700 hover:text-orange-500">
                      {category.name}
                    </Link>
                    <span className="text-gray-500">{category.count}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Posts */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-20 h-20 flex-shrink-0">
                      <Image
                        src={`/placeholder.svg?height=80&width=80`}
                        alt="Recent post thumbnail"
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">
                        <Link href="#" className="hover:text-orange-500">
                          Best LearnPress WordPress Theme Collection For 2023
                        </Link>
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {["Free courses", "Marketing", "Idea", "LMS", "LearnPress", "Instructor"].map((tag, index) => (
                  <Link
                    key={index}
                    href="#"
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
