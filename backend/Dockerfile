# Stage 1: Build ứng dụng
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Tạo image chạy ứng dụng
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/target/webcourse-0.0.1-SNAPSHOT.jar app.jar
#COPY .env .env
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]