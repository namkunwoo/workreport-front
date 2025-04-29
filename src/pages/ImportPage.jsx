import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  FormControlLabel,
  RadioGroup,
  Radio,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

const ImportPage = () => {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("replace"); // replace or append
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("업로드할 엑셀 파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode); // replace or append

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post("/local/api/work-reports/file/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("✅ 엑셀 업로드 및 마이그레이션 성공!");
    } catch (err) {
      setError("❌ 엑셀 업로드 실패: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth="600px" mx="auto" mt={5} p={3} boxShadow={3} borderRadius={2} bgcolor="white">
      <Typography variant="h5" gutterBottom>
        업무보고 엑셀 업로드
      </Typography>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

      <input type="file" accept=".xlsx" onChange={handleFileChange} style={{ marginTop: "16px" }} />

      <Typography sx={{ mt: 3, mb: 1 }}>📌 기존 데이터 처리 방식</Typography>
      <RadioGroup row value={mode} onChange={(e) => setMode(e.target.value)}>
        <FormControlLabel value="replace" control={<Radio />} label="기존 데이터 삭제 후 업로드" />
        <FormControlLabel value="append" control={<Radio />} label="기존 데이터에 추가" />
      </RadioGroup>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "엑셀 업로드"}
      </Button>
    </Box>
  );
};

export default ImportPage;
