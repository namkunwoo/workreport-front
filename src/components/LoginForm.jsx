import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Link } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";  // ✅ AuthContext 추가
import "../styles/LoginForm.css";

const LoginForm = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login, user } = useAuth(); // ✅ AuthContext에서 login() 함수 사용

  // ✅ 로그인 성공 시 자동으로 /dashboard 이동
  useEffect(() => {
    axios.get("/local/api/auth/hello") // ✅ 토큰 없이 호출
      .then(response => {
        setMessage(response.data.message);
      })
      .catch(error => {
        console.error("API 호출 오류:", error);
        setMessage("오류 발생: 서버 응답 없음");
    });

    if (user) {
      console.log("✅ 로그인 확인됨, /dashboard로 이동");
      navigate("/dashboard");
    }
  }, [user, navigate]); // ✅ `user`가 변경되면 실행

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/local/api/auth/login", formData);
      const token = response.data.token;
      console.log("🚀 로그인 성공, JWT 저장 시도:", token);

      login(token); // ✅ AuthContext의 login() 함수 호출
      console.log("✅ JWT 저장 완료, 로그인 처리됨");
    } catch (error) {
      console.error("❌ 로그인 실패:", error);
      setMessage("로그인 실패: 아이디 또는 비밀번호를 확인하세요.");
    }
  };

  return (
    <Box className="login-container" display="flex" flexDirection="column" alignItems="center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box className="login-box" p={3} borderRadius={2} boxShadow={3} bgcolor="white">
          <Typography variant="h4" gutterBottom>Login</Typography>
          <h3 style={{ color: "red" }}>{message}</h3>
          <form onSubmit={handleLogin}>
            <TextField fullWidth label="Username" name="username" variant="outlined" margin="normal" onChange={handleChange} required />
            <TextField fullWidth type="password" label="Password" name="password" variant="outlined" margin="normal" onChange={handleChange} required />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Login
            </Button>
          </form>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Link href="/register" variant="body2">Sign Up</Link>
            <Link href="/findPwd" variant="body2">Forgot Password?</Link>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default LoginForm;
