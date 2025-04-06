package web20242.webcourse.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import web20242.webcourse.model.Course;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.EStatus;
import web20242.webcourse.repository.CourseRepository;
import web20242.webcourse.repository.EnrollmentRepository;
import web20242.webcourse.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    @Autowired
    public UserService(UserRepository userRepository, CourseRepository courseRepository, EnrollmentRepository enrollmentRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }


    @Autowired
    public void setPasswordEncoder(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }
    public User updateUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }
    public User createUser(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username đã tồn tại!");
        }
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password is required!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }
    public boolean existsByUsername(String username){
        return userRepository.findByUsername(username).isPresent();
    }
    public User findByUsername(String username){
        return userRepository.findByUsername(username).orElse(null);
    }
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    public Optional<User> findById(String id){
        return userRepository.findById(new ObjectId(id));
    }
    public void editInformationUsers(User user){
        Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
        if(existingUser.isPresent()){
            User userToUpdate = existingUser.get();
//            userToUpdate.setUsername(user.getUsername());
//            userToUpdate.setPassword(user.getPassword());
//            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
//                userToUpdate.setPassword(passwordEncoder.encode(user.getPassword()));
//            }
//            userToUpdate.setEmail(user.getEmail());
//            userToUpdate.setRole(user.getRole());
              userToUpdate.setFirstName(user.getFirstName());
              userToUpdate.setLastName(user.getLastName());
              userToUpdate.setGender(user.getGender());
              userToUpdate.setPhone(user.getPhone());
              userToUpdate.setDateOfBirth(user.getDateOfBirth());
              userToUpdate.setProfileImage(user.getProfileImage());
              userToUpdate.setUpdatedAt(LocalDateTime.now());
              userRepository.save(userToUpdate);
        }
        else {
            throw new IllegalArgumentException("User not found with id: " + user.getId());
        }
    }
    public void editInformationUsersForUser(User user){
        Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
        if(existingUser.isPresent()){
            User userToUpdate = existingUser.get();
            if(user.getId() == userToUpdate.getId())
            {
//                userToUpdate.setUsername(user.getUsername());
//            userToUpdate.setPassword(user.getPassword());
//            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
//                userToUpdate.setPassword(passwordEncoder.encode(user.getPassword()));
//            }
//            userToUpdate.setEmail(user.getEmail());
//            userToUpdate.setRole(user.getRole());
                userToUpdate.setFirstName(user.getFirstName());
                userToUpdate.setLastName(user.getLastName());
                userToUpdate.setGender(user.getGender());
                userToUpdate.setPhone(user.getPhone());
                userToUpdate.setDateOfBirth(user.getDateOfBirth());
                userToUpdate.setProfileImage(user.getProfileImage());
                userToUpdate.setUpdatedAt(LocalDateTime.now());
                userRepository.save(userToUpdate);
            }else {
                throw new IllegalArgumentException("User not found with id: " + user.getId());
            }
        }
        else {
            throw new IllegalArgumentException("User not found with id: " + user.getId());
        }
    }
    public void setStatusAllUser(){
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getStatus() == EStatus.ACTIVE) {
                user.setStatus(EStatus.INACTIVE);
            } else {
                user.setStatus(EStatus.ACTIVE);
            }
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }
    public ResponseEntity<?> findAllUsers() {
        List<User> users = userRepository.findAll();
        List<Map<String, String>> result = users.stream().map(user -> {
            Map<String, String> map = new HashMap<>();
            map.put("UserId", user.getId() != null ? user.getId().toHexString() : "");
            map.put("Username", user.getUsername() != null ? user.getUsername() : "");
            map.put("Email", user.getEmail() != null ? user.getEmail() : "");
            map.put("Role", user.getRole() != null ? user.getRole().name() : "");
            map.put("FirstName", user.getFirstName() != null ? user.getFirstName() : "");
            map.put("LastName", user.getLastName() != null ? user.getLastName() : "");
            map.put("Phone", user.getPhone() != null ? user.getPhone() : "");
            map.put("DateOfBirth", user.getDateOfBirth() != null ? user.getDateOfBirth().toString() : "");
            map.put("Status", user.getStatus() != null ? user.getStatus().name() : "");

            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    public void deleteUserLeaveCourse(String userId, String courseId) {
        Optional<User> userOptional = userRepository.findById(new ObjectId(userId));
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getCoursesEnrolled() != null) {
                user.getCoursesEnrolled().removeIf(id -> id.equals(new ObjectId(courseId)));
                user.setUpdatedAt(LocalDateTime.now());
                userRepository.save(user);
            }
        }

        Optional<Course> courseOptional = courseRepository.findById(new ObjectId(courseId));
        if (courseOptional.isPresent()) {
            Course course = courseOptional.get();
            if (course.getStudentsEnrolled() != null) {
                course.getStudentsEnrolled().removeIf(id -> id.equals(new ObjectId(userId)));
                course.setUpdatedAt(LocalDateTime.now());
                courseRepository.save(course);
            }
        }
        enrollmentRepository.deleteById(new ObjectId(userId));
    }

    public void setStatusUserForAdmin(String id) {
        Optional<User> user1 = userRepository.findById(new ObjectId(id));
        if (user1.isPresent()) {
            User userToUpdate = user1.get();
            if (userToUpdate.getStatus() == EStatus.ACTIVE) {
                userToUpdate.setStatus(EStatus.INACTIVE);
            } else {
                userToUpdate.setStatus(EStatus.ACTIVE);
            }
            userToUpdate.setUpdatedAt(LocalDateTime.now());
            userRepository.save(userToUpdate);
        } else {
            throw new IllegalArgumentException("User not found with id: " + id);
        }
    }
    public void setStatusUser(String id) {
        Optional<User> user1 = userRepository.findById(new ObjectId(id));
        if (user1.isPresent()) {
            User userToUpdate = user1.get();
            if (userToUpdate.getStatus() == EStatus.ACTIVE) {
                userToUpdate.setStatus(EStatus.INACTIVE);
            }else {
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("User not found with id: " + id);
                return;
            }
            userToUpdate.setUpdatedAt(LocalDateTime.now());
            userRepository.save(userToUpdate);
        } else {
            throw new IllegalArgumentException("User not found with id: " + id);
        }
    }

    public void removeUser(String id) {
        Optional<User> userOptional = userRepository.findById(new ObjectId(id));
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            userRepository.delete(user);
        } else {
            throw new IllegalArgumentException("User not found with id: " + id);
        }
    }
}