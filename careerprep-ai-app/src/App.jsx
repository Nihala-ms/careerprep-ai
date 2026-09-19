import React, { useState } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import InterviewSetup from "./pages/InterviewSetup";
import Interview from "./pages/Interview";

function App() {
  const [page, setPage] = useState("home");

  const [interviewData, setInterviewData] = useState(null);

  const startInterview = (data) => {
    setInterviewData(data);
    setPage("interview");
  };

  const goHome = () => {
    setInterviewData(null);
    setPage("home");
  };

  return (
    <>
      {page === "home" && (
        <>
          <Header />
          <Home onStart={() => setPage("setup")} />
        </>
      )}

      {page === "setup" && (
        <InterviewSetup onStart={startInterview} />
      )}

      {page === "interview" && (
        <Interview
          interviewData={interviewData}
          onFinish={goHome}
        />
      )}
    </>
  );
}

export default App;