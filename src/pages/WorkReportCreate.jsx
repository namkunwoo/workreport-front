import WorkReportForm from "../components/WorkReportForm";

function WorkReportCreate() {
  const handleCreate = async (formData) => {
    await fetch("/api/workreports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    alert("등록 완료!");
  };

  return <WorkReportForm mode="create" onSubmit={handleCreate} />;
}

export default WorkReportCreate