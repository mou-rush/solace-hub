import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { updateProfile, updateEmail, User } from "firebase/auth";
import { db } from "@/lib/firebase";
import { updateDoc, doc } from "firebase/firestore";
import { nanoid } from "nanoid";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/useToast";

import { Camera, UserCircle } from "lucide-react";

interface ProfileSettingsProps {
  setEmail: (email: string) => void;
  user: User | null;
  email: string;
  userName: string;
  setUserName: (name: string) => void;
}
export const ProfileSittings = ({
  setEmail,
  user,
  email,
  userName,
  setUserName,
}: ProfileSettingsProps) => {
  const { error, success } = useToast();
  const [profileLoading, setProfileLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const imageId = localStorage.getItem(`profilePicId_${user?.uid}`);
    if (imageId) {
      const savedImage = localStorage.getItem(`profileImage_${imageId}`);
      if (savedImage) {
        setImagePreview(savedImage);
      }
    } else if (user?.photoURL && !user.photoURL.startsWith("profileImage_")) {
      setImagePreview(user?.photoURL);
    }
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      error({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
      });
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      error({
        title: "File too large",
        description: "Image should be less than 1MB when using local storage",
      });
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!user) return;

    setProfileLoading(true);

    try {
      let photoIdentifier = user?.photoURL || "";

      if (imageFile && imagePreview) {
        const imageId = nanoid(10);

        localStorage.setItem(`profileImage_${imageId}`, imagePreview);

        localStorage.setItem(`profilePicId_${user.uid}`, imageId);

        photoIdentifier = `profileImage_${imageId}`;
      }

      await updateProfile(user, {
        displayName: userName,
        photoURL: photoIdentifier,
      });

      if (email !== user.email) {
        await updateEmail(user, email);
      }

      await updateDoc(doc(db, "users", user.uid), {
        userName,
        email,
        photoURL: photoIdentifier,
        updatedAt: new Date().toISOString(),
      });

      setImageFile(null);

      success({
        title: "Profile updated",
        description: "Your profile information has been updated successfully",
      });
    } catch (errorMessage: any) {
      console.error("Error updating profile:", errorMessage);
      error({
        title: "Error updating profile",
        description: errorMessage.message || "Something went wrong",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <TabsContent value="profile">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and how it appears on your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpdateProfile}>
          <CardContent className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center space-y-3">
              <Label htmlFor="avatar">Profile Picture</Label>
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div
                  onClick={handleTriggerFileInput}
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                >
                  <Camera className="text-white" size={20} />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTriggerFileInput}
              >
                Change Photo
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700"
              disabled={profileLoading}
            >
              {profileLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </TabsContent>
  );
};
