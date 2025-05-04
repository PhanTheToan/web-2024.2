'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { useEffect, useState } from "react";

const BASE_URL = process.env.BASE_URL || "";

export function AccountSettings() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [userId, setUserId] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`${BASE_URL}/auth/check`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUserId(data?.data?.id || "");
        }
      } catch (err) {
        console.error("Error fetching user ID:", err);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = () => {
    window.dispatchEvent(new Event("user-logged-out"));
    router.push("/");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`${BASE_URL}/user/delete-user/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Delete failed");

      await fetch(`${BASE_URL}/auth/signout`, {
        method: "POST",
        credentials: "include",
      });

      handleLogout();
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Đã xảy ra lỗi khi xóa tài khoản");
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
    }
  };

  const confirmDelete = () => {
    if (!userId) {
      alert("Không tìm thấy ID người dùng.");
      return;
    }
    setShowConfirmModal(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>
            Cập nhật mật khẩu để bảo vệ tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/reset-password">
            <Button>Cập nhật mật khẩu</Button>
          </Link>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thông báo</CardTitle>
          <CardDescription>Quản lý cài đặt thông báo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Thông báo qua email</Label>
              <p className="text-sm text-muted-foreground">
                Nhận thông báo về khóa học qua email
              </p>
            </div>
            <Switch id="email-notifications" defaultChecked disabled />
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Xóa tài khoản</CardTitle>
          <CardDescription>
            Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Khi bạn xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.
            Hành động này không thể hoàn tác.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="destructive"
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Đang xóa..." : "Xóa tài khoản"}
          </Button>
        </CardFooter>
      </Card>

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Xác nhận xóa tài khoản</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {isDeleting ? "Đang xóa..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
