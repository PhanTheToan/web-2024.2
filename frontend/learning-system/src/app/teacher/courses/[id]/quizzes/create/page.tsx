"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { courseService } from "@/services/courseService";
import { quizService } from "@/services/quizService";
import Link from "next/link";
import { ArrowLeft, PlusCircle, MinusCircle, Save, HelpCircle } from "lucide-react";
import { Course, QuizQuestion } from "@/app/types";

export default function CreateQuizPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState<number>(30);
  const [passingScore, setPassingScore] = useState<number>(70);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { question: "", options: ["", "", "", ""], correctAnswer: "0" }
  ]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [questionErrors, setQuestionErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const fetchedCourse = await courseService.getCourseById(courseId);
        setCourse(fetchedCourse);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Không thể tải thông tin khóa học. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const newQuestions = [...questions];
    
    if (field === 'question') {
      newQuestions[index].question = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('-')[1]);
      newQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = value;
    }
    
    setQuestions(newQuestions);
    
    // Clear error for this question if it exists
    if (questionErrors[index]) {
      const newErrors = {...questionErrors};
      delete newErrors[index];
      setQuestionErrors(newErrors);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: "0" }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
      
      // Update question errors
      const newErrors: Record<number, string> = {};
      Object.keys(questionErrors).forEach(key => {
        const questionIndex = parseInt(key);
        if (questionIndex < index) {
          newErrors[questionIndex] = questionErrors[questionIndex];
        } else if (questionIndex > index) {
          newErrors[questionIndex - 1] = questionErrors[questionIndex];
        }
      });
      setQuestionErrors(newErrors);
    }
  };

  const validateQuestions = (): boolean => {
    const errors: Record<number, string> = {};
    let isValid = true;

    questions.forEach((question, index) => {
      if (!question.question.trim()) {
        errors[index] = "Câu hỏi không được để trống";
        isValid = false;
        return;
      }

      let hasEmptyOption = false;
      question.options.forEach((option, optionIndex) => {
        if (!option.trim()) {
          hasEmptyOption = true;
        }
      });

      if (hasEmptyOption) {
        errors[index] = "Các lựa chọn không được để trống";
        isValid = false;
      }
    });

    setQuestionErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      setError("Vui lòng điền tiêu đề bài kiểm tra");
      return;
    }

    if (!validateQuestions()) {
      setError("Vui lòng kiểm tra lại thông tin các câu hỏi");
      return;
    }

    try {
      setError(null);
      setSubmitting(true);

      // Create the quiz
      await quizService.createQuiz({
        courseId,
        title,
        description,
        timeLimit,
        passingScore,
        questions
      });

      setSuccess(true);
      // Redirect after successful submission
      setTimeout(() => {
        router.push(`/teacher/courses/${courseId}`);
      }, 2000);
    } catch (err) {
      console.error("Error creating quiz:", err);
      setError("Không thể tạo bài kiểm tra. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-700">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error || "Không tìm thấy thông tin khóa học"}</p>
            </div>
          </div>
        </div>
        <Link
          href={`/teacher/courses`}
          className="bg-teal-600 text-white px-4 py-2 rounded-md inline-flex items-center hover:bg-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách khóa học
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Link
          href={`/teacher/courses/${courseId}`}
          className="text-gray-500 hover:text-gray-700 mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">Thêm bài kiểm tra mới</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-1">Khóa học</div>
          <div className="text-lg font-medium">{course.title}</div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Bài kiểm tra đã được tạo thành công! Đang chuyển hướng...</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề bài kiểm tra <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian làm bài (phút)
              </label>
              <input
                type="number"
                id="timeLimit"
                min="1"
                max="180"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 30)}
              />
            </div>

            <div>
              <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-1">
                Điểm đạt (%)
              </label>
              <input
                type="number"
                id="passingScore"
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                value={passingScore}
                onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Câu hỏi</h3>
              <button
                type="button"
                className="bg-teal-600 text-white px-3 py-1.5 rounded-md flex items-center text-sm hover:bg-teal-700 transition-colors"
                onClick={addQuestion}
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                Thêm câu hỏi
              </button>
            </div>

            <div className="space-y-6">
              {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-2">
                        {questionIndex + 1}
                      </span>
                      <h4 className="font-medium">Câu hỏi {questionIndex + 1}</h4>
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        <MinusCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {questionErrors[questionIndex] && (
                    <div className="mb-3 text-sm text-red-500">
                      {questionErrors[questionIndex]}
                    </div>
                  )}

                  <div className="mb-4">
                    <label
                      htmlFor={`question-${questionIndex}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nội dung câu hỏi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`question-${questionIndex}`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      value={question.question}
                      onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Các lựa chọn</span>
                      <div className="relative ml-2 group">
                        <HelpCircle className="w-4 h-4 text-gray-400" />
                        <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-48 bg-gray-800 text-white text-xs p-2 rounded shadow-lg">
                          Chọn đáp án đúng bằng cách nhấn vào nút radio tương ứng
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center">
                          <input
                            type="radio"
                            id={`question-${questionIndex}-option-${optionIndex}`}
                            name={`question-${questionIndex}-correct`}
                            className="mr-2 text-teal-600 focus:ring-teal-500"
                            checked={question.correctAnswer === optionIndex.toString()}
                            onChange={() => handleQuestionChange(questionIndex, 'correctAnswer', optionIndex.toString())}
                          />
                          <input
                            type="text"
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                            value={option}
                            placeholder={`Lựa chọn ${optionIndex + 1}`}
                            onChange={(e) => handleQuestionChange(questionIndex, `option-${optionIndex}`, e.target.value)}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Link
              href={`/teacher/courses/${courseId}`}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Hủy
            </Link>
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Tạo bài kiểm tra
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 