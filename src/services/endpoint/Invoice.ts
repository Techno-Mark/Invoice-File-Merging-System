const commonPrefix = "invoice"
const API_URL = process.env.NEXT_PUBLIC_API_URL

export const Invoice = {
  invoiceMerge: `${API_URL}/${commonPrefix}/invoiceMerge`
}