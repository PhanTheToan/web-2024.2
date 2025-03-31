package web20242.webcourse.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.User;
import web20242.webcourse.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }
    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_USER') || hasRole('ROLE_TEACHER')")
    @PutMapping("/editUser")
    public ResponseEntity<?> editUsers(@RequestBody User user) {
        userService.editInformationUsers(user);
        return ResponseEntity.ok("User edited successfully");
    }
}