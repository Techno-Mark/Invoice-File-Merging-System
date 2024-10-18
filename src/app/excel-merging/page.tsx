'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loader from '@/public/loder.gif';
import { callApi } from '@/services/apiService';
import { Invoice } from '@/services/endpoint/Invoice';
import Spinner from '@/icon/Spinner';

const toastOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light'
};

const ExcelMerging = () => {
  const [excelFiles, setExcelFiles] = useState<File[]>([]);
  const [previousMonthFile, setPreviousMonthFile] = useState<File | null>(null);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [excelFileError, setExcelFileError] = useState<string | null>(null);
  const [previousMonthFileError, setPreviousMonthFileError] = useState<string | null>(null);

  const allFilesSelected = excelFiles.length === 3 && !excelFileError && previousMonthFile !== null && !previousMonthFileError;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isPreviousMonth = false) => {
    const files = e.target.files;
    if (files) {
      const selectedFiles = Array.from(files);

      if (isPreviousMonth) {
        // Validation for previous month file
        const invalidFile = selectedFiles.some(
          (file) => !file.name.endsWith('.xlsx')
        );
        const largeFile = selectedFiles.some((file) => file.size > 100 * 1024 * 1024);

        if (invalidFile) {
          setPreviousMonthFileError('Please upload a valid Excel file (.xlsx).');
        } else if (largeFile) {
          setPreviousMonthFileError('File too large.');
        } else {
          setPreviousMonthFileError(null);
          setPreviousMonthFile(selectedFiles[0]);
        }
      } else {
        // Validation for 3 Excel files
        if (selectedFiles.length !== 3) {
          setExcelFileError('Please upload exactly three Excel files.');
        } else {
          const invalidFile = selectedFiles.some(
            (file) => !file.name.endsWith('.xlsx')
          );
          const largeFile = selectedFiles.some((file) => file.size > 100 * 1024 * 1024);

          if (invalidFile) {
            setExcelFileError('Please upload valid Excel files (.xlsx).');
          } else if (largeFile) {
            setExcelFileError('File too large.');
          } else {
            setExcelFileError(null);
            setExcelFiles(selectedFiles);
          }
        }
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabled(true);

    if (excelFiles.length !== 3) {
      toast.error('Please select exactly three Excel files.', toastOptions);
      setDisabled(false);
      return;
    }

    if (!previousMonthFile) {
      toast.error('Please upload the previous month Excel file.', toastOptions);
      setDisabled(false);
      return;
    }

    const formData = new FormData();
    excelFiles.forEach((file) => formData.append('files', file));
    formData.append('newFile', previousMonthFile);

    try {
      const response = await callApi(Invoice.invoiceMerge, formData, 'blob');

      if (response.status === 200) {
        toast.success('Files processed successfully.', toastOptions);

        const url = window.URL.createObjectURL(
          new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
        );
        const now = new Date();
        const formattedDate = now
          .toISOString()
          .slice(0, 19)
          .replace('T', ' ')
          .replace(/:/g, '-');
        const dynamicFilename = `Invoice - ${formattedDate}.xlsx`;
        toast.success('File downloaded successfully.', toastOptions);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', dynamicFilename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setExcelFiles([]);
        setPreviousMonthFile(null);
      } else {
        toast.error('Failed to process the files.', toastOptions);
      }
    } catch (error: any) {
      // Error already handled inside callApi
    } finally {
      setDisabled(false);
    }
  };

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

              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <tbody>
                  <div className="text-sm font-semibold uppercase text-white bg-[#1492c8] dark:bg-bg-[#1492c8] dark:text-white p-4">
                    Excel Merging
                  </div>
                  <tr className="bg-white dark:bg-gray-800 dark:border-gray-700 text-center">
                    <td className=" py-8 font-medium text-gray-900 whitespace-nowrap dark:text-white text-start">
                      <div className="flex flex-row items-center">
                        <div className="flex flex-col px-6">
                          <label htmlFor="file_input_csv_excel" className="font-bold text-gray-800 dark:text-white">
                            Upload Excel Files <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-96 text-sm text-gray-900 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            id="file_input_csv_excel"
                            type="file"
                            accept=".xlsx"
                            multiple
                            onChange={(e) => handleFileChange(e)}
                          />
                          <p className={`mt-1 text-sm ${excelFileError ? 'text-red-500' : 'text-gray-500'}`}>
                            {excelFileError || 'Please upload exactly 3 Excel (.xlsx) files.'}
                          </p>
                        </div>

                        <div className="flex flex-col px-6">
                          <label htmlFor="previous_month_file" className="font-bold text-gray-800 dark:text-white">
                            Upload Previous Month File  <span className="text-red-500">*</span>
                          </label>
                          <input
                            className="w-96 text-sm text-gray-900 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            id="previous_month_file"
                            type="file"
                            accept=".xlsx"
                            onChange={(e) => handleFileChange(e, true)}
                          />
                          <p className={`mt-1 text-sm ${previousMonthFileError ? 'text-red-500' : 'text-gray-500'}`}>
                            {previousMonthFileError || 'Please upload the previous month Excel file.'}
                          </p>
                        </div>

                        <div className="flex flex-col px-6">
                          <button
                            className={`w-48 bg-[#1492c8] hover:bg-[#2082ac] text-white font-bold py-2 px-4 rounded ${!allFilesSelected || disabled ? 'opacity-60 cursor-not-allowed' : ''
                              }`}
                            onClick={handleUpload}
                            disabled={!allFilesSelected || disabled}
                          >
                            Merge Files
                            {disabled && <Spinner />}
                          </button>
                        </div>
                      </div>
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

export default ExcelMerging;
