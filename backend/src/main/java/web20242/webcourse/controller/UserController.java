package web20242.webcourse.controller;

import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.User;
import web20242.webcourse.repository.UserRepository;
import web20242.webcourse.service.UserService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private final UserRepository userRepository;

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/editUser/{id}")
    public ResponseEntity<?> editUsers(@RequestBody User user, @PathVariable String id) {
        user.setId(new ObjectId(id));
        userService.editInformationUsersById(user);
        return ResponseEntity.ok("User edited successfully");
    }
    @PreAuthorize("hasRole('ROLE_USER') || hasRole('ROLE_TEACHER') || hasRole('ROLE_ADMIN')")
    @PutMapping("/edit")
    public ResponseEntity<?> editUser(@RequestBody User user, Principal principal) {
        User user1 = userRepository.findByUsername(principal.getName()).orElse(null);
        assert user1 != null;
        user.setId(user1.getId());
        userService.editInformationUsersById(user);
        return ResponseEntity.ok("User edited successfully");
    }
//    @PreAuthorize("hasRole('ROLE_ADMIN')")
//    @PutMapping("/edit-status")
//    public ResponseEntity<?> editStatus() {
//        userService.setStatusAllUser();
//        return ResponseEntity.ok("User status edited successfully");
//    }
    @PreAuthorize("hasRole('ROLE_TEACHER') || hasRole('ROLE_USER')")
    @DeleteMapping("/delete-user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id){
      userService.setStatusUser(id);
       return ResponseEntity.ok("Chuyển trạng thái thành công!");
    }
}