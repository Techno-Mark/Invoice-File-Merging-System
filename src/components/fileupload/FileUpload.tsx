"use client"

import Image from "next/image"
import React, { useState } from "react"
import { ToastContainer, toast, ToastOptions } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import loader from "@/public/loder.gif"
import { Invoice } from "@/services/endpoint/Invoice"
import { callApi } from "@/services/apiService"

const toastOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light"
}

const FileUpload = () => {
  const [excelFiles, setExcelFiles] = useState<File[]>([])
  const [disabled, setDisabled] = useState<boolean>(false)
  const [excelFileError, setExcelFileError] = useState<string | null>(null)

  const allFilesSelected = excelFiles.length === 3 && !excelFileError

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const selectedFiles = Array.from(files)

      if (selectedFiles.length !== 3) {
        setExcelFileError("Please upload exactly three Excel files.")
      } else {
        const invalidFile = selectedFiles.some(
          (file) => !file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")
        )
        const largeFile = selectedFiles.some(
          (file) => file.size > 100 * 1024 * 1024
        )

        if (invalidFile) {
          setExcelFileError("Please upload a correct file.")
        } else if (largeFile) {
          setExcelFileError("File too large.")
        } else {
          setExcelFileError(null)
          setExcelFiles(selectedFiles)
        }
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setDisabled(true)

    if (excelFiles.length !== 3) {
      toast.error("Please select three Excel files.", toastOptions)
      setDisabled(false)
      return
    }

    const formData = new FormData()
    excelFiles.forEach((file) => formData.append("files", file))

    try {
      const response = await callApi(Invoice.invoiceMerge, formData, 'blob')

      if (response.status === 200) {
        toast.success("Files processed successfully.", toastOptions)

        const url = window.URL.createObjectURL(
          new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          })
        )
        const now = new Date()
        const formattedDate = now
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")
          .replace(/:/g, "-")
        const dynamicFilename = `Invoice - ${formattedDate}.xlsx`
        toast.success("File downloaded successfully.", toastOptions)
        const link = document.createElement("a")
        link.href = url
        link.setAttribute("download", dynamicFilename)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        setExcelFiles([])
      } else {
        toast.error("Failed to process the files.", toastOptions)
      }
    } catch (error: any) {
      // Error already handled inside callApi
    } finally {
      setDisabled(false)
    }
  }

  return (
    <>
      {disabled ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-70px)] bg-[#fcfcff]">
          <Image src={loader} alt="Loader" />
        </div>
      ) : (

        <section className="automationSection px-5 py-12">
          <div className="container mx-auto px-20">
            <div className="relative overflow-x-auto shadow-lg sm:rounded-lg">
              <ToastContainer {...toastOptions} />
              <div className="text-sm font-semibold uppercase text-white bg-[#1492c8] dark:bg-bg-[#1492c8] dark:text-white p-4">
                Invoice & File Merging System
              </div>
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <tbody>
                  <tr className="bg-white dark:bg-gray-800 dark:border-gray-700 text-center">
                    <td className="px-6 py-8 font-medium text-gray-900 whitespace-nowrap dark:text-white text-start">
                      <div className="flex items-center space-x-4">
                        <input
                          className="w-full text-sm text-gray-900 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                          id="file_input_csv_excel"
                          type="file"
                          accept=".xlsx"
                          multiple
                          onChange={handleChange}
                        />
                        <button
                          className={`bg-[#1492c8] hover:bg-[#2082ac] text-white font-bold py-2 px-4 rounded ${!allFilesSelected || disabled
                              ? "opacity-60 cursor-not-allowed "
                              : ""
                            }`}
                          onClick={handleUpload}
                          disabled={!allFilesSelected || disabled}
                        >
                          Merge Excel Files
                        </button>
                      </div>
                      <p
                        className={`mt-1 text-sm ${excelFileError
                            ? "text-red-500 dark:text-red-300"
                            : "text-gray-500 dark:text-gray-500"
                          }`}
                      >
                        {excelFileError || "Upload exactly 3 .xlsx files here."}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

export default FileUpload
