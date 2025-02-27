package web20242.webcourse.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.security.dto.AuthenticationRequest;
import web20242.webcourse.security.dto.AuthenticationResponse;
import web20242.webcourse.security.service.AuthenticationService;
import web20242.webcourse.service.UserService;
import web20242.webcourse.model.User;

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

    @Transactional
    @PostMapping("/signup")
    public ResponseEntity<AuthenticationResponse> signup(@RequestBody User user) {
        User createdUser = userService.createUser(user); // Tạo user mới
        AuthenticationResponse response = authenticationService.authenticate(
                new AuthenticationRequest(createdUser.getUsername(), user.getPassword())
        ); // Tự động đăng nhập sau khi signup
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signout")
    public ResponseEntity<String> signout() {
        return ResponseEntity.ok("Đăng xuất thành công. Vui lòng xóa token ở client.");
    }
}