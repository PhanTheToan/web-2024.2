"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CalendarIcon, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const BASE_URL = "https://api.alphaeducation.io.vn/api/blog"

interface BlogPost {
  id: string
  title: string
  slug: string
  image?: string
  content?: string
  refer?: string
  createdAt: number[]
  formattedDate?: string
}

interface PaginationItem {
  type: "page" | "ellipsis"
  value?: number
}

export default function BlogPage() {
  const [loading, setLoading] = useState<boolean>(false)
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const itemsPerPage = 9

  const formatDate = (createdAtArray: number[]) => {
    const [year, month, day, hour, minute, second] = createdAtArray
    const date = new Date(year, month - 1, day, hour, minute, second)
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
    return date.toLocaleDateString(undefined, options)
  }

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true)

        // Always fetch the first page of posts for client-side title filtering
        const response = await fetch(`${BASE_URL}?page=1&limit=${itemsPerPage * totalPages}`)
        if (!response.ok) throw new Error("Failed to fetch blog posts")
        const data = await response.json()
        const posts: BlogPost[] = Array.isArray(data) ? data : data.items || []

        // Format date
        let formattedPosts = posts.map(post => ({
          ...post,
          formattedDate: formatDate(post.createdAt),
        }))

        // If searching, only include those whose title contains the term (case-insensitive)
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase()
          formattedPosts = formattedPosts.filter(post => post.title?.toLowerCase().includes(term))
        }

        // Pagination for client-side filtered results
        const total = formattedPosts.length
        const totalPagesCalc = Math.ceil(total / itemsPerPage)
        const startIdx = (currentPage - 1) * itemsPerPage
        const paginated = formattedPosts.slice(startIdx, startIdx + itemsPerPage)

        setBlogPosts(paginated)
        setTotalItems(total)
        setTotalPages(totalPagesCalc)
      } catch (error) {
        console.error("Error fetching blog posts:", error)
      } finally {
        setLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchBlogPosts, 300)
    return () => clearTimeout(timeoutId)
  }, [currentPage, searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const generatePaginationItems = (): PaginationItem[] => {
    const items: PaginationItem[] = []
    const maxVisiblePages = 5
    items.push({ type: "page", value: 1 })

    if (totalPages <= maxVisiblePages) {
      for (let i = 2; i <= totalPages; i++) items.push({ type: "page", value: i })
    } else {
      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) items.push({ type: "page", value: i })
        items.push({ type: "ellipsis" })
        items.push({ type: "page", value: totalPages })
      } else if (currentPage >= totalPages - 2) {
        items.push({ type: "ellipsis" })
        for (let i = totalPages - 3; i <= totalPages; i++) if (i > 1) items.push({ type: "page", value: i })
      } else {
        items.push({ type: "ellipsis" })
        for (let i = currentPage - 1; i <= currentPage + 1; i++) items.push({ type: "page", value: i })
        items.push({ type: "ellipsis" })
        items.push({ type: "page", value: totalPages })
      }
    }
    return items
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gray-100 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-orange-500">Trang chủ</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700">Blog</span>
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Kho bài viết</h1>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search by title..."
                className="pl-10"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="mb-4 text-sm text-gray-500">
            {loading ? (
              <span>Loading...</span>
            ) : (
              <span>
                Đang hiển thị trang {currentPage} / {totalPages} (tổng cộng {totalItems} bài viết)
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {blogPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogPosts.map((post, index) => (
                    <Link
                      key={post.id || index}
                      href={post.refer || '/'}
                      className="bg-white rounded-lg overflow-hidden border flex flex-col h-full group"
                    >
                      <div className="relative h-48">
                        <img
                          src={post.image || `/placeholder.svg?height=200&width=300`}
                          alt={post.title || "Blog post thumbnail"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                        <h2 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-orange-500">
                          {post.title}
                        </h2>
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <CalendarIcon size={14} className="mr-1" />
                          <span>{post.formattedDate}</span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-3 flex-grow">
                          {post.content}
                        </p>
                        {post.refer && (
                          <span className="mt-3 text-orange-500 group-hover:text-orange-600 text-sm font-medium">
                            Chi tiết
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : searchTerm ? (
                // Đang search mà không có kết quả → không hiển thị gì
                null
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Loading</p>
                </div>
              )}

              {!searchTerm && totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {generatePaginationItems().map((item, index) =>
                      item.type === "ellipsis" ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-2">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={`page-${item.value}`}
                          variant={currentPage === item.value ? "default" : "outline"}
                          onClick={() => item.value && handlePageChange(item.value)}
                          className={`h-9 w-9 p-0 ${
                            currentPage === item.value ? "bg-orange-500 text-white border-orange-500" : ""
                          }`}
                        >
                          {item.value}
                        </Button>
                      )
                    )}

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
