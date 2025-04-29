import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import FindPwd from "./pages/FindPwd";
import MyPage from "./pages/MyPage"; 
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar"; 
import ImportPage from "./pages/ImportPage"; 

console.log("🔥 App 실행됨");

const ProtectedRoute = ({ element }) => {
  const { user } = useAuth();

  console.log("🔍 ProtectedRoute - 현재 로그인 사용자:", user);

  if (user === null) {
    return <Navigate to="/" replace state={{ from: "/dashboard" }} />;
  }

  return element;
};


const App = () => {
  return (
    <AuthProvider> {/* ✅ `AuthProvider`가 최상단에서 감싸고 있어야 함 */}
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<LoginForm />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/mypage" element={<ProtectedRoute element={<MyPage />} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/findPwd" element={<FindPwd />} />
          <Route path="/import" element={<ProtectedRoute element={<ImportPage />} />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
