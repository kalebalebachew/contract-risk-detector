"use client"

import { useState } from "react"
import axios from "axios"
import { Upload, FileText, AlertCircle, CheckCircle, ArrowRight } from "lucide-react"

import { Card, CardContent, CardFooter, CardHeader } from "./ui/Card"
import { Alert } from "./ui/Alert"
import { Badge } from "./ui/Badge"
import { Separator } from "./ui/Separator"
import { Button } from "./ui/Button"

export default function ContractUploader() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setResult(null)
    }
  }

  const uploadContract = async () => {
    if (!file) {
      setResult({
        analysis: {
          status: "error",
          message: "Please select a file to upload",
          analysis: null,
        },
      })
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("contract", file)

    try {
      const response = await axios.post("http://localhost:5000/api/contracts/upload", formData)
      setResult(response.data)
    } catch (error) {
      console.error("Upload error:", error)
      setResult({
        analysis: {
          status: "error",
          message: error.response?.data?.message || "Failed to analyze the contract. Please try again.",
          analysis: null,
        },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <Card className="overflow-hidden border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 m-0">
            <FileText className="h-6 w-6" />
            Contract Analysis
          </h2>
          <p className="text-indigo-100 mt-1">Upload your contract document for AI-powered risk analysis</p>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center ${
              dragActive
                ? "border-indigo-500 bg-indigo-50"
                : file
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            <div className="flex flex-col items-center justify-center gap-2">
              <div className={`rounded-full p-3 ${file ? "bg-green-100" : "bg-indigo-100"}`}>
                <Upload className={`h-6 w-6 ${file ? "text-green-600" : "text-indigo-600"}`} />
              </div>

              {file ? (
                <>
                  <p className="text-sm font-medium text-green-600">File selected</p>
                  <p className="text-gray-600 font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <p className="font-medium text-gray-700">Drag and drop your contract file here</p>
                  <p className="text-sm text-gray-500">or click to browse files (PDF, DOCX, TXT)</p>
                </>
              )}
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={uploadContract}
            disabled={loading || !file}
            className="w-full py-6 text-base font-medium transition-all duration-200 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                  />
                </svg>
                Analyzing Contract...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Analyze Contract <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </CardContent>

        {result && result.analysis && (
          <CardFooter className="flex flex-col p-0">
            <Separator />
            <div className="p-6 w-full space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Analysis Results</h3>
                <Badge
                  className={`${
                    result.analysis.status === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}
                >
                  {result.analysis.status === "error" ? "Error" : "Success"}
                </Badge>
              </div>

              <Alert
                className={`flex gap-2 ${
                  result.analysis.status === "error"
                    ? "border border-red-200 bg-red-50 text-red-800"
                    : "border border-green-200 bg-green-50 text-green-800"
                }`}
              >
                {result.analysis.status === "error" ? (
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium">{result.analysis.status === "error" ? "Error" : "Success"}</p>
                  <p className="text-sm">{result.analysis.message}</p>
                </div>
              </Alert>

              {result.analysis.analysis ? (
                Array.isArray(result.analysis.analysis) && result.analysis.analysis.length > 0 ? (
                  <div className="space-y-4 mt-4">
                    {result.analysis.analysis.map((item, index) => (
                      <div key={index} className="border rounded-md overflow-hidden shadow-sm">
                        <div className="p-4">
                          {item.isContract === false ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                                <h4 className="font-medium text-amber-700">Not a Contract</h4>
                              </div>
                              <p className="text-gray-800">{item.reason}</p>
                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Summary:</span> {item.summary}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-gray-800">Clause</h4>
                                <p className="text-gray-700 mt-1 p-2 bg-gray-50 rounded border border-gray-100">
                                  {item.clause}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge className="bg-red-100 text-red-800">Risk Identified</Badge>
                                <p className="text-red-600 font-medium">{item.risk}</p>
                              </div>

                              <div className="mt-2 pt-2 border-t border-gray-100">
                                <h4 className="font-medium text-gray-800">Suggestion</h4>
                                <p className="text-gray-600 italic mt-1">{item.suggestion}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No detailed analysis available.</p>
                )
              ) : (
                result.analysis.status === "error" && (
                  <p className="text-gray-500 italic">No analysis generated due to error.</p>
                )
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

