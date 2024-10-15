import axios from 'axios'
import { toast, ToastOptions } from 'react-toastify'

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
export const callApi = async (
  url: string,
  formData: FormData,
  responseType: 'blob' | 'json' | 'text' = 'blob'
) => {
  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      responseType // Dynamic responseType
    })
    return response
  } catch (error: any) {
    toast.error(error.message || "An error occurred.", toastOptions)

    throw error
  }
}
