package web20242.webcourse.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import web20242.webcourse.model.Course;
import web20242.webcourse.model.Enrollment;
import web20242.webcourse.model.Review;
import web20242.webcourse.model.User;
import web20242.webcourse.model.constant.EStatus;
import web20242.webcourse.model.createRequest.ReviewRequest;
import web20242.webcourse.repository.CourseRepository;
import web20242.webcourse.repository.EnrollmentRepository;
import web20242.webcourse.repository.ReviewRepository;
import web20242.webcourse.repository.UserRepository;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

//    public void updateFullNames(){
//        reviewRepository.findAll().forEach(review -> {
//            review.setFullName("Unknown Users");
//            Optional<User> user = userRepository.findById(review.getUserId());
//            user.ifPresent(value -> review.setFullName(value.getFirstName()+" "+value.getLastName()));
//            reviewRepository.save(review);
//        });
//    }

    public ResponseEntity<?> getRatingRandom() {
        List<Review> allReviews = reviewRepository.findAll();
        List<Review> fiveStarReviews = allReviews.stream()
                .filter(review -> review.getRating() != null && review.getRating() == 5)
                .collect(Collectors.toList());
        Collections.shuffle(fiveStarReviews);
        List<Map<String, Object>> response = fiveStarReviews.stream()
                .limit(4)
                .map(review -> {
                    Map<String, Object> reviewOverview = new HashMap<>();
                    reviewOverview.put("fullName", review.getFullName());
                    reviewOverview.put("rating", review.getRating());
                    reviewOverview.put("comment", review.getComment());
                    return reviewOverview;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    public ResponseEntity<?> sendReviewByUser(ReviewRequest reviewRequest, Principal principal) {
        User user = userRepository.findByUsername(principal.getName()).orElse(null);
        Course course = courseRepository.findById(new ObjectId(reviewRequest.getCourseId())).orElse(null);
        assert course != null;
        assert user != null;
        Review review = reviewRepository.findByCourseIdAndUserId(course.getId(), user.getId());
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(user.getId(),course.getId()).orElse(null);
        if(review == null && Objects.requireNonNull(enrollment).getStatus() == EStatus.DONE){
            Review review1 = new Review();
            review1.setUserId(user.getId());
            review1.setCourseId(course.getId());
            review1.setComment(reviewRequest.getComment());
            review1.setRating(reviewRequest.getRate());
            review1.setCreatedAt(LocalDateTime.now());
            review1.setFullName(user.getFirstName()+" "+user.getLastName());
            reviewRepository.save(review1);
            return ResponseEntity.ok("Cảm ơn bạn đã đánh giá khóa học!");
        }else {
            return ResponseEntity.status(401).body("Bạn chỉ được đánh giá một lần!");
        }

    }

    public ResponseEntity<?> getReviewPerCourse(ObjectId id) {
        List<Review> reviews = reviewRepository.findByCourseId(id);
        List<Map<String, Object>> reviewOverviews = reviews.stream()
                .map(review -> {
                    Map<String, Object> reviewOverview = new HashMap<>();
                    reviewOverview.put("id", review.getId());
                    reviewOverview.put("fullName", review.getFullName());
                    reviewOverview.put("rating", review.getRating());
                    reviewOverview.put("comment", review.getComment());
                    return reviewOverview;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(reviewOverviews);
    }

    public ResponseEntity<?> deleteReview(String id){
        reviewRepository.deleteById(new ObjectId(id));
        return ResponseEntity.ok("Delete comment by Admin");
    }
}
