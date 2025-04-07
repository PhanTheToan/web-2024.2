"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { courseService } from "@/services/courseService";
import { quizService } from "@/services/quizService";
import Link from "next/link";
import { ArrowLeft, PlusCircle, MinusCircle, Save } from "lucide-react";
import { Course } from "@/app/types";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

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
        setCourse(fetchedCourse as Course);
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
      question.options.forEach(option => {
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
        router.push(`/admin/couserscontrol/${courseId}`);
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
          <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
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
          href={`/admin/couserscontrol`}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md inline-flex items-center hover:bg-indigo-700 transition-colors"
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
          href={`/admin/couserscontrol/${courseId}`}
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
                <p className="text-sm text-green-700">Bài kiểm tra đã được tạo thành công!</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề bài kiểm tra <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nhập tiêu đề bài kiểm tra"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Nhập mô tả bài kiểm tra (không bắt buộc)"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-1">
                  Thời gian làm bài (phút)
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="passingScore" className="block text-sm font-medium text-gray-700 mb-1">
                  Điểm đạt yêu cầu (%)
                </label>
                <input
                  type="number"
                  id="passingScore"
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 mb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Câu hỏi</h3>
              <div className="flex">
                <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  {questions.length} câu hỏi
                </div>
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-500">
              Thêm câu hỏi cho bài kiểm tra. Mỗi câu hỏi có 4 lựa chọn và 1 đáp án đúng.
            </div>
          </div>

          <div className="space-y-8 mt-6">
            {questions.map((question, questionIndex) => (
              <div
                key={questionIndex}
                className="bg-gray-50 p-4 rounded-lg border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Câu hỏi {questionIndex + 1}</h4>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-600 hover:text-red-800 flex items-center text-sm"
                    >
                      <MinusCircle className="w-4 h-4 mr-1" />
                      Xóa câu hỏi
                    </button>
                  )}
                </div>

                {questionErrors[questionIndex] && (
                  <div className="bg-red-50 text-red-700 p-2 mb-3 rounded text-sm">
                    {questionErrors[questionIndex]}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor={`question-${questionIndex}`}
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Nội dung câu hỏi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id={`question-${questionIndex}`}
                      value={question.question}
                      onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Nhập nội dung câu hỏi"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700">
                      Các lựa chọn <span className="text-red-500">*</span>
                    </div>

                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center">
                        <input
                          type="radio"
                          id={`question-${questionIndex}-option-${optionIndex}`}
                          name={`question-${questionIndex}-correct`}
                          value={optionIndex.toString()}
                          checked={question.correctAnswer === optionIndex.toString()}
                          onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleQuestionChange(questionIndex, `option-${optionIndex}`, e.target.value)}
                          className="ml-3 flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder={`Lựa chọn ${optionIndex + 1}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center text-indigo-600 hover:text-indigo-800 px-4 py-2 border border-dashed border-gray-300 rounded-md bg-white"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Thêm câu hỏi
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Link
              href={`/admin/couserscontrol/${courseId}`}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu bài kiểm tra
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 