package web20242.webcourse.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web20242.webcourse.model.Review;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, ObjectId> {
    List<Review> findByCourseId(ObjectId courseId);
}
