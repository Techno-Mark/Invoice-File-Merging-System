 
import { toast } from "react-toastify"

const API_URL = process.env.NEXT_PUBLIC_API_URL

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      
      throw new Error("Unauthorized. Token missing or expired")
    } else if (response.status === 422) {
      const errorResponse = await response.json()
      const { message, data } = errorResponse
      if (message === "validation error" && data) {
        const errors = Object.keys(data).map((key) => `${key}: ${data[key]}`)
        toast.error(errors.join("; "))
        throw new Error("Validation error1")
      } else {
        toast.error(message || "Validation error")
        throw new Error(message || "Validation error")
      }
    } else if (response.status === 400) {
      const errorResponse = await response.json()
      const { message, data } = errorResponse
      if (message === "validation error" && data && typeof data === "object") {
        const errors = Object.values(data).map((errorMessage) => errorMessage)
        toast.error(errors.join("; "))
        throw new Error("Validation error")
      } else {
        toast.error(message || "Validation error")
        throw new Error(message || "Validation error")
      }
    } else if (
      response.status === 403 ||
      response.status === 400 ||
      response.status === 500
    ) {
      const errorResponse = await response.json()
      toast.error(errorResponse.message)
    } else {
      // Other errors
      const error = await response.text()
      toast.error(error)
      throw new Error(error)
    }
  }
  return await response.json()
}

export const fetchData = async (
  endpoint: string,
  options: any = {}
) => {
  try {
  
    
  

    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
       
        ...options.headers
      }
    })
    return await handleResponse(response)
  } catch (error: any) {
    console.error("Error fetching data:", error)
    // toast.error(error.message);
    throw error
  }
}

export const get = (endpoint: string) => fetchData(endpoint)

export const post = (endpoint: string, data: any) =>
  fetchData(endpoint, {
    method: "POST",
    body: JSON.stringify(data)
  })

export const put = (endpoint: string, data: any) =>
  fetchData(endpoint, {
    method: "PUT",
    body: JSON.stringify(data)
  })

export const del = (endpoint: string) =>
  fetchData(endpoint, {
    method: "DELETE"
  })

export const postContentBlock = async (endpoint: string, data: any) => {
  try {
    
    
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      
      body: data
    })

    return await handleResponse(response)
  } catch (error: any) {
    console.error("Error fetching data:", error)
    // toast.error(error.message);
    throw error
  }
}

export const postDataToOrganizationAPIs = async (
  endpoint: string,
  data: any
) => {
  try {
    
     

    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        
      },
      body: JSON.stringify(data)
    })

    return await handleResponse(response)
  } catch (error: any) {
    console.error("Error fetching data:", error)
    // toast.error(error.message);
    throw error
  }
}

export const withoutAuthPost = async (
  endpoint: string,
  data: any,
  options: any = {}
) => {
  try {
    
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      ...options,
      headers: {
        "Content-Type": "application/json",
        
        ...options.headers
      },
      body: JSON.stringify(data)
    })

    return await handleResponse(response)
  } catch (error: any) {
    console.error("Error fetching data:", error)
    throw error
  }
}
