const commonPrefix = "invoice"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export const Invoice = {
  invoiceMerge: `${API_URL}/${commonPrefix}/invoiceMerge`
}
