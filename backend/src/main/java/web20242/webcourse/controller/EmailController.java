package web20242.webcourse.controller;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.parameters.P;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import web20242.webcourse.model.createRequest.EmailDetail;

import java.io.InputStream;
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

        String htmlTemplate = null;
        try (InputStream inputStream = new ClassPathResource("templates/thanks.hbs").getInputStream()) {
            htmlTemplate = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);

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
    @PostMapping("/contact")
    public void sendEmailContactToAdmin(@RequestBody EmailDetail emailDetail) throws MessagingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

        String htmlTemplate = null;
        try (InputStream inputStream = new ClassPathResource("templates/contact.hbs").getInputStream()) {
            htmlTemplate = StreamUtils.copyToString(inputStream, StandardCharsets.UTF_8);

            htmlTemplate = htmlTemplate.replace("{{fullName}}", emailDetail.getFullName());
            htmlTemplate = htmlTemplate.replace("{{message}}", emailDetail.getMessage());
            htmlTemplate = htmlTemplate.replace("{{recipientEmail}}", emailDetail.getEmail());

            helper.setTo("mclasspart1@gmail.com");
            helper.setSubject(emailDetail.getFullName()+" từ ContactForm");
            helper.setText(htmlTemplate, true);
            helper.setFrom(emailDetail.getEmail());

            sendEmailForThanksUser(emailDetail);
            javaMailSender.send(message);

        } catch (Exception e) {
            throw new MessagingException("Failed to send email: " + e.getMessage(), e);
        }
    }
}
