package web20242.webcourse.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.OtpData;
import web20242.webcourse.security.dto.ApiResponse;
import web20242.webcourse.security.dto.AuthenticationRequest;
import web20242.webcourse.security.dto.AuthenticationResponse;
import web20242.webcourse.security.service.AuthenticationService;
import web20242.webcourse.security.service.JwtService;
import web20242.webcourse.service.UserService;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.ERole;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final UserService userService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final JavaMailSender javaMailSender;

    private final Map<String, OtpData> otpStorage = new HashMap<>();

    // Login
    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }
    @PostMapping("/login-with-token")
    public ResponseEntity<ApiResponse<UserDetails>> loginWithToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                ApiResponse<UserDetails> errorResponse = new ApiResponse<>(
                        HttpStatus.BAD_REQUEST.value(),
                        "Token không hợp lệ hoặc thiếu",
                        null
                );
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            String token = authHeader.substring(7); // Bỏ "Bearer " (7 ký tự)
            String username = jwtService.extractUsername(token);

            if (username == null) {
                ApiResponse<UserDetails> errorResponse = new ApiResponse<>(
                        HttpStatus.UNAUTHORIZED.value(),
                        "Token không chứa thông tin user",
                        null
                );
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            if (!jwtService.isTokenValid(token, userDetails)) {
                ApiResponse<UserDetails> errorResponse = new ApiResponse<>(
                        HttpStatus.UNAUTHORIZED.value(),
                        "Token không hợp lệ hoặc đã hết hạn",
                        null
                );
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }

            ApiResponse<UserDetails> response = new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Đăng nhập bằng token thành công",
                    userDetails
            );
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            ApiResponse<UserDetails> errorResponse = new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Lỗi server: " + e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Sign Up
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<String>> signup(@RequestBody User user) {
        try {
            if (userService.existsByUsername(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Username đã tồn tại", null));
            }
            if (userService.existsByEmail(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Email đã tồn tại", null));
            }

            // Tạo OTP
            String otp = generateOTP();
            user.setRole(ERole.ROLE_USER); // Mặc định role là USER
            otpStorage.put(user.getEmail(), new OtpData(otp, user));

            // Gửi email OTP
            sendOtpEmail(user.getEmail(), otp);
            //System.out.printf(otp);

            return ResponseEntity.ok(new ApiResponse<>(HttpStatus.OK.value(), "OTP đã được gửi đến email", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi server: " + e.getMessage(), null));
        }
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
    @PostMapping("/teacher/signup")
    public ResponseEntity<?> signupTeacher(@RequestBody User user) {
        try {
            user.setRole(ERole.ROLE_TEACHER);
            User createdUser = userService.createUser(user);
            String token = jwtService.generateToken(userDetailsService.loadUserByUsername(createdUser.getUsername()));
            AuthenticationResponse authResponse = new AuthenticationResponse(token);
            ApiResponse<AuthenticationResponse> response = new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Đăng ký thành công",
                    authResponse
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<AuthenticationResponse> errorResponse = new ApiResponse<>(
                    HttpStatus.BAD_REQUEST.value(),
                    "Lỗi: " + e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            ApiResponse<AuthenticationResponse> errorResponse = new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Lỗi server: " + e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    @PostMapping("/admin/signup")
    public ResponseEntity<?> signupAdmin(@RequestBody User user) {
        try {
            user.setRole(ERole.ROLE_ADMIN);
            User createdUser = userService.createUser(user);
            String token = jwtService.generateToken(userDetailsService.loadUserByUsername(createdUser.getUsername()));
            AuthenticationResponse authResponse = new AuthenticationResponse(token);
            ApiResponse<AuthenticationResponse> response = new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Đăng ký thành công",
                    authResponse
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<AuthenticationResponse> errorResponse = new ApiResponse<>(
                    HttpStatus.BAD_REQUEST.value(),
                    "Lỗi: " + e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            ApiResponse<AuthenticationResponse> errorResponse = new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Lỗi server: " + e.getMessage(),
                    null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/signout")
    public ResponseEntity<String> signout() {
        return ResponseEntity.ok("Đăng xuất thành công. Vui lòng xóa token ở client.");
    }
    // Send Email
    // Forgot Password
    // Authentication email - OTP khi sign up


}