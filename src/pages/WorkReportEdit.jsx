import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import WorkReportForm from "../components/WorkReportForm";

function WorkReportEdit() {
  const { id } = useParams();
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    fetch(`/api/workreports/${id}`)
      .then(res => res.json())
      .then(data => setInitialData(data));
  }, [id]);

  const handleUpdate = async (formData) => {
    await fetch(`/api/workreports/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    alert("수정 완료!");
  };

  if (!initialData) return <p>로딩 중...</p>;

  return <WorkReportForm mode="edit" initialData={initialData} onSubmit={handleUpdate} />;
}

export default WorkReportEdit;
