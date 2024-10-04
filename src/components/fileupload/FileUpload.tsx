"use client";

import Spinner from "@/assets/icon/Spinner";
import loader from "@/public/loder.gif";
import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";
import { ToastContainer, ToastOptions, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const toastOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: "light",
};

const FileUpload = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [csvExcelFile, setCsvExcelFile] = useState<File | null>(null);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [pdfFileError, setPdfFileError] = useState<string | null>(null);
  const [csvExcelFileError, setCsvExcelFileError] = useState<string | null>(
    null
  );

  // Check if both files are selected
  const bothFilesSelected =
    pdfFile && csvExcelFile && !pdfFileError && !csvExcelFileError;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: string
  ) => {
    const file = e.target.files ? e.target.files[0] : null;

    if (file) {
      const fileName = file.name;

      if (fileType === "pdf") {
        setPdfFile(file);

        if (!fileName.endsWith(".pdf")) {
          setPdfFileError("Only PDF files are valid");
        } else if (file.size > 200 * 1024 * 1024) {
          setPdfFileError("Please select file less than 200 MB");
        } else {
          setPdfFileError(null);
        }
      } else if (fileType === "csv-excel") {
        setCsvExcelFile(file);

        if (!fileName.endsWith(".csv") && !fileName.endsWith(".xlsx")) {
          setCsvExcelFileError("Only CSV or Excel files are valid");
        } else if (file.size > 200 * 1024 * 1024) {
          setCsvExcelFileError("Please select file less than 200 MB");
        } else {
          setCsvExcelFileError(null);
        }
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabled(true);
    const formData = new FormData();

    if (!pdfFile || !csvExcelFile) {
      toast.error("Both files must be selected.", toastOptions);
      setDisabled(false);
      return;
    }
 
    formData.append("xlsx_file", csvExcelFile);
    formData.append("pdf_file", pdfFile);

    try {
      // Send the request to the server
      let response = await axios.post(
        "https://pythonapi.pacificabs.com:5001/invoice_merge",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob", // This is crucial to handle binary data
        }
      );

      if (response.status === 200) {
        toast.success("File processed successfully.", toastOptions);
        setPdfFile(null);
        setCsvExcelFile(null);

        // Convert the binary data into a Blob and create a URL for downloading
        const url = window.URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" })
        );
        const now = new Date();
        const formattedDate = now
          .toISOString()
          .slice(0, 19)
          .replace("T", " ")
          .replace(/:/g, "-");
        const dynamicFilename = `Invoice - ${formattedDate}.pdf`;

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", dynamicFilename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("File downloaded successfully.", toastOptions);
      } else {
        toast.error("Failed to process the file.", toastOptions);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.", toastOptions);
    }
    setDisabled(false);
  };

  // const handleDownload = async () => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:3001/api/download?folderName=${downloadURL}`,
  //       {
  //         responseType: "blob",
  //       }
  //     );

  //     if (response.data) {
  //       const url = window.URL.createObjectURL(
  //         new Blob([response.data], { type: "application/pdf" })
  //       );

  //       const now = new Date();
  //       const formattedDate = now
  //         .toISOString()
  //         .slice(0, 19)
  //         .replace("T", " ")
  //         .replace(/:/g, "-");
  //       const dynamicFilename = `Invoice - ${formattedDate}.pdf`;

  //       const link = document.createElement("a");
  //       link.href = url;
  //       link.setAttribute("download", `"${dynamicFilename}"`);
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //       window.URL.revokeObjectURL(url);

  //       toast.success("File downloaded successfully.", toastOptions);
  //       setShowDownloadBtn(false);
  //       setDownloadURL("");
  //     } else {
  //       toast.error("Failed to download file.", toastOptions);
  //     }
  //   } catch (error: any) {
  //     toast.error(error.message, toastOptions);
  //   }
  // };

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
                      {/* PDF File Upload */}
                      <input
                        className="w-full text-sm text-gray-900 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        id="file_input_pdf"
                        type="file"
                        accept=".pdf"
                        onChange={(e) => handleChange(e, "pdf")}
                      />
                      <p
                        className={`mt-1 text-sm ${pdfFileError
                          ? "text-red-500 dark:text-red-300"
                          : "text-gray-500 dark:text-gray-500"
                          } `}
                      >
                        {pdfFileError
                          ? pdfFileError
                          : "Upload your .pdf file here."}
                      </p>
                    </td>
                    <td className="px-6 py-8 font-medium text-gray-900 whitespace-nowrap dark:text-white text-start">
                      {/* CSV/Excel File Upload */}
                      <input
                        className="w-full text-sm text-gray-900 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                        id="file_input_csv_excel"
                        type="file"
                        accept=".csv, .xlsx"
                        onChange={(e) => handleChange(e, "csv-excel")}
                      />
                      <p
                        className={`mt-1 text-sm ${csvExcelFileError
                          ? "text-red-500 dark:text-red-300"
                          : "text-gray-500 dark:text-gray-500"
                          } `}
                      >
                        {csvExcelFileError
                          ? csvExcelFileError
                          : "Upload your .csv or .xlsx file here."}
                      </p>
                    </td>
                    <td className="flex px-6 py-8 justify-center w-full">

                      {/* <button
                          id="downloadClick"
                          className={`flex gap-[15px] bg-[#259916] text-white text-sm font-semibold px-4 py-2.5 rounded-md ${showDownloadBtn
                              ? ""
                              : "cursor-not-allowed opacity-50"
                            }`}
                          onClick={handleDownload}
                        >
                          Download
                        </button> */}
                      <button
                        className={`flex gap-[15px] bg-[#1492c8] text-white text-sm font-semibold px-4 py-2.5 rounded-md ${disabled || !bothFilesSelected
                          ? "cursor-not-allowed opacity-50"
                          : ""
                          }`}
                        onClick={bothFilesSelected ? handleUpload : undefined}
                      >
                        Upload
                        {disabled && <Spinner />}
                      </button>

                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default FileUpload;