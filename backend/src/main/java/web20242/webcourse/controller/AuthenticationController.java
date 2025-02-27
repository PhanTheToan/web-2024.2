package web20242.webcourse.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.security.dto.AuthenticationRequest;
import web20242.webcourse.security.dto.AuthenticationResponse;
import web20242.webcourse.security.service.AuthenticationService;
import web20242.webcourse.service.UserService;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.ERole;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            user.setRole(ERole.ROLE_USER); // Gán ROLE_USER
            User createdUser = userService.createUser(user);
            AuthenticationResponse response = authenticationService.authenticate(
                    new AuthenticationRequest(createdUser.getUsername(), user.getPassword())
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
    @PostMapping("/teacher/signup")
    public ResponseEntity<?> signupTeacher(@RequestBody User user) {
        try {
            user.setRole(ERole.ROLE_TEACHER); // Gán ROLE_USER
            User createdUser = userService.createUser(user);
            AuthenticationResponse response = authenticationService.authenticate(
                    new AuthenticationRequest(createdUser.getUsername(), user.getPassword())
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }
    @PostMapping("/admin/signup")
    public ResponseEntity<?> signupAdmin(@RequestBody User user) {
        try {
            user.setRole(ERole.ROLE_ADMIN); // Gán ROLE_USER
            User createdUser = userService.createUser(user);
            AuthenticationResponse response = authenticationService.authenticate(
                    new AuthenticationRequest(createdUser.getUsername(), user.getPassword())
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/signout")
    public ResponseEntity<String> signout() {
        return ResponseEntity.ok("Đăng xuất thành công. Vui lòng xóa token ở client.");
    }
}