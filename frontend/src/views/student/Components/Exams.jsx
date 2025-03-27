import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { useGetExamsQuery } from '../../../slices/examApiSlice';

const Exams = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const { data: exams, error, isLoading } = useGetExamsQuery();

  console.log("Exam User ", userInfo);

  const handleStartExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) {
    toast.error(error?.data?.message || "Failed to fetch exams");
    return <div>Error loading exams</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Available Exams</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams?.map((exam) => (
          <div
            key={exam._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-4">{exam.examName}</h2>
            <p className="text-gray-600 mb-2">
              Total Questions: {exam.totalQuestions}
            </p>
            <p className="text-gray-600 mb-4">Duration: {exam.duration} minutes</p>
            <button
              onClick={() => handleStartExam(exam._id)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Start Exam
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Exams;
