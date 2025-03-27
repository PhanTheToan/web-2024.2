package web20242.webcourse.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web20242.webcourse.model.Image;

import java.util.Optional;

@Repository
public interface ImageRepository extends MongoRepository<Image, ObjectId> {
    Optional<Image> findByImageUrl(String imageUrl);
}
