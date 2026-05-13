import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import CreateExam from "./pages/Exam/CreateExam";
import ExamList from "./pages/Exam/ExamList";
import TakeExam from "./pages/Exam/TakeExam";
import ManageExam from "./pages/Exam/ManageExam";
import GradeExam from "./pages/Submissions/GradeExam";
import ReviewResult from "./pages/Submissions/ReviewResult";
import Navbar from "./components/layout/Navbar";
import ViewResults from "./pages/Submissions/ViewResults";
import ProtectedRoute from "./components/ProtectedRoute";
import EditExam from "./pages/Exam/EditExam";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import TeacherDashboard from "./pages/Dashboard/TeacherDashboard";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Setting/Profile";
import AdminDashboard from "./pages/Dashboard/AdminDashboard";
import ExamSubmissions from "./pages/Exam/ExamSubmissions";
import GradeSubmission from "./pages/Submissions/GradeSubmission";
import SubmissionList from "./pages/Submissions/SubmissionList";
import Footer from "./components/layout/Footer";
import LogoDesignLab from "./components/layout/LogoDesignLab";
import ActivityLog from "./pages/Setting/ActivityLog";
import UISettings from "./pages/Setting/UISettings";
import ActivityLogTeacher from "./pages/Setting/ActivityLogTeacher";

const MainLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-slate-50/50">
    <Navbar />
    <div className="content flex-grow">{children}</div>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* TRANG RIÊNG BIỆT: Không có Navbar & Footer */}
          <Route path="/design-lab" element={<LogoDesignLab />} />

          {/* CÁC TRANG CÒN LẠI: Có đầy đủ Navbar & Footer */}
          <Route
            path="*"
            element={
              <MainLayout>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<Navigate to="/login" />} />

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

                  <Route
                    path="/student-dashboard"
                    element={<StudentDashboard />}
                  />
                  <Route
                    path="/teacher-dashboard"
                    element={<TeacherDashboard />}
                  />

                  <Route
                    path="/activity-log"
                    element={
                      <ProtectedRoute roleRequired="member">
                        <ActivityLog />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/teacher-activity"
                    element={
                      <ProtectedRoute roleRequired="user">
                        <ActivityLogTeacher />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="/grade/:submissionId" element={<GradeExam />} />
                  <Route path="/review-result/:id" element={<ReviewResult />} />
                  <Route path="/view-results" element={<ViewResults />} />
                  <Route path="/edit-exam/:id" element={<EditExam />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />

                  <Route path="/activity-log" element={<ActivityLog />} />

                  <Route path="/activity-log" element={<ActivityLog />} />
                  <Route path="/ui-settings" element={<UISettings />} />

                  <Route
                    path="/exam-submissions/:examId"
                    element={<ExamSubmissions />}
                  />

                  <Route
                    path="/grade-submission/:submissionId"
                    element={<GradeSubmission />}
                  />

                  <Route
                    path="/submissions/:examId"
                    element={<SubmissionList />}
                  />
                </Routes>
              </MainLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
