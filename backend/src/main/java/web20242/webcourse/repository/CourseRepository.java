package web20242.webcourse.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import web20242.webcourse.model.Course;

import java.util.ArrayList;
import java.util.List;

@Repository
public interface CourseRepository extends MongoRepository<Course, ObjectId> {
    ArrayList<Course> findByCategoriesIn(List<String> finance);

    @Query("""
{
    $and: [
        { $or: [ { 'categories': { $all: ?0 } }, { ?0 : {$exists: false} } ] },
        { $or: [ { 'teacherId': { $in: ?2 } }, { ?2 : {$exists: false} } ] },
        { 'price': { $gte: ?3, $lte: ?4 } },
        { $or: [ 
            { 'averageRating': { $in: ?1 } }, 
            { ?1 : {$exists: false} } 
        ]}
    ]
}
""")
    List<Course> findByFilters(
            List<String> categories,
            List<Double> ratings,
            List<ObjectId> teacherIds,
            double minPrice,
            double maxPrice
    );





}
