import React, { useState, useEffect } from "react";

export default function EditReportModal({ open, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(initial || {});

  useEffect(() => { setForm(initial || {}); }, [initial]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // 백엔드 DTO 키에 맞춰 매핑
    onSubmit({
      workDate: form.workDate,         // YYYY-MM-DD
      client: form.clientName,
      projectName: form.projectName,
      pjCode: form.pjCode,
      workType: form.workType,
      workHours: form.workHours,
      isOut: !!form.isOut,
      location: form.outLocation,
      isBackup: !!form.isBackup,
      coWorkers: form.supportTeamMember,
      content: form.workDescription,
      product: form.supportProduct,
    });
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <h3>업무 수정</h3>
        <form onSubmit={handleSubmit} style={{display:"grid", gap:"8px"}}>
          <label>날짜
            <input type="date" name="workDate" value={form.workDate || ""} onChange={handleChange} required />
          </label>
          <label>고객
            <input name="clientName" value={form.clientName || ""} onChange={handleChange} />
          </label>
          <label>프로젝트명
            <input name="projectName" value={form.projectName || ""} onChange={handleChange} />
          </label>
          <label>PJ 코드
            <input name="pjCode" value={form.pjCode || ""} onChange={handleChange} />
          </label>
          <label>업무유형
            <input name="workType" value={form.workType || ""} onChange={handleChange} />
          </label>
          <label>근무시간
            <input name="workHours" value={form.workHours || ""} onChange={handleChange} />
          </label>
          <label>외근
            <input type="checkbox" name="isOut" checked={!!form.isOut} onChange={handleChange} />
          </label>
          <label>장소
            <input name="outLocation" value={form.outLocation || ""} onChange={handleChange} />
          </label>
          <label>백업여부
            <input type="checkbox" name="isBackup" checked={!!form.isBackup} onChange={handleChange} />
          </label>
          <label>공동작업자
            <input name="supportTeamMember" value={form.supportTeamMember || ""} onChange={handleChange} />
          </label>
          <label>업무내용
            <textarea name="workDescription" value={form.workDescription || ""} onChange={handleChange} />
          </label>
          <label>제품
            <input name="supportProduct" value={form.supportProduct || ""} onChange={handleChange} />
          </label>

          <div style={{display:"flex", gap:8, justifyContent:"flex-end", marginTop:8}}>
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit">저장</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position:"fixed", inset:0, background:"rgba(0,0,0,0.35)",
    display:"grid", placeItems:"center", zIndex:1000
  },
  modal: {
    background:"#fff", padding:16, borderRadius:8, width:"min(720px, 92vw)",
    maxHeight:"90vh", overflow:"auto", boxShadow:"0 8px 32px rgba(0,0,0,0.2)"
  }
};
