package web20242.webcourse.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import web20242.webcourse.service.ReviewService;

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
}
