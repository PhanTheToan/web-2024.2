"use client"

import React, { useState, useEffect } from "react";
import Image from "next/image";

interface ImageData {
  id: string;
  url: string;
  description: string;
}

const demoImages: ImageData[] = [
  { id: "1", url: "https://img-c.udemycdn.com/course/480x270/823546_a941.jpg", description: "C++ Cơ bản dành cho người mới học lập trình" },
  { id: "2", url: "https://img-c.udemycdn.com/course/480x270/552190_c48b_5.jpg", description: "Lập trình Hướng đối tượng với C++ cơ bản đến nâng cao" },
  { id: "3", url: "https://img-c.udemycdn.com/course/480x270/4467252_61d1_3.jpg", description: "React Ultimate - React.JS Cơ Bản Từ Z Đến A Cho Beginners" },
  { id: "4", url: "https://img-c.udemycdn.com/course/480x270/4947234_f0db.jpg", description: "Backend RESTFul Server với Node.JS và Express (SQL/MongoDB)" },
  { id: "5", url: "https://img-c.udemycdn.com/course/480x270/5177526_1ae5_2.jpg", description: "Unreal Engine 5: Blueprint Cơ Bản" }
];

export const Imagecontrol = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setImages(demoImages);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleUpdate = (id: string, newUrl: string) => {
    setImages((prevImages) =>
      prevImages.map((image) =>
        image.id === id ? { ...image, url: newUrl } : image
      )
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((image) => (
        <div key={image.id} className="border rounded shadow p-2">
          <Image src={image.url} alt={image.description} width={480} height={270} className="w-full h-auto" />
          <p className="text-center mt-2">{image.description}</p>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") {
                    handleUpdate(image.id, reader.result);
                  }
                };
                reader.readAsDataURL(e.target.files[0]);
              }
            }}
            className="mt-2"
          />
        </div>
      ))}
    </div>
  );
};