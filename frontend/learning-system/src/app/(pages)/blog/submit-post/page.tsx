"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Upload } from "lucide-react"
import Checkbox from "@mui/material/Checkbox"
import AlertTitle from "@mui/material/AlertTitle"
import { Alert } from "@mui/material"

export default function SubmitPostPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formError, setFormError] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const categories = ["Commercial", "Office", "Shop", "Educate", "Academy", "Single family home"]

  const tags = ["Free courses", "Marketing", "Idea", "LMS", "LearnPress", "Instructor"]

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError("")

    // Get form data
    const formData = new FormData(e.currentTarget)
    const title = formData.get("title") as string
    const content = formData.get("content") as string

    // Basic validation
    if (!title || title.trim().length < 5) {
      setFormError("Please enter a title with at least 5 characters")
      return
    }

    if (!content || content.trim().length < 50) {
      setFormError("Please enter content with at least 50 characters")
      return
    }

    // Simulate form submission
    setIsSubmitting(true)

    try {
      // In a real app, you would send the data to your API here
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
      setIsSubmitted(true)
    } catch (error) {
      setFormError("An error occurred while submitting your post. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
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
              <Link href="/blog" className="text-gray-500 hover:text-orange-500">
                Blog
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-700">Submit Post</span>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <main className="flex-grow container mx-auto px-4 py-12">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-green-600">Post Submitted Successfully!</CardTitle>
              <CardDescription>Your post has been submitted and is awaiting admin approval.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="bg-green-50 text-green-700 p-6 rounded-lg">
                <p className="mb-4">
                  Thank you for contributing to our blog. Our team will review your submission as soon as possible.
                </p>
                <p>You will receive a notification when your post is approved and published.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => router.push("/blog")} className="mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
              </Button>
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  setImagePreview(null)
                }}
              >
                Submit Another Post
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
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
            <Link href="/blog" className="text-gray-500 hover:text-orange-500">
              Blog
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-700">Submit Post</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Submit a Blog Post</h1>

          {formError && (
            <Alert severity="error" variant="filled">
            <AlertTitle>Error</AlertTitle>
            <CardDescription>{formError}</CardDescription>
          </Alert>          
          )}

          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>
                Fill out the form below to submit your post for review. Once approved by an admin, it will be published
                on the blog.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Post Title <span className="text-red-500">*</span>
                  </Label>
                  <Input id="title" name="title" placeholder="Enter a descriptive title" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">
                    Post Content <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    name="content"
                    placeholder="Write your blog post content here..."
                    className="min-h-[200px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select name="category" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="featured-image">Featured Image</Label>
                    <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4">
                      {imagePreview ? (
                        <div className="relative w-full">
                          <Image
                            src={imagePreview || "/placeholder.svg"}
                            alt="Preview"
                            width={300}
                            height={200}
                            className="mx-auto h-[150px] object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => setImagePreview(null)}
                          >
                            Change
                          </Button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-32 cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">Click to upload image</span>
                          <input
                            type="file"
                            id="featured-image"
                            name="featured-image"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Tags (Select all that apply)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {tags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox id={`tag-${tag}`} name="tags" value={tag} />
                        <Label htmlFor={`tag-${tag}`} className="text-sm font-normal">
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" name="terms" required />
                    <Label htmlFor="terms" className="text-sm font-normal">
                      I agree to the{" "}
                      <Link href="#" className="text-orange-500 hover:underline">
                        terms and conditions
                      </Link>{" "}
                      and understand that my post will be reviewed before publishing.
                    </Label>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => router.push("/blog")}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit for Review"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
