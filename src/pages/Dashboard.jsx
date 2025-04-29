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

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [addingTask, setAddingTask] = useState(false);
  const [newTask, setNewTask] = useState({
    clientName: '',
    projectName: '',
    pjCode: '',
    workType: '',
    workHours: '',
    isOut: false,
    outLocation: '',
    isBackup: false,
    supportTeamMember: '',
    workDescription: '',
    supportProduct: '',
  });

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskData, setEditingTaskData] = useState({});

  // 📌 날짜 있는 날 표시
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

  // 📌 날짜 클릭 시 업무 조회
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

  // 📥 엑셀 다운로드 공통 처리
  const downloadExcelFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // 📤 전체 Export
  const handleFullExport = async () => {
    try {
      const res = await axios.get("/local/api/work-reports/file/export-all", { responseType: "blob" });
      downloadExcelFile(res.data, `전체_업무보고.xlsx`);
    } catch (err) {
      console.error("❌ 전체 엑셀 다운로드 실패:", err);
      alert("전체 엑셀 내보내기에 실패했습니다.");
    }
  };

  // 📤 날짜 범위 Export
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

  // 📌 새 업무 저장
  const handleSaveTask = async () => {
    if (!selectedDate) return;

    try {
      await axios.post("/local/api/work-reports/create-report", {
        client: newTask.clientName,
        projectName: newTask.projectName,
        pjCode: newTask.pjCode,
        workType: newTask.workType,
        workHours: Number(newTask.workHours),
        out: newTask.outLocation !== '',
        location: newTask.outLocation,
        backup: newTask.isBackup,
        coWorkers: newTask.supportTeamMember,
        content: newTask.workDescription,
        product: newTask.supportProduct,
        workDate: selectedDate,
      });

      alert("업무가 추가되었습니다!");
      setAddingTask(false);
      setNewTask({
        clientName: '',
        projectName: '',
        pjCode: '',
        workType: '',
        workHours: '',
        isOut: false,
        outLocation: '',
        isBackup: false,
        supportTeamMember: '',
        workDescription: '',
        supportProduct: '',
      });

      loadTasks(selectedDate);

    } catch (err) {
      console.error("❌ 업무 저장 실패:", err);
      alert("업무 저장에 실패했습니다.");
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          📅 업무 보고 대시보드
        </Typography>
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

          <Button variant="contained" color="primary" onClick={handleFullExport}>
            📤 전체 엑셀
          </Button>
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
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
              <TextField label="고객사" value={newTask.clientName} onChange={(e) => setNewTask({ ...newTask, clientName: e.target.value })} />
              <TextField label="프로젝트명/시스템명" value={newTask.projectName} onChange={(e) => setNewTask({ ...newTask, projectName: e.target.value })} />
              <TextField label="프로젝트 코드" value={newTask.pjCode} onChange={(e) => setNewTask({ ...newTask, pjCode: e.target.value })} />
              <TextField label="업무 유형" value={newTask.workType} onChange={(e) => setNewTask({ ...newTask, workType: e.target.value })} />
              <TextField label="업무 시간" type="number" value={newTask.workHours} onChange={(e) => setNewTask({ ...newTask, workHours: e.target.value })} />
              <TextField label="출장 지역" value={newTask.outLocation} onChange={(e) => setNewTask({ ...newTask, outLocation: e.target.value })} />
              <TextField label="동반 지원 팀원" value={newTask.supportTeamMember} onChange={(e) => setNewTask({ ...newTask, supportTeamMember: e.target.value })} />
              <TextField label="업무 내용" value={newTask.workDescription} onChange={(e) => setNewTask({ ...newTask, workDescription: e.target.value })} />
              <TextField label="지원 제품" value={newTask.supportProduct} onChange={(e) => setNewTask({ ...newTask, supportProduct: e.target.value })} />
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button variant="contained" onClick={handleSaveTask}>저장</Button>
                <Button variant="outlined" color="error" onClick={() => setAddingTask(false)}>취소</Button>
              </Box>
            </Box>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>고객사</strong></TableCell>
                  <TableCell><strong>프로젝트명</strong></TableCell>
                  <TableCell><strong>업무 내용</strong></TableCell>
                  <TableCell><strong>업무 강도</strong></TableCell>
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
