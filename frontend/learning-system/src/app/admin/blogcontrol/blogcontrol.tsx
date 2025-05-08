"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaSyncAlt, FaEye, FaTrash } from "react-icons/fa";
import AddBlogPopup from "./AddBlogPopup";

const BASE_URL = process.env.BASE_URL;

const formatDate = (dateArray: number[]): string => {
  const [year, month, day, hour, minute, second] = dateArray;
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
};

interface BlogData {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  author: string;
  refer: string;
  image: string;
  status: string;
  createdAt: number[];
}

const BlogControl = () => {
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddBlogPopupOpen, setIsAddBlogPopupOpen] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/blog/all`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }

      const data = await response.json();
      setBlogs(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/blog/update/${id}`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update blog status");
      }

      // const data = await response.json();
      // alert(data.body);

      // Refresh blogs after successful update
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog.id === id
            ? { ...blog, status: blog.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
            : blog
        )
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleAddBlog = () => {
    setIsAddBlogPopupOpen(false);
    fetchBlogs(); // Refresh blogs after adding a new one
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="font-semibold text-2xl text-gray-800">
          <motion.div initial={{ x: -20 }} animate={{ x: 0 }}>
            Quản lý blog
          </motion.div>
        </div>
        <button
          onClick={() => setIsAddBlogPopupOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200"
        >
          Add Blog
        </button>
      </div>

      {isAddBlogPopupOpen && (
        <AddBlogPopup
          onClose={() => setIsAddBlogPopupOpen(false)}
          onAddBlog={handleAddBlog}
        />
      )}

      <div className="w-full overflow-hidden bg-white shadow-lg rounded-lg">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Author</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created At</th>
                <th className="px-6 py-3 font-medium">Image</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog, index) => (
                <motion.tr
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <td className="px-6 py-4">{blog.id}</td>
                  <td className="px-6 py-4">{blog.title}</td>
                  <td className="px-6 py-4">{blog.author}</td>
                  <td className="px-6 py-4">
                    {blog.status}
                    <FaSyncAlt
                      onClick={() => handleToggleStatus(blog.id)}
                      className="ml-4 text-blue-500 cursor-pointer hover:text-blue-700"
                      title="Toggle Status"
                    />
                  </td>
                  <td className="px-6 py-4">{formatDate(blog.createdAt)}</td>
                  <td className="px-6 py-4">
                    <Image
                      src={blog.image}
                      alt="Blog Image"
                      width={64}
                      height={64}
                      className="object-cover rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-4">
                      <FaEye
                        onClick={() => window.open(blog.refer, "_blank")}
                        className="text-blue-500 cursor-pointer hover:text-blue-700"
                        title="View Blog"
                      />
                      <FaTrash
                        onClick={async () => {
                          const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
                          if (!confirmDelete) return;

                          try {
                            const response = await fetch(`${BASE_URL}/blog/delete/${blog.id}`, {
                              method: "DELETE",
                              credentials: "include",
                            });

                            if (!response.ok) {
                              throw new Error("Failed to delete blog");
                            }

                            // Refresh blogs after successful deletion
                            setBlogs((prevBlogs) => prevBlogs.filter((b) => b.id !== blog.id));
                          } catch (err) {
                            alert((err as Error).message);
                          }
                        }}
                        className="text-red-500 cursor-pointer hover:text-red-700"
                        title="Delete Blog"
                      />
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogControl;