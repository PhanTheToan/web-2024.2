package web20242.webcourse.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import web20242.webcourse.model.Category;
import web20242.webcourse.model.constant.ECategory;

import java.util.List;
import java.util.Map;

@Repository
public interface PopularCategoryRepository extends MongoRepository<Category,ObjectId> {
    

    List<Category> findByStatus(boolean b);

    Category findByCategory(String name);
}
