package web20242.webcourse.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.security.dto.ApiResponse;
import web20242.webcourse.security.dto.AuthenticationRequest;
import web20242.webcourse.security.dto.AuthenticationResponse;
import web20242.webcourse.security.service.AuthenticationService;
import web20242.webcourse.security.service.JwtService;
import web20242.webcourse.service.UserService;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.ERole;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final UserService userService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

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
    public ResponseEntity<ApiResponse<AuthenticationResponse>> signup(@RequestBody User user) {
        try {
            user.setRole(ERole.ROLE_USER);
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
    @PostMapping("/teacher/signup")
    public ResponseEntity<?> signupTeacher(@RequestBody User user) {
        try {
            user.setRole(ERole.ROLE_USER);
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
            user.setRole(ERole.ROLE_USER);
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
}