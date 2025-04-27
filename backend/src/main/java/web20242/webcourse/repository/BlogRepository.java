package web20242.webcourse.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web20242.webcourse.model.Blog;
import web20242.webcourse.model.constant.EStatus;

import java.util.List;

@Repository
public interface BlogRepository extends MongoRepository<Blog, ObjectId> {
    List<Blog> findByStatus(EStatus eStatus);
}
