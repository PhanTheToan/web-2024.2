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
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }
    @PreAuthorize("hasRole('ROLE_ADMIN'))")
    @PutMapping("/editUser")
    public ResponseEntity<?> editUsers(@RequestBody User user) {
        userService.editInformationUsers(user);
        return ResponseEntity.ok("User edited successfully");
    }
    @PreAuthorize("hasRole('ROLE_USER') || hasRole('ROLE_TEACHER')")
    @PutMapping("/edit")
    public ResponseEntity<?> editUser(@RequestBody User user) {
        userService.editInformationUsersForUser(user);
        return ResponseEntity.ok("User edited successfully");
    }
//    @PreAuthorize("hasRole('ROLE_ADMIN')")
//    @PutMapping("/edit-status")
//    public ResponseEntity<?> editStatus() {
//        userService.setStatusAllUser();
//        return ResponseEntity.ok("User status edited successfully");
//    }
}