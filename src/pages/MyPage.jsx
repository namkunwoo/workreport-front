import React, { useState } from "react";
import { Box, TextField, Button, Typography, Alert } from "@mui/material";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const MyPage = () => {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = async () => {
    try {
      const response = await axios.post("/api/auth/change-password", {
        username: user.username,
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      setMessage(response.data.message);
      setError(null);
    } catch (error) {
      setError("❌ 비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.");
      setMessage(null);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" mt={5}>
      <Typography variant="h4">마이페이지</Typography>
      <Typography variant="h6" sx={{ mt: 2 }}>
        {user.name}님, 회원정보를 변경할 수 있습니다.
      </Typography>

      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

      <TextField
        fullWidth label="현재 비밀번호" type="password" name="currentPassword"
        variant="outlined" margin="normal" onChange={handleChange} required
      />
      <TextField
        fullWidth label="새 비밀번호" type="password" name="newPassword"
        variant="outlined" margin="normal" onChange={handleChange} required
      />
      <Button variant="contained" color="primary" onClick={handlePasswordChange} sx={{ mt: 2 }}>
        비밀번호 변경
      </Button>
    </Box>
  );
};

export default MyPage;
