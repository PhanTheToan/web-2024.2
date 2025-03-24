package web20242.webcourse;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WebcourseApplication {

	public static void main(String[] args) {
		// Config dotenv
		Dotenv dotenv = Dotenv.configure().load();
		System.setProperty("DATA_BASE_USER", dotenv.get("DATA_BASE_USER"));
		System.setProperty("DATA_BASE_PASSWORD", dotenv.get("DATA_BASE_PASSWORD"));
		System.setProperty("DATA_BASE_NAME", dotenv.get("DATA_BASE_NAME"));
		System.setProperty("JWT_SECRET", dotenv.get("JWT_SECRET"));
		System.setProperty("JWT_EXPIRATION", dotenv.get("JWT_EXPIRATION"));
		System.setProperty("MAIL_HOST", dotenv.get("MAIL_HOST"));
		System.setProperty("MAIL_PORT", dotenv.get("MAIL_PORT"));
		System.setProperty("MAIL_USERNAME", dotenv.get("MAIL_USERNAME"));
		System.setProperty("MAIL_PASSWORD", dotenv.get("MAIL_PASSWORD"));

		SpringApplication.run(WebcourseApplication.class, args);

	}

}
