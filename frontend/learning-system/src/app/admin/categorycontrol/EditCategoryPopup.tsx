import React, { useState } from "react";

interface EditCategoryPopupProps {
  categoryId: string;
  initialCategoryName: string;
  initialDisplayName: string;
  initialStatus: string;
  initialImageUrl: string;
  onClose: () => void;
  onUpdateCategory: () => void;
}

const BASE_URL = process.env.BASE_URL;

const EditCategoryPopup: React.FC<EditCategoryPopupProps> = ({
  categoryId,
  initialCategoryName,
  initialDisplayName,
  initialStatus,
  initialImageUrl,
  onClose,
  onUpdateCategory,
}) => {
  const [categoryName, setCategoryName] = useState(initialCategoryName);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [status, setStatus] = useState(initialStatus);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${BASE_URL}/upload/image/r2`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const rawUrl = await response.text();
      setImageUrl(rawUrl);
    } catch (error) {
      alert((error as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageUrl) {
      alert("Please upload an image first.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/categories/update-info/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          displayName,
          urlLogo: imageUrl,
          category: categoryName,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      alert("Category updated successfully.");
      onUpdateCategory();
      onClose();
    } catch (error) {
      alert((error as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="false">Normal</option>
              <option value="true">Popular</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Upload Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            {imageUrl && <p className="mt-2 text-sm text-green-600">Image uploaded successfully!</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryPopup;