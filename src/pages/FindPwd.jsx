import React, { useState } from "react";
import { TextField, Button, Box, Typography, Alert, Link } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Register.css";

const FindPwd = () => {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleResetRequest = async () => {
    if (!email) {
      setErrorMessage("⚠️ 이메일을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/local/api/auth/reset-password-request", {
        email,
      });
      setSuccessMessage(response.data.message || "✅ 비밀번호 재설정 링크가 전송되었습니다.");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "❌ 이메일 전송 실패. 다시 시도해주세요.");
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="register-container" display="flex" flexDirection="column" alignItems="center">
      <Box className="register-box" p={3} borderRadius={2} boxShadow={3} bgcolor="white">
        <Typography variant="h4" gutterBottom>
          Find Password
        </Typography>

        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        <TextField
          fullWidth
          type="email"
          label="Email"
          variant="outlined"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleResetRequest}
          disabled={loading}
        >
          {loading ? "처리 중..." : "비밀번호 재설정 링크 보내기"}
        </Button>

        <Box display="flex" justifyContent="center" mt={2}>
          <Link href="/" variant="body2">
            로그인 페이지로 돌아가기
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default FindPwd;
