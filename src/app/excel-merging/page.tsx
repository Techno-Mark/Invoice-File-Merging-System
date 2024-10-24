'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loader from '@/public/loder.gif';
import { callApi } from '@/services/apiService';
import { Invoice, DownloadInvoice } from '@/services/endpoint/Invoice';
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
  const [singleExcelFile, setSingleExcelFile] = useState<File | null>(null);
  const [previousMonthFile, setPreviousMonthFile] = useState<File | null>(null);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [secondPhase, setSecondPhase] = useState<boolean>(false);
  const [excelFileError, setExcelFileError] = useState<string | null>(null);
  const [singleExcelFileError, setSingleExcelFileError] = useState<
    string | null
  >(null);
  const [previousMonthFileError, setPreviousMonthFileError] = useState<
    string | null
  >(null);

  const firstFilesSelected = excelFiles.length !== 0 && !excelFileError;
  const secondFilesSelected =
    singleExcelFile !== null &&
    !singleExcelFileError &&
    previousMonthFile !== null &&
    !previousMonthFileError;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    isSingleExcel = false,
    isPreviousMonth = false
  ) => {
    const files = e.target.files;
    if (!files) return;

    const selectedFiles = Array.from(files);
    const invalidFile = selectedFiles.some(
      (file) => !file.name.endsWith('.xlsx')
    );
    const largeFile = selectedFiles.some(
      (file) => file.size > 100 * 1024 * 1024
    );

    if (invalidFile) {
      const error = 'Please upload a valid Excel file (.xlsx).';
      isSingleExcel
        ? setSingleExcelFileError(error)
        : isPreviousMonth
          ? setPreviousMonthFileError(error)
          : setExcelFileError(error);
      return;
    }

    if (largeFile) {
      const error = 'File too large.';
      isSingleExcel
        ? setSingleExcelFileError(error)
        : isPreviousMonth
          ? setPreviousMonthFileError(error)
          : setExcelFileError(error);
      return;
    }

    if (isSingleExcel) {
      setSingleExcelFileError(null);
      setSingleExcelFile(selectedFiles[0]);
    } else if (isPreviousMonth) {
      setPreviousMonthFileError(null);
      setPreviousMonthFile(selectedFiles[0]);
    } else {
      if (selectedFiles.length < 1 || selectedFiles.length > 3) {
        setExcelFileError('Please upload min 1 or max 3 files.');
      } else {
        setExcelFileError(null);
        setExcelFiles(selectedFiles);
      }
    }
  };

  const processFileDownload = (response: any, filenamePrefix: string) => {
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
    const dynamicFilename = `${filenamePrefix} - ${formattedDate}.xlsx`;

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', dynamicFilename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleApiCall = async (
    apiEndpoint: string,
    formData: FormData,
    setFiles: () => void,
    successPhase: boolean
  ) => {
    try {
      const response = await callApi(apiEndpoint, formData, 'blob');

      if (response.status === 200) {
        toast.success('Files processed successfully.', toastOptions);
        processFileDownload(
          response,
          successPhase ? 'MergeInvoice' : 'Invoice'
        );
        setFiles();
      } else {
        toast.error('Failed to process the files.', toastOptions);
      }
    } catch (error: any) {
      // Error already handled inside callApi
    } finally {
      setDisabled(false);
    }
  };

  const handleDownloadMergeExel = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabled(true);

    const formData = new FormData();
    excelFiles.forEach((file) => formData.append('files', file));

    await handleApiCall(
      Invoice.invoiceMerge,
      formData,
      () => {
        setExcelFiles([]);
        setSecondPhase(true);
      },
      true
    );
  };

  const handleDownloadInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisabled(true);

    const formData = new FormData();
    singleExcelFile && formData.append('file', singleExcelFile);
    previousMonthFile && formData.append('newFile', previousMonthFile);

    await handleApiCall(
      DownloadInvoice.downloadInvoice,
      formData,
      () => {
        setSingleExcelFile(null);
        setPreviousMonthFile(null);
        setSecondPhase(false);
      },
      false
    );
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
                          <label
                            htmlFor="file_input_csv_excel"
                            className="font-bold text-gray-800 dark:text-white"
                          >
                            Upload Excel {secondPhase ? 'File ' : 'Files '}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            className={`${
                              secondPhase ? 'w-96' : 'w-[830px]'
                            } text-sm text-gray-900 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400`}
                            id="file_input_csv_excel"
                            type="file"
                            accept=".xlsx"
                            multiple={!secondPhase}
                            onChange={(e) =>
                              secondPhase
                                ? handleFileChange(e, true, false)
                                : handleFileChange(e)
                            }
                          />
                          <p
                            className={`mt-1 text-sm ${
                              excelFileError ? 'text-red-500' : 'text-gray-500'
                            }`}
                          >
                            {secondPhase
                              ? singleExcelFileError ||
                                'Please upload exactly 1 Excel (.xlsx) file.'
                              : excelFileError ||
                                'Please upload min 1 or max 3 (.xlsx) files.'}
                          </p>
                        </div>
                        {secondPhase && (
                          <div className="flex flex-col px-6">
                            <label
                              htmlFor="previous_month_file"
                              className="font-bold text-gray-800 dark:text-white"
                            >
                              Upload Previous Month File{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              className="w-96 text-sm text-gray-900 border border-gray-300 cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                              id="previous_month_file"
                              type="file"
                              accept=".xlsx"
                              onChange={(e) => handleFileChange(e, false, true)}
                            />
                            <p
                              className={`mt-1 text-sm ${
                                previousMonthFileError
                                  ? 'text-red-500'
                                  : 'text-gray-500'
                              }`}
                            >
                              {previousMonthFileError ||
                                'Please upload the previous month Excel file.'}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-col px-6">
                          <button
                            className={`w-48 bg-[#1492c8] hover:bg-[#2082ac] text-white font-bold py-2 px-4 rounded ${
                              (secondPhase && !secondFilesSelected) ||
                              (!secondPhase && !firstFilesSelected)
                                ? 'opacity-60 cursor-not-allowed'
                                : ''
                            }`}
                            onClick={
                              !firstFilesSelected
                                ? handleDownloadInvoice
                                : handleDownloadMergeExel
                            }
                            disabled={
                              secondPhase
                                ? !secondFilesSelected
                                : !firstFilesSelected
                            }
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
