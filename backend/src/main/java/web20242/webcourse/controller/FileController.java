package web20242.webcourse.controller;

import org.bson.types.ObjectId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import web20242.webcourse.model.Image;
import web20242.webcourse.model.createRequest.Logo;
import web20242.webcourse.service.FileService;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/upload")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

//    @PreAuthorize("hasRole('ROLE_ADMIN')")
//    @PostMapping("/image")
//    public String uploadFile(
//            @RequestParam("image") MultipartFile file,
//            @RequestParam(value = "type", required = false) String type,
//            @RequestParam(value = "altText", required = false) String altText
//    ) throws IOException, NoSuchAlgorithmException {
//        return fileService.uploadFile(file, type, altText);
//    }


    @GetMapping("/all-image")
    public ResponseEntity<?> getAllImage(){
        return ResponseEntity.ok(fileService.getAllImageForAdmin());
    }
    @GetMapping("/get-image/{type}")
    public ResponseEntity<?> getAllImageHaveType(@PathVariable String type){
        return ResponseEntity.ok(fileService.getAllImageHaveType(type));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<?> createImageSystem(@RequestBody Image image){
        return ResponseEntity.ok(fileService.save(image));
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/update/{id}")
    public ResponseEntity<?> createImageSystem(@RequestBody Image image, @PathVariable String id){
        image.setId(new ObjectId(id));
        return ResponseEntity.ok(fileService.save(image));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/delete-image/{id}")
    public void createImageSystem(@PathVariable String id){
        fileService.deleteImage(id);
    }
//    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
//    @DeleteMapping("/delete-all-image")
//    public void createImageSystem(){
//        fileService.deleteAllImage();
//    }

    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER') || hasRole('ROLE_USER') ")
    @PostMapping("/image/r2")
    public String uploadFileR2(
            @RequestParam("image") MultipartFile file
    ) throws IOException, NoSuchAlgorithmException {
        return fileService.uploadFileR2(file);
    }
    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @DeleteMapping("/image/{id}")
    public void deleteFile(@PathVariable("id") String imageId) {
        fileService.deleteFile(imageId);
    }
    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @DeleteMapping("/image/by-url")
    public ResponseEntity<String> deleteFileByUrl(@RequestParam("imageUrl") String imageUrl) {
        fileService.deleteFileByUrl(imageUrl);
        return ResponseEntity.ok("Image with URL " + imageUrl + " deleted successfully");
    }
    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFileOnR2(@RequestParam("fileUrl") String fileUrl) {
        fileService.deleteFileOnR2ByUrl(fileUrl);
        return ResponseEntity.ok("File with URL " + fileUrl + " deleted from R2 successfully");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleNotFound(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
    @PostMapping("/pdf")
    public List<String> uploadPdfToR2(
            @RequestParam("files") List<MultipartFile> files
    ) throws IOException, NoSuchAlgorithmException {
        List<String> uploadedUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!isPdfFile(file)) {
                throw new IllegalArgumentException("Only PDF files are allowed");
            }
            String url = fileService.uploadFileR2(file);
            uploadedUrls.add(url);
        }
        return uploadedUrls;
    }
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/logo")
    public String uploadLogo(
            @RequestParam("logo") MultipartFile file
    ) throws IOException, NoSuchAlgorithmException {
        return fileService.uploadFileR2(file);
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/upLogo")
    public ResponseEntity<?> upLogo(@RequestBody Logo logo){
        return ResponseEntity.ok(fileService.upLogo(logo));
    }

//    @PreAuthorize("hasRole('ROLE_ADMIN') || hasRole('ROLE_TEACHER')")
//    @PostMapping("/video")
//    public String uploadVideoToR2(
//            @RequestParam("file") MultipartFile file
//    ) throws IOException, NoSuchAlgorithmException {
//        if (!isPdfFile(file)) {
//            throw new IllegalArgumentException("Only PDF files are allowed");
//        }
//        return fileService.uploadFileR2(file);
//    }

    private boolean isPdfFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.equals("application/pdf");
    }

}