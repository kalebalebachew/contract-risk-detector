"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Upload, FileText, AlertCircle, CheckCircle, ArrowRight, Clipboard, X } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Card, CardContent, CardFooter, CardHeader } from "./ui/Card";
import { Alert } from "./ui/Alert";
import { Badge } from "./ui/Badge";
import { Separator } from "./ui/Separator";
import { Button } from "./ui/Button";
import { Tooltip } from "./ui/Tooltip";

// Font import
const interFont = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  html, body, * {
    font-family: 'Inter', sans-serif !important;
  }
`;
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = interFont;
  document.head.appendChild(styleSheet);
}

export default function ContractUploader() {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [useTextInput, setUseTextInput] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [setupNotion, setSetupNotion] = useState(false);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [priority, setPriority] = useState("High");
  const [taskType, setTaskType] = useState(["Polish"]);
  const [effortLevel, setEffortLevel] = useState("Medium");
  const [includeEmailDraft, setIncludeEmailDraft] = useState(false);
  const resultRef = useRef(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("contractUploaderEmail");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  useEffect(() => {
    if (email) localStorage.setItem("contractUploaderEmail", email);
  }, [email]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setResult(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
    }
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) setEmailError("Email is required");
    else if (!emailRegex.test(value)) setEmailError("Please enter a valid email address");
    else setEmailError("");
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() =>
      toast.success("Analysis results copied to clipboard!", {
        position: "top-right",
        autoClose: 3000,
      })
    );
  };

  const uploadContract = async () => {
    if (!email || emailError) {
      setResult({
        analysis: {
          status: "error",
          message: emailError || "Please enter a valid email address",
          analysis: null,
        },
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (useTextInput && textInput) formData.append("contractText", textInput);
    else if (file) formData.append("contract", file);
    formData.append("email", email);
    formData.append("setupNotion", setupNotion);
    formData.append("dueDate", dueDate);
    formData.append("priority", priority);
    formData.append("taskType", JSON.stringify(taskType));
    formData.append("effortLevel", effortLevel);
    formData.append("includeEmailDraft", includeEmailDraft);

    try {
      const response = await axios.post("http://localhost:5000/api/contracts/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
      toast.success(setupNotion ? "Task created in Notion!" : "Contract analyzed!", {
        position: "top-right",
        autoClose: 3000,
      });
      if (resultRef.current) resultRef.current.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Upload error:", error);
      setResult({
        analysis: {
          status: "error",
          message: error.response?.data?.message || "Failed to process the request.",
          analysis: null,
        },
      });
      toast.error("Something went wrong.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <ToastContainer />
      <Card className="overflow-hidden border-none shadow-xl rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="h-8 w-8" />
            Contract Analysis & Automation
          </h2>
          <p className="text-indigo-100 mt-2 text-lg">
            Upload, paste, or set up a Notion task with custom details
          </p>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setUseTextInput(false)}
              className={`px-4 py-2 rounded-full transition-all ${
                !useTextInput ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Upload File
            </Button>
            <Button
              onClick={() => setUseTextInput(true)}
              className={`px-4 py-2 rounded-full transition-all ${
                useTextInput ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Paste Text
            </Button>
          </div>

          {useTextInput ? (
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your contract text here..."
              className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              aria-label="Paste contract text"
            />
          ) : (
            <div
              className={`border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
                dragActive ? "border-indigo-500 bg-indigo-50 scale-105" : file ? "border-green-500 bg-green-50" : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              role="region"
              aria-label="Drag and drop contract file here"
            >
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-hidden="true"
              />
              <div className="flex flex-col items-center justify-center gap-3">
                <div className={`rounded-full p-4 ${file ? "bg-green-100" : "bg-indigo-100"} ${loading ? "animate-pulse" : ""}`}>
                  <Upload className={`h-8 w-8 ${file ? "text-green-600" : "text-indigo-600"}`} />
                </div>
                {file ? (
                  <>
                    <p className="text-sm font-semibold text-green-600">File Selected</p>
                    <p className="text-gray-700 font-medium">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <Button onClick={handleClearFile} className="mt-2 px-4 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-full flex items-center gap-2">
                      <X className="h-4 w-4" /> Clear File
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-700">Drag and drop your contract file here</p>
                    <p className="text-sm text-gray-500">or click to browse files (PDF, DOCX, TXT)</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-semibold text-gray-700">
              Your Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="your.email@example.com"
              className={`w-full p-3 border rounded-lg transition-all ${emailError ? "border-red-500" : "border-gray-300 focus:ring-2 focus:ring-indigo-500"}`}
              value={email}
              onChange={handleEmailChange}
              aria-invalid={emailError ? "true" : "false"}
              aria-describedby={emailError ? "email-error" : undefined}
            />
            {emailError && <p id="email-error" className="text-sm text-red-600">{emailError}</p>}
          </div>

          <div className="flex flex-col gap-4">
            <label className="font-semibold text-gray-700">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              min={new Date().toISOString().split("T")[0]}
            />

            <label className="font-semibold text-gray-700">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <label className="font-semibold text-gray-700">Task Type</label>
            <div className="flex gap-2">
              {["Polish", "Feature", "Bug Fix"].map((type) => (
                <Button
                  key={type}
                  onClick={() => setTaskType((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]))}
                  className={`px-3 py-1 rounded-full transition-all ${taskType.includes(type) ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  {type}
                </Button>
              ))}
            </div>

            <label className="font-semibold text-gray-700">Effort Level</label>
            <select
              value={effortLevel}
              onChange={(e) => setEffortLevel(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="setupNotion"
                checked={setupNotion}
                onChange={(e) => setSetupNotion(e.target.checked)}
                className="h-5 w-5 text-indigo-600 rounded"
              />
              <Tooltip content="Creates a task in Notion with analysis results, including meeting reminders.">
                <label htmlFor="setupNotion" className="text-gray-700 cursor-pointer">
                  Add to Notion
                </label>
              </Tooltip>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="includeEmailDraft"
                checked={includeEmailDraft}
                onChange={(e) => setIncludeEmailDraft(e.target.checked)}
                className="h-5 w-5 text-indigo-600 rounded"
              />
              <Tooltip content="Generates a renegotiation email draft and includes it in the Notion task.">
                <label htmlFor="includeEmailDraft" className="text-gray-700 cursor-pointer">
                  Include Renegotiation Email Draft
                </label>
              </Tooltip>
            </div>
          </div>

          <Button
            onClick={uploadContract}
            disabled={loading || !email || emailError}
            className="w-full py-3 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                Analyze & Automate <ArrowRight className="h-6 w-6" />
              </span>
            )}
          </Button>
        </CardContent>

        {result && result.analysis && (
          <CardFooter className="flex flex-col p-0" ref={resultRef}>
            <Separator />
            <div className="p-8 w-full space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold">Analysis Results</h3>
                  <Badge className={result.analysis.status === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                    {result.analysis.status === "error" ? "Error" : "Success"}
                  </Badge>
                </div>
                {result.analysis.status !== "error" && (
                  <Button
                    onClick={() => copyToClipboard(JSON.stringify(result.analysis.analysis, null, 2))}
                    className="flex items-center gap-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg px-4 py-2"
                  >
                    <Clipboard className="h-5 w-5" /> Copy Results
                  </Button>
                )}
              </div>
              <Alert className={`flex gap-3 p-4 rounded-lg ${result.analysis.status === "error" ? "border border-red-200 bg-red-50 text-red-800" : "border border-green-200 bg-green-50 text-green-800"}`}>
                {result.analysis.status === "error" ? <AlertCircle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
                <div>
                  <p className="font-semibold">{result.analysis.status === "error" ? "Error" : "Success"}</p>
                  <p className="text-sm">{result.analysis.message}</p>
                </div>
              </Alert>
              {result.analysis.analysis && Array.isArray(result.analysis.analysis) && result.analysis.analysis.length > 0 ? (
                <div className="space-y-6 mt-6">
                  {result.analysis.analysis.map((item, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden shadow-md bg-white">
                      <div className="p-6">
                        {item.isContract === false ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <AlertCircle className="h-6 w-6 text-amber-500" />
                              <h4 className="font-semibold text-amber-700">Not a Contract</h4>
                            </div>
                            <p className="text-gray-800">{item.reason}</p>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-sm text-gray-600"><span className="font-semibold">Summary:</span> {item.summary}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-semibold text-gray-800">Clause</h4>
                              <p className="text-gray-700 mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">{item.clause}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className="bg-red-100 text-red-800">Risk Identified</Badge>
                              <p className="text-red-600 font-medium">{item.risk}</p>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <h4 className="font-semibold text-gray-800">Suggestion</h4>
                              <p className="text-gray-600 italic mt-2">{item.suggestion}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No detailed analysis available.</p>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}