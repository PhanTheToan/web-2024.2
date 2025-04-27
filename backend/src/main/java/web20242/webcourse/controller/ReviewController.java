package web20242.webcourse.controller;

import jakarta.websocket.server.PathParam;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import web20242.webcourse.model.User;
import web20242.webcourse.model.createRequest.ReviewRequest;
import web20242.webcourse.service.ReviewService;

import java.security.Principal;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    @Autowired
    private ReviewService reviewService;

//    @PutMapping("/updateFullNames")
//    public void updateFullNames(){
//        reviewService.updateFullNames();
//    }

    @GetMapping()
    public ResponseEntity<?> getRatingRandom(){
        return ResponseEntity.ok(reviewService.getRatingRandom());
    }

    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping
    public ResponseEntity<?> sendReview(@RequestBody ReviewRequest reviewRequest, Principal principal){
        return ResponseEntity.ok(reviewService.sendReviewByUser(reviewRequest, principal));
    }

    @GetMapping("/per/{id}")
    public ResponseEntity<?> getReviewPerCourse(@PathVariable String id){
        return ResponseEntity.ok(reviewService.getReviewPerCourse(new ObjectId(id)));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping
    public ResponseEntity<?> deleteComment(@RequestParam("id") String id){
        if (!ObjectId.isValid(id)) {
            return ResponseEntity.badRequest().body("Invalid review ID format. ID must be a 24-character hexadecimal string.");
        }
        System.out.printf(id);
        return ResponseEntity.ok(reviewService.deleteReview(id));
    }


}
