import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, Box, Button, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, FormControlLabel, Checkbox
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";
import "../styles/Calendar.css";

import WorkReportForm, { isFormDirty } from "../components/WorkReportForm";

/** 생성용 초기 상태 (기존 유지) */
const initialFormState = {
  workHours: "",
  client: "",
  projectName: "",
  systemName: "",
  pjCode: "",
  workType: "",
  isBackup: false,
  supportTeamMember: "",
  outLocation: "",
  content: "",
  supportProducts: [],
};

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [addingTask, setAddingTask] = useState(false);
  const [form, setForm] = useState({ ...initialFormState });

  /** 수정용 상태 */
  const [editOpen, setEditOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState(null);
  const [editForm, setEditForm] = useState({
    workDate: "",
    client: "",
    projectName: "",
    systemName: "",
    pjCode: "",
    workType: "",
    workHours: "",
    isOut: false,
    outLocation: "",
    isBackup: false,
    supportTeamMember: "",
    workDescription: "",
    supportProduct: "",
  });

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
    setAddingTask(false);
    setForm({ ...initialFormState }); // 날짜 바뀌면 생성 폼 리셋
  };

  /** 목록 로드 (isOut 정규화 유지) */
  const loadTasks = async (date) => {
    try {
      const res = await axios.get(`/local/api/work-reports/by-date?date=${date}`);
      const normalized = (res.data || []).map((t) => {
        const raw = typeof t.isOut !== "undefined" ? t.isOut : t.out;
        const isOut = typeof raw === "boolean" ? raw
                    : typeof raw === "string" ? raw.toLowerCase() === "true"
                    : !!raw;
        return { ...t, isOut };
      });
      setTasks(normalized);
    } catch (err) {
      console.error("❌ 업무 데이터 조회 실패:", err);
    }
  };

  /** 파일 다운로드 유틸 */
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

  /** 생성(추가) */
  const handleSaveTask = async (formData) => {
    try {
      await axios.post("/local/api/work-reports/create-report", {
        ...formData,
        workDate: selectedDate
      });
      alert("업무가 추가되었습니다!");
      setAddingTask(false);
      setForm({ ...initialFormState });
      loadTasks(selectedDate);
    } catch (err) {
      console.error("❌ 업무 저장 실패:", err);
      alert("업무 저장에 실패했습니다.");
    }
  };

  /** 수정 모달 열기: WorkReportResponse -> editForm 매핑 */
  const openEdit = (task) => {
    setEditTargetId(task.id);
    setEditForm({
      workDate: (task.workDate || selectedDate || "").toString(),
      client: task.clientName || "",
      projectName: task.projectName || "",
      systemName: task.systemName || "",
      pjCode: task.pjCode || "",
      workType: task.workType || "",
      workHours: task.workHours || "",
      isOut: !!task.isOut,
      outLocation: task.outLocation || "",
      isBackup: !!task.isBackup,
      supportTeamMember: task.supportTeamMember || "",
      workDescription: task.workDescription || "",
      supportProduct: task.supportProduct || "",
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditTargetId(null);
  };

  /** 수정 제출: PUT /local/api/work-reports/{id} */
  const submitEdit = async () => {
    if (!editTargetId) return;
    try {
      const payload = {
        workDate: editForm.workDate, // YYYY-MM-DD
        client: editForm.client,
        projectName: editForm.projectName,
        pjCode: editForm.pjCode,
        workType: editForm.workType,
        workHours: editForm.workHours,
        isOut: !!editForm.isOut,
        location: editForm.outLocation,
        isBackup: !!editForm.isBackup,
        coWorkers: editForm.supportTeamMember,
        content: editForm.workDescription,
        product: editForm.supportProduct,
        systemName: editForm.systemName,
      };
      await axios.put(`/local/api/work-reports/${editTargetId}`, payload);
      closeEdit();
      if (selectedDate) await loadTasks(selectedDate);
      alert("업무가 수정되었습니다.");
    } catch (err) {
      console.error("❌ 업무 수정 실패:", err);
      alert("업무 수정에 실패했습니다.");
    }
  };

  /** 삭제: DELETE /local/api/work-reports/{id} */
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`/local/api/work-reports/${id}`);
      // 낙관적 제거 또는 재조회
      setTasks((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error("❌ 업무 삭제 실패:", err);
      alert("업무 삭제에 실패했습니다.");
    }
  };

  /** 업무 추가 폼 토글 (입력값 있을 때 확인창) */
  const toggleAddTask = () => {
    if (addingTask && isFormDirty(form)) {
      if (!window.confirm("입력 중인 내용이 있습니다. 정말 창을 닫으시겠습니까?")) return;
    }
    setAddingTask((prev) => !prev);
    if (addingTask) setForm({ ...initialFormState });
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
              <DatePicker
                label="시작일"
                value={startDate}
                onChange={setStartDate}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
              <DatePicker
                label="종료일"
                value={endDate}
                onChange={setEndDate}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
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
            onClick={toggleAddTask}
            sx={{ mb: 2 }}
          >
            {addingTask ? "❌ 업무 추가 취소" : "➕ 새 업무 추가하기"}
          </Button>

          {addingTask && (
            <Box sx={{ mb: 3 }}>
              <WorkReportForm
                mode="create"
                form={form}
                setForm={setForm}
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
                  <TableCell align="center"><strong></strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.length > 0 ? tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.clientName}</TableCell>
                    <TableCell>{task.projectName}</TableCell>
                    <TableCell>{task.workDescription}</TableCell>
                    <TableCell>{task.workType}</TableCell>
                    <TableCell>{task.workHours}시간</TableCell>
                    <TableCell>{task.isOut ? "✅" : "❌"}</TableCell>
                    <TableCell>{task.supportProduct}</TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="outlined" onClick={() => openEdit(task)}>수정</Button>
                      <Button size="small" color="error" variant="outlined" sx={{ ml: 1 }} onClick={() => handleDelete(task.id)}>삭제</Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">업무가 없습니다.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* 수정 모달 */}
      <Dialog open={editOpen} onClose={closeEdit} maxWidth="md" fullWidth>
        <DialogTitle>업무 수정</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, mt: 1 }}>
            <TextField
              label="날짜"
              type="date"
              value={editForm.workDate || ""}
              onChange={(e) => setEditForm((f) => ({ ...f, workDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="고객사"
              value={editForm.client}
              onChange={(e) => setEditForm((f) => ({ ...f, client: e.target.value }))}
            />
            <TextField
              label="프로젝트명"
              value={editForm.projectName}
              onChange={(e) => setEditForm((f) => ({ ...f, projectName: e.target.value }))}
            />
            <TextField
              label="시스템명"
              value={editForm.systemName}
              onChange={(e) => setEditForm((f) => ({ ...f, systemName: e.target.value }))}
            />
            <TextField
              label="PJ 코드"
              value={editForm.pjCode}
              onChange={(e) => setEditForm((f) => ({ ...f, pjCode: e.target.value }))}
            />
            <TextField
              label="업무 유형"
              value={editForm.workType}
              onChange={(e) => setEditForm((f) => ({ ...f, workType: e.target.value }))}
            />
            <TextField
              label="근무 시간"
              value={editForm.workHours}
              onChange={(e) => setEditForm((f) => ({ ...f, workHours: e.target.value }))}
            />
            <TextField
              label="장소"
              value={editForm.outLocation}
              onChange={(e) => setEditForm((f) => ({ ...f, outLocation: e.target.value }))}
            />
            <FormControlLabel
              control={<Checkbox checked={!!editForm.isOut} onChange={(e) => setEditForm((f) => ({ ...f, isOut: e.target.checked }))} />}
              label="외근"
            />
            <FormControlLabel
              control={<Checkbox checked={!!editForm.isBackup} onChange={(e) => setEditForm((f) => ({ ...f, isBackup: e.target.checked }))} />}
              label="백업"
            />
            <TextField
              label="공동작업자"
              value={editForm.supportTeamMember}
              onChange={(e) => setEditForm((f) => ({ ...f, supportTeamMember: e.target.value }))}
            />
            <TextField
              label="지원 제품"
              value={editForm.supportProduct}
              onChange={(e) => setEditForm((f) => ({ ...f, supportProduct: e.target.value }))}
            />
            <TextField
              label="업무 내용"
              multiline minRows={3}
              value={editForm.workDescription}
              onChange={(e) => setEditForm((f) => ({ ...f, workDescription: e.target.value }))}
              sx={{ gridColumn: "1 / -1" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>취소</Button>
          <Button variant="contained" onClick={submitEdit}>저장</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard;
