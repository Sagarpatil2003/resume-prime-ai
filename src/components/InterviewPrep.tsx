import React, { useState, useCallback } from "react";
import API from "../../api/api";

interface PrepData {
  detected_skills: string[];
  technical_questions: string[];
  project_deep_dive: string[];
  behavioral_scenarios: string[];
  skill_gaps: string[];
}

const ResumePrepEngine: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PrepData | null>(null);
  const [activeTab, setActiveTab] =
    useState<keyof PrepData>("technical_questions");

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      alert("Only PDF allowed");
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    []
  );

  const handleGenerate = async () => {
    if (!file) return alert("Upload resume first");

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post(
        "/generate-interview-prep",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setData(res.data);
    } catch (err) {
      alert("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f14] via-[#14141c] to-black text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Interview
              <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
                Intelligence
              </span>
            </h1>
            <p className="text-slate-400 mt-2">
              AI-Powered Technical Preparation Engine
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!file || loading}
            className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:scale-105 transition-all text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-violet-500/30 disabled:opacity-40"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating
              </div>
            ) : (
              "Generate Preparation"
            )}
          </button>
        </div>

        {/* Upload Section */}
        {!data && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-20 text-center transition-all backdrop-blur-xl ${
              dragActive
                ? "border-violet-500 bg-violet-500/10"
                : "border-white/10 bg-white/5"
            }`}
          >
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              id="uploadResume"
              onChange={(e) =>
                e.target.files && handleFile(e.target.files[0])
              }
            />

            <label htmlFor="uploadResume" className="cursor-pointer flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                🎯
              </div>

              <p className="text-xl font-bold">
                Upload Your Resume
              </p>
              <p className="text-slate-400 mt-2">
                AI will generate interview questions instantly
              </p>

              {file && (
                <div className="mt-6 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm">
                  {file.name}
                </div>
              )}
            </label>
          </div>
        )}

        {/* Results Section */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Sidebar Tabs */}
            <div className="lg:col-span-4 space-y-3">
              {[
                { id: "technical_questions", label: "Technical", icon: "💻" },
                { id: "project_deep_dive", label: "Architecture", icon: "🏗️" },
                { id: "behavioral_scenarios", label: "Behavioral", icon: "🤝" },
                { id: "skill_gaps", label: "Skill Gaps", icon: "⚠️" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(tab.id as keyof PrepData)
                  }
                  className={`w-full flex items-center gap-4 p-5 rounded-2xl font-bold transition-all border ${
                    activeTab === tab.id
                      ? "bg-violet-500/10 border-violet-400 text-violet-400"
                      : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="lg:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl shadow-black/40">

              {/* Detected Skills */}
              <div className="mb-10">
                <h3 className="uppercase text-xs tracking-widest text-slate-400 mb-4">
                  Skills Detected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.detected_skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-violet-500/10 border border-violet-400/20 rounded-lg text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {data[activeTab].map((item, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-start gap-4">
                      <span className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <p className="text-slate-200 leading-relaxed">
                        {item}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePrepEngine;