import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"

export function AccountSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Cập nhật mật khẩu để bảo vệ tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Mật khẩu hiện tại</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Mật khẩu mới</Label>
            <Input id="new-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Xác nhận mật khẩu mới</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Cập nhật mật khẩu</Button>
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
              <p className="text-sm text-muted-foreground">Nhận thông báo về khóa học qua email</p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications">Thông báo qua SMS</Label>
              <p className="text-sm text-muted-foreground">Nhận thông báo về khóa học qua SMS</p>
            </div>
            <Switch id="sms-notifications" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing-notifications">Thông báo tiếp thị</Label>
              <p className="text-sm text-muted-foreground">Nhận thông tin về khóa học mới và khuyến mãi</p>
            </div>
            <Switch id="marketing-notifications" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ngôn ngữ</CardTitle>
          <CardDescription>Chọn ngôn ngữ hiển thị</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup defaultValue="vietnamese">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="vietnamese" id="vietnamese" />
              <Label htmlFor="vietnamese">Tiếng Việt</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="english" id="english" />
              <Label htmlFor="english">Tiếng Anh</Label>
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter>
          <Button>Lưu cài đặt</Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Xóa tài khoản</CardTitle>
          <CardDescription>Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Khi bạn xóa tài khoản, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn. Hành động này không thể hoàn tác.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="destructive">Xóa tài khoản</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

