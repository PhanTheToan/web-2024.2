package web20242.webcourse.controller;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import web20242.webcourse.model.createRequest.EmailDetail;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {
    private final JavaMailSender javaMailSender;

    @PostMapping("/thanks")
    public void sendEmailForThanksUser(@RequestBody EmailDetail emailDetail) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

        try {
            String htmlTemplate = new String(Files.readAllBytes(Paths.get("src/main/java/web20242/webcourse/model/template/thanks.hbs")), StandardCharsets.UTF_8);

            htmlTemplate = htmlTemplate.replace("{{fullName}}", emailDetail.getFullName());
            htmlTemplate = htmlTemplate.replace("{{message}}", emailDetail.getMessage());
            htmlTemplate = htmlTemplate.replace("{{recipientEmail}}", emailDetail.getEmail());

            helper.setTo(emailDetail.getEmail());
            helper.setSubject("Thông báo từ Alpha Education");
            helper.setText(htmlTemplate, true);
            helper.setFrom("mclasspart1@gmail.com");

            javaMailSender.send(message);

        } catch (Exception e) {
            throw new MessagingException("Failed to send email: " + e.getMessage(), e);
        }
    }
}
