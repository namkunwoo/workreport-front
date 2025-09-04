import React, { useState, useEffect } from "react";
import { TextField, Button, Box, Typography, Link, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    verificationCode: "",
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [timer, setTimer] = useState(0); // 🔥 인증 코드 만료 타이머 (5분)
  const [resendTimer, setResendTimer] = useState(0); // 🔥 재전송 타이머 (30초)
  const [emailChecked, setEmailChecked] = useState(false); // ✅ 중복 확인 완료 여부 추가
  const [emailValid, setEmailValid] = useState(true); // ✅ 이메일 유효성
  const [passwordMatch, setPasswordMatch] = useState(true);


  const navigate = useNavigate();

  // 🔥 타이머 관리 (1초씩 감소)
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // 🔥 재전송 타이머 관리 (1초씩 감소)
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage("");
  };

  // ✅ 이메일 인증 코드 요청 (타이머 시작 + 재전송 버튼 비활성화)
  const requestEmailVerification = async () => {
    if (!formData.email || !emailValid) {
      setErrorMessage("⚠️ 올바른 이메일을 입력해주세요.");
      return;
    }

    if (!emailChecked) {
      setErrorMessage("⚠️ 이메일 중복 확인을 먼저 해주세요.");
      return;
    }

    try {
      await axios.post("/local/api/auth/send-verification-code", { email: formData.email });
      setEmailSent(true);
      setSuccessMessage("✅ 인증 코드가 이메일로 전송되었습니다.");
      setTimer(300); // 5분 타이머 시작 (300초)
      setResendTimer(30); // 30초 재전송 타이머 시작
    } catch (error) {
      setErrorMessage("❌ 이메일 인증 코드 전송에 실패했습니다.");
    }
  };

  // ✅ 인증 코드 확인
  const verifyEmailCode = async () => {
    if (!formData.verificationCode) {
      setErrorMessage("⚠️ 인증 코드를 입력해주세요.");
      return;
    }

    setErrorMessage(""); // 기존 에러 메시지 초기화
    setSuccessMessage(""); // 기존 성공 메시지 초기화

    try {
      const response = await axios.post("/local/api/auth/verify-code", {
        email: formData.email,
        code: formData.verificationCode,
      });

      if (response.data.success) {
        setEmailVerified(true);
        setSuccessMessage(response.data.message); // ✅ 성공 메시지 표시
      } else {
        setErrorMessage(response.data.message); // ✅ 실패 메시지 표시
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "❌ 인증 코드 확인에 실패했습니다.");
    }
  };

  // ✅ 이메일 중복 확인
  const checkEmailDuplication = async () => {
    if (!formData.email) {
      setErrorMessage("⚠️ 이메일을 입력해주세요.");
      return;
    }

    try {
      const res = await axios.get("/local/api/auth/check-email", {
        params: { email: formData.email },
      });
      if (res.data.exists) {
        setErrorMessage("❌ 이미 사용 중인 이메일입니다.");
        setEmailChecked(false);
      } else {
        setSuccessMessage("✅ 사용 가능한 이메일입니다.");
        setEmailChecked(true);
      }
    } catch {
      setErrorMessage("❌ 이메일 중복 확인 실패. 다시 시도해주세요.");
      setEmailChecked(false);
    }
  };

  // ✅ 이메일 유효성 검사
  const validateEmail = (email) => {
    // 간단한 정규표현식: user@domain.tld
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };


  // ✅ 회원가입 처리
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!emailVerified) {
      setErrorMessage("⚠️ 이메일 인증을 완료해야 합니다.");
      return;
    }

    setLoading(true);
    setErrorMessage(""); // 기존 에러 메시지 초기화
    setSuccessMessage(""); // 기존 성공 메시지 초기화

    try {
      const response = await axios.post("/local/api/auth/register", {
        username: formData.id,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        verificationCode: formData.verificationCode,
      });

      if (response.data.success) {
        setSuccessMessage(response.data.message); // ✅ 회원가입 성공 메시지 표시
        setTimeout(() => navigate("/"), 2000); // 2초 후 로그인 페이지로 이동
      } else {
        setErrorMessage(response.data.message); // ✅ 회원가입 실패 메시지 표시
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "❌ 회원가입에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };  

  return (
    <Box className="register-container" display="flex" flexDirection="column" alignItems="center">
      <Box className="register-box" p={3} borderRadius={2} boxShadow={3} bgcolor="white">
        <Typography variant="h4" gutterBottom>
          Sign Up
        </Typography>

        {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        <form onSubmit={handleRegister}>
          <TextField fullWidth label="ID" name="id" variant="outlined" margin="normal" onChange={handleChange} required />
          <TextField fullWidth type="password" label="Password" name="password" variant="outlined" margin="normal"
          onChange={(e) => {
            handleChange(e);
            if (e.target.name === "password" || e.target.name === "confirmPassword") {
              const pwd = e.target.name === "password" ? e.target.value : formData.password;
              const confirm = e.target.name === "confirmPassword" ? e.target.value : formData.confirmPassword;
              setPasswordMatch(pwd === confirm);
            }
          }} required />
          <TextField fullWidth type="password" label="Confirm Password" name="confirmPassword" variant="outlined" margin="normal" 
          onChange={(e) => {
            handleChange(e);
            if (e.target.name === "password" || e.target.name === "confirmPassword") {
              const pwd = e.target.name === "password" ? e.target.value : formData.password;
              const confirm = e.target.name === "confirmPassword" ? e.target.value : formData.confirmPassword;
              setPasswordMatch(pwd === confirm);
            }
          }} required 
          error={formData.confirmPassword !== "" && !passwordMatch}/>
          {formData.confirmPassword !== "" && !passwordMatch && (
            <Typography variant="body2" color="error">
              ❌ 비밀번호가 일치하지 않습니다.
            </Typography>
          )}

          <TextField fullWidth label="Name" name="name" variant="outlined" margin="normal" onChange={handleChange} required />

          <TextField fullWidth type="email" label="Email" name="email" variant="outlined" margin="normal" onChange={(e) => {handleChange(e); setEmailValid(validateEmail(e.target.value)); setEmailChecked(false); setSuccessMessage("");}} required error={formData.email !== "" && !emailValid}  />
          {formData.email !== "" && !emailValid && (
            <Typography variant="body2" color="error">
              ❌ 이메일 형식이 올바르지 않습니다.
            </Typography>
          )}
          <Button variant="outlined" color="info" onClick={checkEmailDuplication} sx={{ mt: 1 }} disabled={!emailValid}>
            이메일 중복 확인
          </Button>
          {emailChecked && emailValid && (
            <Alert severity="success" sx={{ mt: 1 }}>
              ✅ 사용 가능한 이메일입니다.
            </Alert>
          )}
          <Button variant="outlined" color="primary" onClick={requestEmailVerification} disabled={resendTimer > 0} sx={{ mt: 1 }}>
            {resendTimer > 0 ? `재전송 가능 시간: ${resendTimer}초` : "인증 코드 요청"}
          </Button>

          {emailSent && (
            <>
              <TextField fullWidth label="Verification Code" name="verificationCode" variant="outlined" margin="normal" onChange={handleChange} required />
              <Button variant="contained" color="secondary" onClick={verifyEmailCode} sx={{ mt: 1 }}>
                인증 코드 확인
              </Button>

              {/* 🔥 타이머 표시 */}
              {timer > 0 ? (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  ⏳ 인증 코드 만료까지 남은 시간: {Math.floor(timer / 60)}분 {timer % 60}초
                </Typography>
              ) : (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  ❌ 인증 코드가 만료되었습니다. 다시 요청하세요.
                </Typography>
              )}

              {/* 🔥 재전송 버튼 */}
              <Button variant="outlined" color="primary" onClick={requestEmailVerification} disabled={resendTimer > 0} sx={{ mt: 1 }}>
                {resendTimer > 0 ? `재전송 가능 시간: ${resendTimer}초` : "인증 코드 재전송"}
              </Button>
            </>
          )}

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading || !emailVerified || !passwordMatch}>
            {loading ? "처리 중..." : "Register"}
          </Button>
        </form>

        <Box display="flex" justifyContent="center" mt={2}>
          <Link href="/" variant="body2">
            Already have an account? Login
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
