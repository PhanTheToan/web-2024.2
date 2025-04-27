"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { CalendarIcon, PlusCircle, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com"

const sampleBlogPosts = [
  {
    id: 1,
    title: "1Best LearnPress WordPress Theme Collection For 2023",
    slug: "best-learnpress-theme-2023",
    thumbnail: "/images/sample-image-1.jpg",
    date: "Jan 24, 2023",
    excerpt: "Looking for an amazing & well-functional LearnPress WordPress Theme? Online education is booming, and you need the best theme.",
  },
  {
    id: 2,
    title: "2Top 10 Tips for Effective Learning Management System",
    slug: "top-10-tips-lms",
    thumbnail: "/images/sample-image-2.jpg",
    date: "Feb 10, 2023",
    excerpt: "Effective LMS strategies can significantly improve the learning experience. Check out these tips to get started.",
  },
  {
    id: 3,
    title: "3The Future of E-Learning: Trends to Watch in 2024",
    slug: "future-elearning-2024",
    thumbnail: "/images/sample-image-3.jpg",
    date: "Mar 5, 2023",
    excerpt: "E-Learning is evolving at a rapid pace. Find out what's trending and what you should expect in 2024.",
  },
  {
    id: 4,
    title: "45 Mistakes You Should Avoid When Choosing a WordPress Theme",
    slug: "mistakes-choosing-wordpress-theme",
    thumbnail: "/images/sample-image-4.jpg",
    date: "Apr 12, 2023",
    excerpt: "Choosing the right theme for your WordPress site can make a big difference. Avoid these common mistakes to save time and effort.",
  },
  {
    id: 5,
    title: "5How to Boost Student Engagement with Interactive Content",
    slug: "boost-student-engagement",
    thumbnail: "/images/sample-image-5.jpg",
    date: "Apr 25, 2023",
    excerpt: "Interactive content is a powerful tool for boosting student engagement. Here's how you can implement it effectively.",
  },
  {
    id: 6,
    title: "6The Importance of Mobile Optimization for Your Online Courses",
    slug: "mobile-optimization-online-courses",
    thumbnail: "/images/sample-image-6.jpg",
    date: "May 10, 2023",
    excerpt: "With more users accessing content on mobile devices, mobile optimization is crucial for online courses. Learn the best practices.",
  },
  {
    id: 6,
    title: "7The Importance of Mobile Optimization for Your Online Courses",
    slug: "mobile-optimization-online-courses",
    thumbnail: "/images/sample-image-6.jpg",
    date: "May 10, 2023",
    excerpt: "With more users accessing content on mobile devices, mobile optimization is crucial for online courses. Learn the best practices.",
  },
  {
    id: 6,
    title: "8The Importance of Mobile Optimization for Your Online Courses",
    slug: "mobile-optimization-online-courses",
    thumbnail: "/images/sample-image-6.jpg",
    date: "May 10, 2023",
    excerpt: "With more users accessing content on mobile devices, mobile optimization is crucial for online courses. Learn the best practices.",
  },
  {
    id: 6,
    title: "9The Importance of Mobile Optimization for Your Online Courses",
    slug: "mobile-optimization-online-courses",
    thumbnail: "/images/sample-image-6.jpg",
    date: "May 10, 2023",
    excerpt: "With more users accessing content on mobile devices, mobile optimization is crucial for online courses. Learn the best practices.",
  },
  {
    id: 6,
    title: "10The Importance of Mobile Optimization for Your Online Courses",
    slug: "mobile-optimization-online-courses",
    thumbnail: "/images/sample-image-6.jpg",
    date: "May 10, 2023",
    excerpt: "With more users accessing content on mobile devices, mobile optimization is crucial for online courses. Learn the best practices.",
  },
  {
    id: 6,
    title: "11The Importance of Mobile Optimization for Your Online Courses",
    slug: "mobile-optimization-online-courses",
    thumbnail: "/images/sample-image-6.jpg",
    date: "May 10, 2023",
    excerpt: "With more users accessing content on mobile devices, mobile optimization is crucial for online courses. Learn the best practices.",
  },
  {
    id: 6,
    title: "12The Importance of Mobile Optimization for Your Online Courses",
    slug: "mobile-optimization-online-courses",
    thumbnail: "/images/sample-image-6.jpg",
    date: "May 10, 2023",
    excerpt: "With more users accessing content on mobile devices, mobile optimization is crucial for online courses. Learn the best practices.",
  },
  {
    id: 6,
    title: "13The Importance of Mobile Optimization for Your Online Courses",
    slug: "mobile-optimization-online-courses",
    thumbnail: "/images/sample-image-6.jpg",
    date: "May 10, 2023",
    excerpt: "With more users accessing content on mobile devices, mobile optimization is crucial for online courses. Learn the best practices.",
  },
  {
    id: 6,
    title: "14The Importance of Mobile Optimization for Your Online Courses",
    slug: "mobile-optimization-online-courses",
    thumbnail: "/images/sample-image-6.jpg",
    date: "May 10, 2023",
    excerpt: "With more users accessing content on mobile devices, mobile optimization is crucial for online courses. Learn the best practices.",
  },
  {
    id: 6,
    title: "15The Importance of Mobile Optimization for Your Online Courses",
    slug: "mobile-optimization-online-courses",
    thumbnail: "/images/sample-image-6.jpg",
    date: "May 10, 2023",
    excerpt: "With more users accessing content on mobile devices, mobile optimization is crucial for online courses. Learn the best practices.",
  },
  {
    id: 6,
    title: "16The Importance of Mobile Optimization for Your Online Courses",
    slug: "mobile-optimization-online-courses",
    thumbnail: "/images/sample-image-6.jpg",
    date: "May 10, 2023",
    excerpt: "With more users accessing content on mobile devices, mobile optimization is crucial for online courses. Learn the best practices.",
  },
  {
    id: 6,
    title: "17The Importance of Mobile Optimization for Your Online Courses",
    slug: "mobile-optimization-online-courses",
    thumbnail: "/images/sample-image-6.jpg",
    date: "May 10, 2023",
    excerpt: "With more users accessing content on mobile devices, mobile optimization is crucial for online courses. Learn the best practices.",
  },
]

