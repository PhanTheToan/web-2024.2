package web20242.webcourse.controller;


import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.createRequest.OtpData;
import web20242.webcourse.model.constant.EStatus;
import web20242.webcourse.security.dto.ApiResponse;
import web20242.webcourse.security.dto.AuthenticationRequest;
import web20242.webcourse.security.dto.AuthenticationResponse;
import web20242.webcourse.security.service.AuthenticationService;
import web20242.webcourse.security.service.JwtService;
import web20242.webcourse.service.EmailService;
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
    private final EmailService emailService;

    private final Map<String, OtpData> otpStorage = new HashMap<>();

    // Check token
    @GetMapping("/check")
    public ResponseEntity<?> checkAuthentication(HttpServletRequest request) {
        try {
            String token = getJwtFromCookies(request);
            if (token == null || !jwtService.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(HttpStatus.UNAUTHORIZED.value(), "Authentication failed!", null));
            }

            String username = jwtService.extractUsername(token);
            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(HttpStatus.NOT_FOUND.value(), "User not found!", null));
            }

            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getId().toString());
            userInfo.put("username", user.getUsername());
            userInfo.put("email", user.getEmail());
            userInfo.put("role", user.getRole().name());
            userInfo.put("firstName", user.getFirstName());
            userInfo.put("lastName", user.getLastName());
            userInfo.put("phone", user.getPhone());
            userInfo.put("dateOfBirth", user.getDateOfBirth());
            userInfo.put("gender", user.getGender());
            userInfo.put("profileImage", user.getProfileImage());
            userInfo.put("coursesEnrolled", user.getCoursesEnrolled());
            userInfo.put("createdAt", user.getCreatedAt());
            userInfo.put("updatedAt", user.getUpdatedAt());

            return ResponseEntity.ok(new ApiResponse<>(HttpStatus.OK.value(), "User authenticated", userInfo));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Error: " + e.getMessage(), null));
        }
    }

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

    // Login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthenticationRequest request, HttpServletResponse response) {
        AuthenticationResponse authResponse = authenticationService.authenticate(request);
        User user = userService.findByUsername(request.getUsername());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(HttpStatus.NOT_FOUND.value(), "User not found!", null));
        }

        if (!EStatus.ACTIVE.equals(user.getStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>(HttpStatus.FORBIDDEN.value(), "User is not active!", null));
        }
        Cookie cookie = new Cookie("jwtToken", authResponse.getToken());
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setSecure(true);
        cookie.setMaxAge(24 * 60 * 60);
        cookie.setAttribute("SameSite", "None");
        cookie.setDomain("alphaeducation.io.vn");
        response.addCookie(cookie);
        return ResponseEntity.ok(authResponse);
    }
//    @PostMapping("/login-with-token")
//    public ResponseEntity<ApiResponse<UserDetails>> loginWithToken(@RequestHeader("Authorization") String authHeader) {
//        try {
//            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//                ApiResponse<UserDetails> errorResponse = new ApiResponse<>(
//                        HttpStatus.BAD_REQUEST.value(),
//                        "Token không hợp lệ hoặc thiếu",
//                        null
//                );
//                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
//            }
//
//            String token = authHeader.substring(7); // Bỏ "Bearer " (7 ký tự)
//            String username = jwtService.extractUsername(token);
//
//            if (username == null) {
//                ApiResponse<UserDetails> errorResponse = new ApiResponse<>(
//                        HttpStatus.UNAUTHORIZED.value(),
//                        "Token không chứa thông tin user",
//                        null
//                );
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
//            }
//
//            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
//            if (!jwtService.isTokenValid(token, userDetails)) {
//                ApiResponse<UserDetails> errorResponse = new ApiResponse<>(
//                        HttpStatus.UNAUTHORIZED.value(),
//                        "Token không hợp lệ hoặc đã hết hạn",
//                        null
//                );
//                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
//            }
//
//            ApiResponse<UserDetails> response = new ApiResponse<>(
//                    HttpStatus.OK.value(),
//                    "Đăng nhập bằng token thành công",
//                    userDetails
//            );
//            return ResponseEntity.ok(response);
//
//        } catch (Exception e) {
//            ApiResponse<UserDetails> errorResponse = new ApiResponse<>(
//                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
//                    "Lỗi server: " + e.getMessage(),
//                    null
//            );
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
//        }
//    }

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

    @PostMapping("/signout")
    public ResponseEntity<String> signout(HttpServletRequest request, HttpServletResponse response) {
        String jwt = getJwtFromCookies(request);

        if (jwt == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Không tìm thấy token. Vui lòng đăng nhập trước khi đăng xuất.");
        }

        String username = jwtService.extractUsername(jwt);
        if (username == null || !jwtService.validateToken(jwt)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token không hợp lệ. Vui lòng đăng nhập lại.");
        }

        ResponseCookie deleteCookie = ResponseCookie.from("jwtToken", null)
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .build();

        response.addHeader("Set-Cookie", deleteCookie.toString());

        return ResponseEntity.ok("Đăng xuất thành công.");
    }
    // Đăng ký User
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<String>> signup(@RequestBody User user) {
        if(user.getRole() == ERole.ROLE_ADMIN)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Không thể đăng ký với vai trò ADMIN", null));
        return handleSignup(user, user.getRole());
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
            String otp = generateOTP();
            user.setRole(role); // Đặt role tương ứng
            otpStorage.put(user.getEmail(), new OtpData(otp, user));
            emailService.sendOtp(user.getUsername(),otp,user.getEmail());

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
            if(user.getRole() == null)
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Need Role", null));
            if(user.getRole() == ERole.ROLE_USER)
                user.setStatus(EStatus.ACTIVE);
            else
                user.setStatus(EStatus.INACTIVE);
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
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String username = request.get("username");

            User user = userService.findByEmail(email);
            if (user == null || !user.getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Email hoặc username không tồn tại", null));
            }

            String otp = generateOTP();
            otpStorage.put(email, new OtpData(otp, user));

            emailService.sendOtp(user.getUsername(),otp,user.getEmail());

            return ResponseEntity.ok(new ApiResponse<>(HttpStatus.OK.value(), "OTP đã được gửi đến email", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi server: " + e.getMessage(), null));
        }
    }
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            String password = request.get("password");

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
            user.setPassword(password);
            user.setUpdatedAt(LocalDateTime.now());
            userService.updateUser(user);

            otpStorage.remove(email);

            return ResponseEntity.ok(new ApiResponse<>(HttpStatus.OK.value(), "Đặt lại mật khẩu thành công", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Lỗi server: " + e.getMessage(), null));
        }
    }


}