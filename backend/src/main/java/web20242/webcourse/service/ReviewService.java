package web20242.webcourse.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import web20242.webcourse.model.Review;
import web20242.webcourse.model.User;
import web20242.webcourse.repository.ReviewRepository;
import web20242.webcourse.repository.UserRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

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
}
