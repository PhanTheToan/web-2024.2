package web20242.webcourse.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web20242.webcourse.model.Quiz;
@Repository
public interface QuestionRepository extends MongoRepository<Quiz, ObjectId> {
}
