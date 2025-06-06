package web20242.webcourse.service;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import web20242.webcourse.model.Image;
import web20242.webcourse.model.createRequest.Logo;
import web20242.webcourse.repository.ImageRepository;
import web20242.webcourse.repository.LogoRepository;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class FileService {

    private final S3Client s3Client;
    private final ImageRepository imageRepository;

    @Autowired
    private LogoRepository logoRepository;
    @Value("${cloudflare.r2.bucket}")
    private String bucketName;

    @Value("${cloudflare.r2.public-url}")
    private String publicUrl;

    public FileService(S3Client s3Client, ImageRepository imageRepository) {
        this.s3Client = s3Client;
        this.imageRepository = imageRepository;
    }

//    public String uploadFile(MultipartFile file, String type, String altText) throws IOException, NoSuchAlgorithmException {
//        String originalFilename = file.getOriginalFilename();
//        if (originalFilename == null) {
//            throw new IllegalArgumentException("File name cannot be null");
//        }
//        String fileNameHash = hashFilename(originalFilename);
//        String extension = originalFilename.contains(".")
//                ? originalFilename.substring(originalFilename.lastIndexOf("."))
//                : "";
//        String fileName = System.currentTimeMillis() + "_"
//                + fileNameHash.replace("/", "")
//                + extension;
//
//
//        PutObjectRequest request = PutObjectRequest.builder()
//                .bucket(bucketName)
//                .key(fileName)
//                .contentType(determineContentType(extension)) // Thêm dòng này
//                .build();
//
//        s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
//
//        String filePublicUrl = publicUrl + fileName;
//
//        Image image = Image.builder()
//                .imageUrl(filePublicUrl)
//                .type(type != null ? type : "Default")
//                .altText(altText != null ? altText : "No description")
//                .createdAt(LocalDateTime.now())
//                .build();
//        imageRepository.save(image);
//
//        return filePublicUrl;
//    }
    public String uploadFileR2(MultipartFile file) throws IOException, NoSuchAlgorithmException {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("File name cannot be null");
        }
        String fileNameHash = hashFilename(originalFilename);
        String extension = originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String fileName = System.currentTimeMillis() + "_"
                + fileNameHash.replace("/", "")
                + extension;


        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(determineContentType(extension)) // Thêm dòng này
                .build();

        s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        String filePublicUrl = publicUrl + fileName;
        return filePublicUrl;
    }
    public void deleteFile(String imageId) {
        Optional<Image> imageOptional = imageRepository.findById(new org.bson.types.ObjectId(imageId));
        if (imageOptional.isEmpty()) {
            throw new IllegalArgumentException("Image with ID " + imageId + " not found");
        }

        Image image = imageOptional.get();
        String imageUrl = image.getImageUrl();

        // Lấy key từ imageUrl (phần sau publicUrl)
        String key = imageUrl.replace(publicUrl, "");

        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();
        s3Client.deleteObject(deleteRequest);

        imageRepository.delete(image);
    }
    public void deleteFileByUrl(String imageUrl) {
        if (!imageUrl.startsWith(publicUrl)) {
            throw new IllegalArgumentException("Invalid image URL: " + imageUrl);
        }
        Optional<Image> imageOptional = imageRepository.findByImageUrl(imageUrl);
        if (imageOptional.isEmpty()) {
            throw new IllegalArgumentException("Image with URL " + imageUrl + " not found");
        }

        Image image = imageOptional.get();
        String key = imageUrl.replace(publicUrl, "");

        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();
        s3Client.deleteObject(deleteRequest);

        imageRepository.delete(image);
    }
    public void deleteFileOnR2ByUrl(String fileUrl) {
        if (!fileUrl.startsWith(publicUrl)) {
            throw new IllegalArgumentException("Invalid File URL: " + fileUrl);
        }

        String key = fileUrl.replace(publicUrl, "");

        DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();
        s3Client.deleteObject(deleteRequest);
    }
    private String determineContentType(String extension) {
        return switch (extension.toLowerCase()) {
            case ".jpg", ".jpeg" -> "image/jpeg";
            case ".png" -> "image/png";
            case ".gif" -> "image/gif";
            case ".webp" -> "image/webp";
            case ".pdf" -> "application/pdf";
            case ".svg" -> "application/svg";
            case ".xml"-> "application/xml";
            default -> "application/octet-stream";
        };
    }


    private String hashFilename(String filename) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        md.update(filename.getBytes(StandardCharsets.UTF_8));
        byte[] digest = md.digest();
        return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
    }


    public ResponseEntity<?> upLogo(Logo logo) {
        return ResponseEntity.ok(logoRepository.save(logo));
    }

    public ResponseEntity<?> getAllImageForAdmin() {
        return ResponseEntity.ok(imageRepository.findAll());
    }

    public ResponseEntity<?> getAllImageHaveType(String type) {
        return ResponseEntity.ok(imageRepository.findAllByType(type));
    }

    public ResponseEntity<?> save(Image image) {
        image.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(imageRepository.save(image));
    }

    public void deleteImage(String id) {
        Image image = imageRepository.findById(new ObjectId(id)).orElse(null);
        imageRepository.delete(image);
    }

    public void deleteAllImage() {
        List<Image> imageList = imageRepository.findAll();
        imageList.forEach(imageRepository::delete);
    }
}