export default function BlogPage() {
  const [loading, setLoading] = useState(false)
  const [blogPosts, setBlogPosts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const itemsPerPage = 9 // Exactly 9 blog posts per page

  // Fetch blog posts with pagination and search
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true)
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: itemsPerPage.toString(), // Limit to exactly 9 items
          search: searchTerm,
        })

        const response = await fetch(`${BASE_URL}/blog/posts?${queryParams}`)

        if (!response.ok) {
          throw new Error("Failed to fetch blog posts")
        }

        const data = await response.json()
        console.log("Blog posts data:", data)

        // Assuming the API returns { posts: [], total: number, totalPages: number }
        setBlogPosts(data.posts || [])
        setTotalItems(data.total || 0)
        setTotalPages(data.totalPages || Math.ceil((data.total || 0) / itemsPerPage))
      } catch (error) {
        console.error("Error fetching blog posts:", error)
        // Use sample data if there is an error fetching real data
        setBlogPosts(sampleBlogPosts)
        setTotalItems(sampleBlogPosts.length)
        setTotalPages(Math.ceil(sampleBlogPosts.length / itemsPerPage))
      } finally {
        setLoading(false)
      }
    }

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      fetchBlogPosts()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [currentPage, searchTerm])

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  // Handle page change - this will fetch only the blog posts for the selected page
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Generate pagination items with ellipsis
  const generatePaginationItems = () => {
    const items = []
    const maxVisiblePages = 5 // Maximum number of page buttons to show

    // Always show first page
    items.push({ type: "page", value: 1 })

    if (totalPages <= maxVisiblePages) {
      // If few pages, show all
      for (let i = 2; i <= totalPages; i++) {
        items.push({ type: "page", value: i })
      }
    } else {
      // Complex pagination with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 2; i <= 4; i++) {
          items.push({ type: "page", value: i })
        }
        items.push({ type: "ellipsis" })
        items.push({ type: "page", value: totalPages })
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        items.push({ type: "ellipsis" })
        for (let i = totalPages - 3; i <= totalPages; i++) {
          if (i > 1) {
            // Avoid duplicate of first page
            items.push({ type: "page", value: i })
          }
        }
      } else {
        // In the middle
        items.push({ type: "ellipsis" })
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          items.push({ type: "page", value: i })
        }
        items.push({ type: "ellipsis" })
        items.push({ type: "page", value: totalPages })
      }
    }

    return items
  }

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
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">All Articles</h1>
            {/* <Link href="/blog/submit-post">
              <Button className="flex items-center gap-2">
                <PlusCircle size={16} />
                <span>Submit Post</span>
              </Button>
            </Link> */}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Search articles..."
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
                Showing page {currentPage} of {totalPages} ({totalItems} total posts)
              </span>
            )}
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {/* Blog Posts Grid */}
              {blogPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogPosts.map((post, index) => (
                    <article
                      key={post.id || index}
                      className="bg-white rounded-lg overflow-hidden border flex flex-col h-full"
                    >
                      <div className="relative h-48">
                        <Image
                          src={post.thumbnail || `/placeholder.svg?height=200&width=300`}
                          alt={post.title || "Blog post thumbnail"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4 flex-grow flex flex-col">
                        <h2 className="text-lg font-semibold mb-2 line-clamp-2">
                          <Link href={`/blog/${post.slug || index}`} className="hover:text-orange-500">
                            {post.title || "Best LearnPress WordPress Theme Collection For 2023"}
                          </Link>
                        </h2>
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <CalendarIcon size={14} className="mr-1" />
                          <span>{post.date || "Jan 24, 2023"}</span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-3 flex-grow">
                          {post.excerpt ||
                            "Looking for an amazing & well-functional LearnPress WordPress Theme? Online education..."}
                        </p>
                        <Link
                          href={`/blog/${post.slug || index}`}
                          className="mt-3 text-orange-500 hover:text-orange-600 text-sm font-medium"
                        >
                          Read More
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No blog posts found. Try a different search term.</p>
                </div>
              )}

              {/* Enhanced Pagination with Ellipsis */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-1">
                    {/* Previous Page Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="sr-only">Previous page</span>
                    </Button>

                    {/* Page Numbers with Ellipsis */}
                    {generatePaginationItems().map((item, index) => {
                      if (item.type === "ellipsis") {
                        return (
                          <span key={`ellipsis-${index}`} className="px-3 py-2">
                            ...
                          </span>
                        )
                      }

                      return (
                        <Button
                          key={`page-${item.value}`}
                          variant={currentPage === item.value ? "default" : "outline"}
                          onClick={() => handlePageChange(item.value)}
                          className={`h-9 w-9 p-0 ${
                            currentPage === item.value ? "bg-orange-500 text-white border-orange-500" : ""
                          }`}
                        >
                          {item.value}
                        </Button>
                      )
                    })}

                    {/* Next Page Button */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                      <span className="sr-only">Next page</span>
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
