import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./Login";
import Register from "./Register";
import CreateExam from "./CreateExam";
import ExamList from "./ExamList";
import TakeExam from "./TakeExam";
import ManageExam from "./ManageExam";
import GradeExam from "./GradeExam";
import ReviewResult from "./ReviewResult";
import Navbar from "./components/Navbar";
import ViewResults from "./ViewResults";
import ProtectedRoute from "./components/ProtectedRoute";
import EditExam from "./EditExam";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";
import Leaderboard from "./Leaderboard";
import Profile from "./Profile";
import AdminDashboard from "./AdminDashboard";
import ExamSubmissions from "./ExamSubmissions";
import GradeSubmission from "./GradeSubmission";
import SubmissionList from "./SubmissionList";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Mặc định vào login */}
            <Route path="/" element={<Navigate to="/login" />} />

            {/* Các trang sau này sẽ thêm ở đây */}

            <Route
              path="/create-exam"
              element={
                <ProtectedRoute roleRequired="user">
                  <CreateExam />
                </ProtectedRoute>
              }
            />

            <Route
              path="/exam-list"
              element={
                <ProtectedRoute roleRequired="member">
                  <ExamList />
                </ProtectedRoute>
              }
            />

            <Route path="/take-exam/:id" element={<TakeExam />} />

            <Route
              path="/manage-exams"
              element={
                <ProtectedRoute roleRequired="user">
                  <ManageExam />
                </ProtectedRoute>
              }
            />

            <Route path="/student-dashboard" element={<StudentDashboard />} />

            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />

            <Route path="/grade/:submissionId" element={<GradeExam />} />

            <Route path="/review-result/:id" element={<ReviewResult />} />

            <Route path="/view-results" element={<ViewResults />} />

            <Route path="/edit-exam/:id" element={<EditExam />} />

            <Route path="/leaderboard" element={<Leaderboard />} />

            <Route path="/profile" element={<Profile />} />

            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            <Route
              path="/exam-submissions/:examId"
              element={<ExamSubmissions />}
            />

            <Route
              path="/grade-submission/:submissionId"
              element={<GradeSubmission />}
            />

            <Route path="/submissions/:examId" element={<SubmissionList />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
