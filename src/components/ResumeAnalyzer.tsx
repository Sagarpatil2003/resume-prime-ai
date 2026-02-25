import React, { useState, useCallback } from "react";
import API from "../../api/api";

interface AnalysisData {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  skillsDetected: string[];
}

const ResumeAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisData | null>(null);

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      alert("Only PDF files allowed");
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Upload a resume first");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setData(res.data);
    } catch (err) {
      alert("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const getScoreMeta = (score: number) => {
    if (score >= 80)
      return { label: "Elite Match", color: "text-emerald-400 bg-emerald-500/10 border-emerald-400/30" };
    if (score >= 60)
      return { label: "Strong Profile", color: "text-cyan-400 bg-cyan-500/10 border-cyan-400/30" };
    if (score >= 40)
      return { label: "Needs Tuning", color: "text-amber-400 bg-amber-500/10 border-amber-400/30" };
    return { label: "Low Compatibility", color: "text-red-400 bg-red-500/10 border-red-400/30" };
  };

  const scoreMeta = data ? getScoreMeta(data.score) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f14] via-[#14141c] to-black text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Resume
              <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
                IQ
              </span>
            </h1>
            <p className="text-slate-400 mt-2">
              AI-Powered ATS Intelligence Scanner
            </p>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:scale-105 transition-all text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-violet-500/30 disabled:opacity-40"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Analyzing
              </div>
            ) : (
              "Analyze Resume"
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
              id="resumeUpload"
              onChange={(e) =>
                e.target.files && handleFile(e.target.files[0])
              }
            />

            <label htmlFor="resumeUpload" className="cursor-pointer flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-500/30">
                📄
              </div>

              <p className="text-xl font-bold">
                Drag & Drop your resume
              </p>
              <p className="text-slate-400 mt-2">
                or click to browse PDF file
              </p>

              {file && (
                <div className="mt-6 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-sm">
                  {file.name}
                </div>
              )}
            </label>
          </div>
        )}

        {/* Results */}
        {data && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Score + Skills */}
            <div className="lg:col-span-4 space-y-8">

              {/* Score Card */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl shadow-black/40 flex flex-col items-center">

                <h3 className="uppercase text-xs tracking-widest text-slate-400 mb-8">
                  ATS Score
                </h3>

                <div className="relative shadow-[0_0_40px_rgba(139,92,246,0.4)] rounded-full">
                  <svg className="w-44 h-44 transform -rotate-90">
                    <circle
                      cx="88"
                      cy="88"
                      r="80"
                      strokeWidth="12"
                      stroke="currentColor"
                      fill="transparent"
                      className="text-white/10"
                    />
                    <circle
                      cx="88"
                      cy="88"
                      r="80"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={502}
                      strokeDashoffset={502 - (502 * data.score) / 100}
                      className="text-violet-500 transition-all duration-1000"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-black">
                      {data.score}%
                    </span>
                  </div>
                </div>

                <div className={`mt-8 px-4 py-2 border rounded-xl text-sm font-bold ${scoreMeta?.color}`}>
                  {scoreMeta?.label}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gradient-to-br from-[#1a1a25] to-[#111118] border border-white/10 rounded-3xl p-8 shadow-xl shadow-violet-900/30">
                <h3 className="uppercase text-xs tracking-widest text-slate-400 mb-4">
                  Skills Detected
                </h3>

                <div className="flex flex-wrap gap-2">
                  {data.skillsDetected.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-white/10 border border-white/10 rounded-lg text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-8 space-y-6">

              {/* Summary */}
              <div className="bg-gradient-to-br from-violet-600/80 to-cyan-500/70 backdrop-blur-xl text-white p-8 rounded-3xl shadow-2xl shadow-violet-500/30">
                <h3 className="uppercase text-xs tracking-widest opacity-70 mb-4">
                  Professional Summary
                </h3>
                <p className="text-lg leading-relaxed">
                  {data.summary}
                </p>
              </div>

              {/* Strengths */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">
                <h3 className="text-xl font-bold mb-6 text-emerald-400">
                  Strengths
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {data.strengths.map((s, i) => (
                    <div
                      key={i}
                      className="p-4 bg-emerald-500/10 border border-emerald-400/20 rounded-xl text-sm"
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvements */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">
                <h3 className="text-xl font-bold mb-6 text-amber-400">
                  Improvements
                </h3>

                <div className="space-y-4">
                  {data.improvements.map((text, i) => (
                    <div
                      key={i}
                      className="p-4 bg-amber-500/10 border border-amber-400/20 rounded-xl text-sm"
                    >
                      {text}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;