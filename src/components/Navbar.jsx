import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [remainingTime, setRemainingTime] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const WARNING_TIME = 5 * 60 * 1000; // 5분 전 경고

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        const decoded = jwtDecode(token);
        const expiryTime = decoded.exp * 1000;

        const updateTimer = () => {
          const now = Date.now();
          const timeLeft = expiryTime - now;

          if (timeLeft <= WARNING_TIME) {
            setOpenDialog(true);
          }

          if (timeLeft <= 0) {
            logout();
            navigate("/");
          } else {
            setRemainingTime(Math.floor(timeLeft / 60000)); // 분 단위 표시
          }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
      }
    }
  }, [user, logout, navigate]);

  const extendSession = async () => {
    try {
      const response = await fetch("/local/api/auth/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("jwtToken", data.token); // 새로운 토큰 저장
        setOpenDialog(false); // 모달 닫기
        window.location.reload(); // 새 토큰 반영 위해 새로고침
      } else {
        handleLogout(); // 실패 시 로그아웃
      }
    } catch (error) {
      console.error("세션 연장 실패:", error);
      handleLogout();
    }
  };

  const handleLogout = () => {
    setOpenDialog(false); // 모달 닫기
    logout();             // JWT 삭제
    navigate("/");        // 로그인 페이지로 이동
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            업무 보고 시스템
          </Typography>

          {user && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                {user.name} 님 환영합니다
              </Typography>

              <Typography
                variant="subtitle2"
                sx={{
                  mr: 2,
                  fontWeight: "bold",
                  color: "yellow",
                  cursor: "pointer",
                }}
                onClick={() => setOpenDialog(true)} // ⏳ 클릭 시 모달 열기
              >
                ⏳ 로그인 유지: {remainingTime}분 남음
              </Typography>

              <Button color="inherit" onClick={() => navigate("/mypage")}>
                마이페이지
              </Button>
              <Button color="inherit" onClick={logout}>
                로그아웃
              </Button>
              <Button color="inherit" onClick={() => navigate("/import")}>
                엑셀 업로드
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* 로그인 연장 모달 */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>로그인 유지 시간이 곧 만료됩니다</DialogTitle>
        <DialogContent>계속 이용하시려면 로그인 기간을 연장하세요.</DialogContent>
        <DialogActions>
          <Button onClick={handleLogout} color="secondary">
            로그아웃
          </Button>
          <Button onClick={extendSession} color="primary">
            로그인 연장
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
