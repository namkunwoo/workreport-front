import React, { useState } from "react";
import "../styles/WorkReportForm.css"; // ✨ 스타일 별도 적용

export default function WorkReportForm({ mode = "create", initialData = {}, onSubmit }) {
  const [form, setForm] = useState({
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
    ...initialData
  });

  const productList = [
    "ksbiz", "nxKey", "transkey", "nxCR", "nxQR",
    "AppFree", "mtweb", "mvweb",
    "Wireless", "mT CS", "mV CS", "AC", "AI"
  ];

  const workTypeOptions = [
    "구축지원", "유지보수", "정기점검", "팀원백업", "사내업무", "업무지원"
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleCheckboxChange = (product) => {
    setForm(prev => ({
      ...prev,
      supportProducts: prev.supportProducts.includes(product)
        ? prev.supportProducts.filter(p => p !== product)
        : [...prev.supportProducts, product]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="workreport-form">
      <div className="form-row">
        <label>업무시간 *</label>
        <input type="number" name="workHours" value={form.workHours} onChange={handleChange} required />
      </div>

      <div className="form-row">
        <label>고객사 *</label>
        <input type="text" name="client" value={form.client} onChange={handleChange} required />
      </div>

      <div className="form-row">
        <label>프로젝트/시스템명 *</label>
        <input type="text" name="projectName" value={form.projectName} onChange={handleChange} required />
      </div>

      <div className="form-row">
        <label>PJ-CODE</label>
        <input type="text" name="pjCode" value={form.pjCode} onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>업무유형 *</label>
        <select name="workType" value={form.workType} onChange={handleChange} required>
          <option value="">선택</option>
          {workTypeOptions.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="form-row checkbox-row">
        <label>
          <input type="checkbox" name="isBackup" checked={form.isBackup} onChange={handleChange} />
          팀원 백업
        </label>
      </div>

      <div className="form-row">
        <label>동반지원 팀원</label>
        <input type="text" name="supportTeamMember" value={form.supportTeamMember} onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>출장 지역</label>
        <input type="text" name="outLocation" value={form.outLocation} onChange={handleChange} />
      </div>

      <div className="form-row">
        <label>업무 내용 *</label>
        <textarea name="content" value={form.content} onChange={handleChange} required rows={4} />
      </div>

      <div className="form-row">
        <label>지원 제품</label>
        <div className="checkbox-group">
          {productList.map(product => (
            <label key={product} className="checkbox-item">
              <input
                type="checkbox"
                checked={form.supportProducts.includes(product)}
                onChange={() => handleCheckboxChange(product)}
              />
              {product}
            </label>
          ))}
        </div>
      </div>

      <div className="form-row">
        <button type="submit" className="submit-btn">
          {mode === "edit" ? "수정하기" : "등록하기"}
        </button>
      </div>
    </form>
  );
}
