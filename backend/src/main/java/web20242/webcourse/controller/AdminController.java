package web20242.webcourse.controller;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.createRequest.OtpData;
import web20242.webcourse.model.createRequest.RandomStringGenerator;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.ERole;
import web20242.webcourse.model.constant.EStatus;
import web20242.webcourse.security.dto.ApiResponse;
import web20242.webcourse.security.dto.AuthenticationResponse;
import web20242.webcourse.security.service.AuthenticationService;
import web20242.webcourse.security.service.JwtService;
import web20242.webcourse.service.CourseService;
import web20242.webcourse.service.UserService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AuthenticationService authenticationService;
    private final UserService userService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final JavaMailSender javaMailSender;

    @Autowired
    private CourseService courseService;

    private final Map<String, OtpData> otpStorage = new HashMap<>();


    private String getJwtFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwtToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
    private String generateOTP() {
        return String.format("%06d", new Random().nextInt(999999));
    }
    private void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Xác nhận OTP");
        message.setText("Mã OTP của bạn là: " + otp + ". Hết hạn sau " + 5 + " phút.");
        javaMailSender.send(message);
    }
    private void sendResetPassword(String to, String username, String password){
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Đặt lại mật khẩu");
        message.setText("Username: "+username);
        message.setText("Mật khẩu mới của bạn là: " + password + ". Vui lòng đăng nhập và thay đổi mật khẩu.");
        javaMailSender.send(message);
    }
    private ResponseEntity<ApiResponse<String>> handleSignup(User user, ERole role) {
        try {
            if (userService.existsByUsername(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Username đã tồn tại", null));
            }
            if (userService.existsByEmail(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Email đã tồn tại", null));
            }
            user.setRole(role); // Đặt role tương ứng
            user.setStatus(EStatus.ACTIVE);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            User createdUser = userService.createUser(user);




            return ResponseEntity.ok(new ApiResponse<>(HttpStatus.OK.value(), "Tạo tài khoản thành công!", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi server: " + e.getMessage(), null));
        }
    }


    // Đăng ký Admin
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/admin-signup")
    public ResponseEntity<ApiResponse<String>> signupAdmin(@RequestBody User user) {
        return handleSignup(user,user.getRole());
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> verifyOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");

            OtpData otpData = otpStorage.get(email);
            if (otpData == null || otpData.isExpired()) {
                otpStorage.remove(email);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "OTP không tồn tại hoặc đã hết hạn", null));
            }
            if (!otpData.getOtp().equals(otp)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "OTP không hợp lệ", null));
            }

            User user = otpData.getUser();
            user.setStatus(EStatus.ACTIVE);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            User createdUser = userService.createUser(user);

            otpStorage.remove(email);

            String token = jwtService.generateToken(userDetailsService.loadUserByUsername(createdUser.getUsername()));
            AuthenticationResponse authResponse = new AuthenticationResponse(token);

            return ResponseEntity.ok(new ApiResponse<>(HttpStatus.OK.value(), "Đăng ký thành công", authResponse));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi server: " + e.getMessage(), null));
        }
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPasswordForAdmin(@RequestBody Map<String, String> request) {
        try {
            String id = request.get("id");
            String email = request.get("email");
            String username = request.get("username");
            Optional<User> users = userService.findById(id);
            if(users.isPresent()){
                User user = users.get();
                String randomPassword = RandomStringGenerator.generateRandomString(10);
                user.setPassword(randomPassword);
                user.setUpdatedAt(LocalDateTime.now());
                userService.updateUser(user);
                sendResetPassword(email,username,randomPassword);
                return ResponseEntity.ok(new ApiResponse<>(HttpStatus.OK.value(), "Đặt lại mật khẩu thành công", null));
            }else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Không tìm thấy người dùng với ID: " + id, null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi server: " + e.getMessage(), null));
        }
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/delete-user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id){
                userService.setStatusUserForAdmin(id);
                return ResponseEntity.ok("Update trạng thái thành công!");
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/delete-forever/{id}")
    public ResponseEntity<?> deleteUserForever(@PathVariable String id){
        userService.removeUser(id);
        return ResponseEntity.ok("Xóa người dùng thành công");
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/update-rating")
    public void updateRating(){
        courseService.updateRating();
    }
}
