"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, RefreshCw } from "lucide-react";
import Image from 'next/image';
import AddCategoryPopup from "./AddCategoryPopup";
import EditCategoryPopup from "./EditCategoryPopup";

const BASE_URL = process.env.BASE_URL;

interface Category {
  categoryId: string;
  categoryName: string;
  categoryDisplayName: string | null;
  categoryUrl: string;
  categoryStatus: string;
}

const CategoryControl = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/categories/all`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      setCategories(data.body || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (categoryName: string) => {
    try {
      const response = await fetch(`${BASE_URL}/categories/update/${categoryName}`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update category status");
      }

      const data = await response.json();
      alert(data.body);

      // Refresh categories after successful update
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.categoryName === categoryName
            ? { ...category, categoryStatus: category.categoryStatus === "true" ? "false" : "true" }
            : category
        )
      );
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Add a function to handle category deletion
  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/categories/delete/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }

      const data = await response.json();
      alert(data.body);

      // Reload categories after deletion
      setLoading(true);
      fetchCategories();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleAddCategory = () => {
    setIsPopupOpen(false);
    setLoading(true);
    fetchCategories();
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditPopupOpen(true);
  };

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
            Quản lý danh mục
          </motion.div>
        </div>
        <button
          onClick={() => setIsPopupOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-200"
        >
          Add Category
        </button>
      </div>

      {isPopupOpen && (
        <AddCategoryPopup
          onClose={() => setIsPopupOpen(false)}
          onAddCategory={handleAddCategory}
        />
      )}

      {isEditPopupOpen && selectedCategory && (
        <EditCategoryPopup
          categoryId={selectedCategory.categoryId}
          initialCategoryName={selectedCategory.categoryName}
          initialDisplayName={selectedCategory.categoryDisplayName || ""}
          initialStatus={selectedCategory.categoryStatus}
          initialImageUrl={selectedCategory.categoryUrl}
          onClose={() => setIsEditPopupOpen(false)}
          onUpdateCategory={() => {
            setIsEditPopupOpen(false);
            // Refresh categories after update
            setLoading(true);
            fetchCategories();
          }}
        />
      )}

      <div className="w-full overflow-hidden bg-white shadow-lg rounded-lg">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Display Name</th>
                <th className="px-6 py-3 font-medium">Logo</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <motion.tr
                  key={category.categoryId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <td className="px-6 py-4">{category.categoryId}</td>
                  <td className="px-6 py-4">{category.categoryName}</td>
                  <td className="px-6 py-4">{category.categoryDisplayName || "N/A"}</td>
                  <td className="px-6 py-4">
                    <Image
                      src={category.categoryUrl}
                      alt="Logo"
                      width={64}
                      height={64}
                      className="object-cover rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4">
                    {category.categoryStatus === "true" ? "Popular" : "Normal"}
                    <RefreshCw
                      onClick={() => handleToggleStatus(category.categoryName)}
                      className="ml-4 text-blue-500 cursor-pointer hover:text-blue-700"
                      // title="Toggle Status"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-2xl"
                        title="Edit Category"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.categoryId)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 text-2xl"
                        title="Delete Category"
                      >
                        <Trash2 />
                      </button>
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

export default CategoryControl;

