package web20242.webcourse.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import web20242.webcourse.model.Quizzes;

import java.io.IOException;
import java.net.URL;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

@Service
public class QuizGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(QuizGenerationService.class);

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public QuizGenerationService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        logger.info("Initialized QuizGenerationService with Gemini API Key: {}", geminiApiKey);
    }

    // Tải nội dung PDF từ URL
    public String extractTextFromPdfUrl(String pdfUrl) throws IOException {
        try (PDDocument document = PDDocument.load(new URL(pdfUrl).openStream())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public String generateQuizFromPdfUrl(String pdfUrl) throws IOException {
        logger.info("Generating quiz from PDF URL: {}", pdfUrl);
        String pdfContent = extractTextFromPdfUrl(pdfUrl);

        String prompt = "Dựa trên nội dung PDF sau đây, hãy tạo một bài quiz dạng JSON với định dạng như sau:\n" +
                "{\n" +
                "  \"title\": \"Một đoạn mã bất kì (bạn tự sinh)\",\n" +
                "  \"description\": \"Kiểm tra kiến thức từ tài liệu PDF\",\n" +
                "  \"material\": \""+pdfUrl+"\",\n" +
                "  \"order\": 1,\n" +
                "  \"passingScore\": 70.0,\n" +
                "  \"timeLimit\": 30,\n" +
                "  \"questions\": [\n" +
                "    {\n" +
                "      \"question\": \"Nội dung câu hỏi trích xuất từ PDF\",\n" +
                "      \"material\": \"" + null + "\",\n" +
                "      \"eQuestion\": \"LOẠI_CÂU_HỎI\", /* Phải là một trong các giá trị: SINGLE_CHOICE, MULTIPLE_CHOICE, SHORT_ANSWER */\n" +
                "      \"options\": [\"Đáp án A\", \"Đáp án B\", \"Đáp án C\", \"Đáp án D\"], /* Có thể là danh sách rỗng [] nếu là SHORT_ANSWER */\n" +
                "      \"correctAnswer\": [\"Đáp án đúng\"] /* Là một danh sách chứa một hoặc nhiều đáp án đúng */\n" +
                "    }\n" +
                "    /* ... các câu hỏi khác */\n" +
                "  ]\n" +
                "}\n" +
                "QUAN TRỌNG:\n" +
                "1.  **Xác định loại câu hỏi (eQuestion):**\n" +
                "    * Nếu câu hỏi có nhiều lựa chọn (A, B, C, D...) và chỉ có MỘT đáp án đúng duy nhất: đặt `eQuestion` là \"SINGLE_CHOICE\", `options` là danh sách các lựa chọn, `correctAnswer` là danh sách chứa MỘT đáp án đúng.\n" +
                "    * Nếu câu hỏi có nhiều lựa chọn và có thể có NHIỀU đáp án đúng: đặt `eQuestion` là \"MULTIPLE_CHOICE\", `options` là danh sách các lựa chọn, `correctAnswer` là danh sách chứa TẤT CẢ các đáp án đúng.\n" +
                "    * Nếu câu hỏi yêu cầu điền câu trả lời ngắn, không có lựa chọn sẵn: đặt `eQuestion` là \"SHORT_ANSWER\", `options` là danh sách rỗng [], `correctAnswer` là danh sách chứa MỘT câu trả lời ngắn đúng.\n" +
                "2.  **Trích xuất:** Trích xuất chính xác nội dung câu hỏi, các lựa chọn (nếu có), và (các) đáp án đúng từ nội dung PDF. Các đáp án đúng có thể được đánh dấu (KEY) hoặc nằm trong bảng đáp án ở cuối tài liệu.\n" +
                "3.  **Định dạng JSON:** Trả về JSON thuần túy, không bao bọc trong markdown code block (```json ... ```) hoặc bất kỳ nội dung nào khác ngoài JSON. Đảm bảo cấu trúc JSON hoàn toàn khớp với mẫu trên.\n" +
                "Nội dung PDF:\n" + pdfContent;

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
        logger.info("Calling Gemini API with URL: {}", url);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode contentsArray = objectMapper.createArrayNode();
        ObjectNode contentObject = objectMapper.createObjectNode();
        ArrayNode partsArray = objectMapper.createArrayNode();
        ObjectNode partObject = objectMapper.createObjectNode();
        partObject.put("text", prompt);
        partsArray.add(partObject);
        contentObject.set("parts", partsArray);
        contentsArray.add(contentObject);
        requestBody.set("contents", contentsArray);

        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            logger.info("Gemini API Response: {}", response.getBody());
            return response.getBody();
        } catch (HttpClientErrorException e) {
            logger.error("Gemini API Error: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Failed to call Gemini API: " + e.getResponseBodyAsString(), e);
        }
    }
    public String generateQuizFromPdfUrlForTHPTQG(String pdfUrl) throws IOException {
        logger.info("Generating quiz from PDF URL: {}", pdfUrl);
        String pdfContent = extractTextFromPdfUrl(pdfUrl);

        String prompt = "Dựa trên nội dung PDF sau đây, hãy tạo một bài quiz dạng JSON với định dạng như sau:\n" +
                "{\n" +
                "  \"title\": \"Một đoạn mã bất kì (bạn tự sinh)\",\n" +
                "  \"description\": \"Kiểm tra kiến thức cơ bản về lập trình\",\n" +
                "  \"order\": 1,\n" +
                "  \"passingScore\": 70.0,\n" +
                "  \"timeLimit\": 30,\n" +
                "  \"questions\": [\n" +
                "    {\n" +
                "      \"question\": \"Câu hỏi mẫu\",\n" +
                "      \"material\": \"" + pdfUrl + "\",\n" +
                "      \"options\": [\"A\", \"B\", \"C\", \"D\"],\n" +
                "      \"correctAnswer\": \"Đáp án đúng\"\n" +
                "    }\n" +
                "  ]\n" +
                "}\n" +
                "Hãy các số thứ tự câu hỏi và đáp án, các đáp án chỉ cần hiển thị A, B, C,... tương ứng với chọn trắc nghiệm mà không cần phải có giá trị và đáp án đúng từ nội dung PDF (Các đáp án đúng có thể được lưu ở bảng cuối của file hoặc ngay bên cạnh đáp án có (KEY) dấu hiệu đây là đáp án, chỉ cần biết là án nào A, B, C, D,... không cần phải cụ thể chứa gì  ) và với loại câu hỏi không có đáp án A, B, C, D,... là loại câu hỏi điền đáp án thì chỉ cần ghi nhận số câu hỏi là bao nhiêu và ghi nhận toàn bộ đáp án đúng(ghi đày đủ giá trị - Loại câu hỏi điền đáp án là câu mà đáp án chỉ có kết quả không có A, B hay C, D, ...) và trả về dưới dạng JSON đúng định dạng trên. " +
                "Trả về JSON thuần túy, không bao bọc trong markdown code block (```json ... ```) hoặc bất kỳ nội dung nào khác ngoài JSON.\n" +
                "Nội dung PDF:\n" + pdfContent;

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey;
        logger.info("Calling Gemini API with URL: {}", url);

        HttpHeaders headers = new HttpHeaders();
        headers.set("Content-Type", "application/json");

        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode contentsArray = objectMapper.createArrayNode();
        ObjectNode contentObject = objectMapper.createObjectNode();
        ArrayNode partsArray = objectMapper.createArrayNode();
        ObjectNode partObject = objectMapper.createObjectNode();
        partObject.put("text", prompt);
        partsArray.add(partObject);
        contentObject.set("parts", partsArray);
        contentsArray.add(contentObject);
        requestBody.set("contents", contentsArray);

        HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            logger.info("Gemini API Response: {}", response.getBody());
            return response.getBody();
        } catch (HttpClientErrorException e) {
            logger.error("Gemini API Error: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Failed to call Gemini API: " + e.getResponseBodyAsString(), e);
        }
    }

    // Chuyển đổi JSON thô từ Gemini thành đối tượng Quizzes
    public Quizzes parseQuizFromResponse(String geminiResponse) throws IOException {
        JsonNode responseNode = objectMapper.readTree(geminiResponse);
        String jsonContent = responseNode.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
        logger.info("Raw JSON content from Gemini response: {}", jsonContent);

        // Loại bỏ markdown code block nếu có
        String cleanedJsonContent = jsonContent;
        if (cleanedJsonContent.startsWith("```json")) {
            cleanedJsonContent = cleanedJsonContent.replaceFirst("```json\\s*", "");
            cleanedJsonContent = cleanedJsonContent.replaceFirst("```\\s*$", "");
            cleanedJsonContent = cleanedJsonContent.trim();
        }

        logger.info("Cleaned JSON content: {}", cleanedJsonContent);
        return objectMapper.readValue(cleanedJsonContent, Quizzes.class);
    }
}