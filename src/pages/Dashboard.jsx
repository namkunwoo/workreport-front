import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, TextField
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import "../styles/Calendar.css";

import WorkReportForm from "../components/WorkReportForm";

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    axios.get("/local/api/work-reports/dates-with-reports")
      .then((res) => {
        const fetchedEvents = res.data.map((date) => ({
          title: "📝",
          start: date,
          display: "background",
          backgroundColor: "#c8e6c9",
        }));
        setEvents(fetchedEvents);
      })
      .catch((err) => console.error("❌ 날짜 로딩 실패:", err));
  }, []);

  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    setSelectedDate(clickedDate);
    loadTasks(clickedDate);
  };

  const loadTasks = (date) => {
    axios.get(`/local/api/work-reports/by-date?date=${date}`)
      .then((res) => setTasks(res.data))
      .catch((err) => console.error("❌ 업무 데이터 조회 실패:", err));
  };

  const downloadExcelFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleFullExport = async () => {
    try {
      const res = await axios.get("/local/api/work-reports/file/export-all", { responseType: "blob" });
      downloadExcelFile(res.data, `전체_업무보고.xlsx`);
    } catch (err) {
      console.error("❌ 전체 엑셀 다운로드 실패:", err);
      alert("전체 엑셀 내보내기에 실패했습니다.");
    }
  };

  const handleRangeExport = async () => {
    if (!startDate || !endDate) {
      alert("시작일과 종료일을 모두 선택해주세요.");
      return;
    }

    const start = startDate.toISOString().split("T")[0];
    const end = endDate.toISOString().split("T")[0];

    try {
      const res = await axios.get(`/local/api/work-reports/file/export?start=${start}&end=${end}`, { responseType: "blob" });
      downloadExcelFile(res.data, `${start}_${end}_업무보고.xlsx`);
    } catch (err) {
      console.error("❌ 범위 엑셀 다운로드 실패:", err);
      alert("범위 엑셀 내보내기에 실패했습니다.");
    }
  };

  const handleSaveTask = async (formData) => {
    try {
      await axios.post("/local/api/work-reports/create-report", {
        ...formData,
        workDate: selectedDate
      });

      alert("업무가 추가되었습니다!");
      setAddingTask(false);
      loadTasks(selectedDate);
    } catch (err) {
      console.error("❌ 업무 저장 실패:", err);
      alert("업무 저장에 실패했습니다.");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">📅 업무 보고 대시보드</Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          dateClick={handleDateClick}
          height="auto"
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 3, flexWrap: "wrap" }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <DatePicker label="시작일" value={startDate} onChange={setStartDate} renderInput={(params) => <TextField {...params} size="small" />} />
              <DatePicker label="종료일" value={endDate} onChange={setEndDate} renderInput={(params) => <TextField {...params} size="small" />} />
              <Button variant="contained" onClick={handleRangeExport}>📤 선택 범위 엑셀</Button>
            </Box>
          </LocalizationProvider>
          <Button variant="contained" color="primary" onClick={handleFullExport}>📤 전체 엑셀</Button>
        </Box>
      </Paper>

      {selectedDate && (
        <Paper elevation={3} sx={{ mt: 4, p: 3, borderRadius: 2 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            📋 {selectedDate} 업무 리스트
          </Typography>

          <Button
            variant="outlined"
            onClick={() => setAddingTask(true)}
            sx={{ mb: 2 }}
          >
            ➕ 새 업무 추가하기
          </Button>

          {addingTask && (
            <Box sx={{ mb: 3 }}>
              <WorkReportForm
                mode="create"
                onSubmit={(formData) =>
                  handleSaveTask({
                    ...formData,
                    workDate: selectedDate,
                  })
                }
              />
            </Box>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>고객사</strong></TableCell>
                  <TableCell><strong>프로젝트명</strong></TableCell>
                  <TableCell><strong>업무 내용</strong></TableCell>
                  <TableCell><strong>업무 유형</strong></TableCell>
                  <TableCell><strong>시간</strong></TableCell>
                  <TableCell><strong>외근</strong></TableCell>
                  <TableCell><strong>지원제품</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.length > 0 ? tasks.map((task, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{task.clientName}</TableCell>
                    <TableCell>{task.projectName}</TableCell>
                    <TableCell>{task.workDescription}</TableCell>
                    <TableCell>{task.workType}</TableCell>
                    <TableCell>{task.workHours}시간</TableCell>
                    <TableCell>{task.isOut ? "✅" : "❌"}</TableCell>
                    <TableCell>{task.supportProduct}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">업무가 없습니다.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default Dashboard;
