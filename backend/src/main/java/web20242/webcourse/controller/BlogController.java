package web20242.webcourse.controller;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.Blog;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.EStatus;
import web20242.webcourse.repository.BlogRepository;
import web20242.webcourse.repository.UserRepository;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/blog")
public class BlogController {

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllBlog(){
        List<Blog> blogs = blogRepository.findByStatus(EStatus.ACTIVE);
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/search/{title}")
    public ResponseEntity<?> getTitle(@PathVariable String title){
        List<Blog> blogs = blogRepository.findByTitleContainingIgnoreCase(title);
        if (blogs.isEmpty()) {
            return ResponseEntity.status(404).body("No blogs found with title: " + title);
        }
        return ResponseEntity.ok(blogs);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<?> getAllBlogForAdmin(){
        return ResponseEntity.ok(blogRepository.findAll());
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/upload")
    public ResponseEntity<?> uploadBlog(@RequestBody Blog blog, Principal principal){
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        if(user!=null){
            blog.setOwnerId(user.getId());
            blog.setCreatedAt(LocalDateTime.now());
            blogRepository.save(blog);
            return ResponseEntity.ok("Upload blog successfully");
        }else {
            return ResponseEntity.status(401).body("Not Authenticate");
        }
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/update/{id}")
    public void updateStatus(@PathVariable String id){
        Blog blog = blogRepository.findById(new ObjectId(id)).orElse(null);
        assert blog != null;
        if(blog.getStatus() == EStatus.ACTIVE){
            blog.setStatus(EStatus.INACTIVE);
            blogRepository.save(blog);
        }else {
            blog.setStatus(EStatus.ACTIVE);
            blogRepository.save(blog);
        }
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/delete/{id}")
    public void deleteBlog(@PathVariable String id){
        Blog blog = blogRepository.findById(new ObjectId(id)).orElse(null);
        assert blog != null;
        blogRepository.delete(blog);
    }
}
