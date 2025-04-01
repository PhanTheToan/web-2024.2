package web20242.webcourse.service;

import lombok.Setter;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cglib.core.Local;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import web20242.webcourse.model.Course;
import web20242.webcourse.model.Enrollment;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.ERole;
import web20242.webcourse.model.constant.EStatus;
import web20242.webcourse.repository.CourseRepository;
import web20242.webcourse.repository.EnrollmentRepository;
import web20242.webcourse.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

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
    public User findById(String id){
        return userRepository.findById(new org.bson.types.ObjectId(id)).orElse(null);
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
    public List<User> findAllUsers() {
        return userRepository.findAll();
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
}