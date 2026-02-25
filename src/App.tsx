import React from "react";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import InterviewPrep from "./components/InterviewPrep";

const App: React.FC = () => {
  
  return (
    <div>
     
      <ResumeAnalyzer/>
      <hr />
      <InterviewPrep/>
      
      <hr />
    </div>
  );
};

export default App;