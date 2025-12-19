import { useState, useRef, useEffect } from "react";
import { UploadCloud, Loader2, FileText, XCircle, Zap, Sparkles, Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from 'react-markdown';

function ResumeAI() {
  const [file, setFile] = useState<File | null>(null);
  const [output, setOutput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Function to handle Text-to-Speech
  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        // Simple plain text conversion for speech synthesis
                const plainTextOutput = output.replace(/##/g, '').replace(/\*/g, '').replace(/\[.*?\]\(.*?\)/g, ''); 
                const utterance = new SpeechSynthesisUtterance(plainTextOutput);
                utterance.onend = () => setIsSpeaking(false);
                // Use addEventListener for 'cancel' because 'oncancel' is not defined on the TS type
                utterance.addEventListener('cancel', () => setIsSpeaking(false));
                utterance.onerror = () => setIsSpeaking(false);
                utteranceRef.current = utterance; 
                window.speechSynthesis.speak(utterance);
                setIsSpeaking(true);
      }
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  useEffect(() => {
    return () => {
      if (window.speechSynthesis && utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleAnalyze = async () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }
    if (!file) { setError("Please select a resume file."); return; }
    setIsLoading(true); setError(""); setOutput("");
    const formData = new FormData(); formData.append("file", file);
    try {
        const res = await fetch("http://localhost:5000/analyze", {
            method: "POST", body: formData,
        });
        if (!res.ok) throw new Error("Server error: Could not analyze the resume.");
        const data = await res.json();
        setOutput(data.output);
    } catch (err) {
        console.error("Fetch error:", err);
        setError("An error occurred during analysis. Check console for details.");
    } finally {
        setIsLoading(false);
    }
  };

  const clearFile = () => {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }
    setFile(null);
    setOutput("");
    setError("");
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    // Added a light gray background to the entire page for contrast
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
            AI Resume Analyzer Pro
          </h1>
          <p className="text-gray-600">
            Upload your resume to get instant, AI-powered insights and
            suggestions.
          </p>
        </header>

        {/* Main Content Card (Single Page/Column Layout) */}
        <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Upload Your Resume
          </h2>

          {/* Uploader Section - Compacted design */}
          <div
            className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-blue-200 bg-blue-50 rounded-lg cursor-pointer hover:border-blue-400 transition duration-300"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="w-10 h-10 text-blue-500 mb-2" />
            <p className="text-gray-700 font-medium text-sm">
              Drag & drop a file or <span className="text-blue-600 underline">browse</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              .pdf, .doc, .docx
            </p>
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {/* File Info and Analyze Button */}
          <div className="mt-6">
            {file && (
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-800 truncate">
                    {file.name}
                  </span>
                </div>
                <button
                  onClick={clearFile}
                  className="text-gray-400 hover:text-red-500 transition duration-150"
                  title="Remove file"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold p-3 rounded-lg shadow-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Get AI Insights
                </>
              )}
            </button>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Output/Results Section - Styled for readability */}
        {(output || isLoading) && (
          <div className="bg-white shadow-xl rounded-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between gap-3 mb-4 p-3 bg-blue-600 rounded-lg text-white">
              <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  <h2 className="text-xl font-bold">AI Analysis Results</h2>
              </div>
              
              {output && (
                  <button 
                      onClick={handleSpeak} 
                      className="p-2 rounded-full hover:bg-blue-700 transition duration-150"
                      title={isSpeaking ? "Pause reading" : "Listen to results"}
                  >
                      {isSpeaking ? <VolumeX className="w-5 h-5 fill-white" /> : <Volume2 className="w-5 h-5" />}
                  </button>
              )}
            </div>

            {isLoading && !output && (
              <div className="flex flex-col items-center justify-center h-48">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">AI is analyzing the content, please wait...</p>
              </div>
            )}

            {output && (
              <div className="mt-4 max-h-[600px] overflow-y-auto pr-4">
                {/* 
                  The 'prose' class here applies excellent default styling (margins, padding, 
                  font size for H1, H2, UL, LI, P tags etc.) making it look clean and structured 
                  like the image you shared.
                */}
                <div className="prose max-w-none">
                  <ReactMarkdown>
                    {output}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeAI