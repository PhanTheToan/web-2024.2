"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

const BASE_URL = process.env.BASE_URL || "http://localhost:8080";
const IMAGE_UPLOAD_URL = `${BASE_URL}/upload/image/r2`;

interface Profile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  profileImage: string;
}

export function ProfileDetails() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile>({
    id: "",
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    profileImage: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${BASE_URL}/auth/check`, {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data) {
            const { dateOfBirth, ...rest } = data.data;
            const formattedDateOfBirth = dateOfBirth
              ? `${dateOfBirth[0]}-${String(dateOfBirth[1]).padStart(2, "0")}-${String(dateOfBirth[2]).padStart(2, "0")}`
              : "";
            setProfile({ ...rest, dateOfBirth: formattedDateOfBirth });
            setPreviewUrl(data.data.profileImage);
          }
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    let imageUrl = profile.profileImage;
    const fallbackUrl =
      "https://pub-82683fceb06e4dd98da0d728fdcd9630.r2.dev/default_profile.jpg";

    // Upload new image if selected
    if (selectedFile) {
      const formData = new FormData();
      formData.append("image", selectedFile);

      try {
        const res = await fetch(IMAGE_UPLOAD_URL, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (res.ok) {
          imageUrl = await res.text(); // Expecting the URL as a plain string
        } else {
          console.warn("Image upload failed, using fallback URL.");
          imageUrl = fallbackUrl;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        imageUrl = fallbackUrl;
      }
    }

    // Prepare payload with all fields, using updated or original values
    const updatedProfile = {
      id: profile.id, // Will be overridden by backend
      username: profile.username, // Original value, ignored by backend
      firstName: profile.firstName, // Updated or original
      lastName: profile.lastName, // Updated or original
      email: profile.email, // Original value, ignored by backend
      phone: profile.phone, // Updated or original
      dateOfBirth: profile.dateOfBirth, // Updated or original
      gender: profile.gender, // Updated or original
      profileImage: imageUrl, // Updated or original
    };

    try {
      const response = await fetch(`${BASE_URL}/user/edit`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        alert("Profile updated successfully");
        setProfile(updatedProfile);
        setIsEditing(false);
        setSelectedFile(null);
        setPreviewUrl(imageUrl);
      } else {
        alert("Error updating profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("An error occurred while saving changes");
    }
  };

  return (
    <div className="space-y-6">
      {isEditing ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.username || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={profile.firstName || ""}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={profile.lastName || ""}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone || ""}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={profile.dateOfBirth || ""}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={profile.gender || ""}
                onValueChange={(value) => handleChange("gender", value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Image</Label>
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 rounded-full object-cover mt-2"
                />
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save Changes</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-muted-foreground">Username</h3>
              <p>{profile.username || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Email</h3>
              <p>{profile.email || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">First Name</h3>
              <p>{profile.firstName || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Last Name</h3>
              <p>{profile.lastName || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Phone Number</h3>
              <p>{profile.phone || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Date of Birth</h3>
              <p>{profile.dateOfBirth || "N/A"}</p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Gender</h3>
              <p>
                {profile.gender === "Male"
                  ? "Male"
                  : profile.gender === "Female"
                  ? "Female"
                  : profile.gender === "Other"
                  ? "Other"
                  : "N/A"}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-muted-foreground">Profile Image</h3>
              <img
                src={
                  profile.profileImage || "https://via.placeholder.com/150"
                }
                alt="Profile"
                className="w-32 h-32 rounded-full"
              />
            </div>
          </div>
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        </>
      )}
    </div>
  );
}