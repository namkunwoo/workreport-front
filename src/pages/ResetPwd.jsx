import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Alert, Link } from "@mui/material";
import axios from "axios";
import "../styles/Register.css";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleResetPassword = async () => {
    if (!token) {
      setErrorMessage("❌ 유효하지 않은 링크입니다.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMessage("⚠️ 새 비밀번호를 입력해주세요.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("⚠️ 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/local/api/auth/reset-password", {
        token,
        newPassword,
      });

      setSuccessMessage(response.data.message || "✅ 비밀번호가 변경되었습니다.");
      setErrorMessage("");

      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "❌ 비밀번호 변경에 실패했습니다.");
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="register-container" display="flex" flexDirection="column" alignItems="center">
      <Box className="register-box" p={3} borderRadius={2} boxShadow={3} bgcolor="white">
        <Typography variant="h4" gutterBottom>
          Reset Password
        </Typography>

        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        <TextField
          fullWidth
          type="password"
          label="New Password"
          variant="outlined"
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <TextField
          fullWidth
          type="password"
          label="Confirm Password"
          variant="outlined"
          margin="normal"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleResetPassword}
          disabled={loading}
        >
          {loading ? "처리 중..." : "비밀번호 변경"}
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

export default ResetPasswordPage;
