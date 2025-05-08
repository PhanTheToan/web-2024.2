"use client"

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from 'next/image';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface ImageData {
  id: string;
  url: string;
  type: string;
  createdAt?: string;
}

const BASE_URL = process.env.BASE_URL;

const EImageTypes = [
  "LANDING_PAGE",
  "MARKETING_1",
  "MARKETING_2",
  "MARKETING_3",
  "MARKETING_4",
  "MARKETING_5",
  "MARKETING_6",
  "MARKETING_7",
  "MARKETING_8",
  "MARKETING_9",
];

const formatDate = (dateArray: number[]): string => {
  const [year, month, day] = dateArray;
  return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
};

export const Imagecontrol = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isAddImageModalOpen, setIsAddImageModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(EImageTypes[0]);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/upload/all-image`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }

      const data = await response.json();
      if (data.body && Array.isArray(data.body)) {
        const formattedImages = data.body.map((item: { id: string; imageUrl: string; type?: string; createdAt?: string }) => ({
          id: item.id,
          url: item.imageUrl,
          type: item.type || 'No type',
          createdAt: item.createdAt,
        }));
        setImages(formattedImages);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const refreshImages = async () => {
    await fetchImages();
  };

  const handleUpdate = async (id: string, newUrl: string) => {
    setImages((prevImages) =>
      prevImages.map((image) =>
        image.id === id ? { ...image, url: newUrl } : image
      )
    );
    await refreshImages();
  };

  const handleButtonClick = (id: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute("data-id", id);
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, id: string, currentType: string) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("image", file);

      try {
        // Upload image to get URL
        const uploadResponse = await fetch(`${BASE_URL}/upload/image/r2`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!uploadResponse.ok) {
          throw new Error("Failed to upload image");
        }

        const newUrl = await uploadResponse.text();

        // Update image URL
        const updateResponse = await fetch(`${BASE_URL}/upload/update/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: currentType,
            imageUrl: newUrl,
          }),
          credentials: "include",
        });

        if (!updateResponse.ok) {
          throw new Error("Failed to update image URL");
        }

        alert("Image updated successfully.");
        // Refresh table
        handleUpdate(id, newUrl);
      } catch (err) {
        alert(`Error: ${(err as Error).message}`);
        setError((err as Error).message);
      }
    }
  };

  const handleAddImage = async () => {
    if (!newImageFile) {
      alert("Please select an image file.");
      return;
    }

    const formData = new FormData();
    formData.append("image", newImageFile);

    try {
      // Upload image to get URL
      const uploadResponse = await fetch(`${BASE_URL}/upload/image/r2`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const imageUrl = await uploadResponse.text();

      // Create new image entry
      const createResponse = await fetch(`${BASE_URL}/upload/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: selectedType,
          imageUrl,
        }),
        credentials: "include",
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create image entry");
      }

      alert("Image added successfully.");
      setIsAddImageModalOpen(false);
      await refreshImages();
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      const response = await fetch(`${BASE_URL}/upload/delete-image/${id}`, {
        method: "PUT",
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert(`Error deleting image: ${errorText}`);
        throw new Error("Failed to delete image");
      }

      alert("Image deleted successfully.");
      await refreshImages();
    } catch (err) {
      alert(`Error: ${(err as Error).message}`);
      setError((err as Error).message);
    }
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
              Quản lý hình ảnh
            </motion.div>
          </div>
          <button
            onClick={() => setIsAddImageModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center transition-colors duration-200"
          >
            Add New Image
          </button>
        </div>
      <div className="w-full overflow-hidden bg-white shadow-lg rounded-lg">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Image URL</th>
                <th className="px-6 py-3 font-medium">Created At</th>
                <th className="px-6 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((image, index) => (
                <motion.tr
                  key={image.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <td className="px-6 py-4">{image.id}</td>
                  <td className="px-6 py-4">{image.type}</td>
                  <td className="px-6 py-4 truncate max-w-xs">
                    <a href={image.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    <Image src={image.url} alt="Preview" width={64} height={64} className="object-cover rounded-md"/>
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    {Array.isArray(image.createdAt) ? formatDate(image.createdAt) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => window.open(image.url, "_blank")}
                        className="text-blue-500 hover:text-blue-700 transition-colors duration-200 text-2xl"
                      >
                        <Eye />
                      </button>
                      <button
                        onClick={() => handleButtonClick(image.id)}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200 text-2xl"
                      >
                        <Edit />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200 text-2xl"
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

      {isAddImageModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3 className="text-xl font-semibold mb-4">Add New Image</h3>
              <div className="mb-4">
                <label className="block mb-2">Select Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {EImageTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsAddImageModalOpen(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddImage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                >
                  Upload
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e, fileInputRef.current?.getAttribute("data-id") || "", images.find(image => image.id === fileInputRef.current?.getAttribute("data-id"))?.type || "")}
        style={{ display: "none" }}
      />
    </div>
  );
};