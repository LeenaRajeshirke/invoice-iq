// Single entry point for the UI. Endpoint paths live ONLY here (to confirm with backend teammate).
// In live mode there is NO silent fallback to mock data: errors propagate to the UI.
import axios from 'axios'
import { config } from '../config'
import { mapInvoice, toInvoiceUpdate } from './mappers'
import { mockApi } from './mockInvoiceApi'
const http=axios.create({baseURL:config.baseUrl,timeout:30000})
export function errMsg(e){
  if(e.code==='ECONNABORTED')return 'The request timed out. Check that the backend is running and try again.'
  if(e.request&&!e.response)return `Cannot reach the backend at ${config.baseUrl}. Is FastAPI running?`
  if(e.response){const d=e.response.data?.detail;return `Server error ${e.response.status}${typeof d==='string'?': '+d:''}`}
  return e.message||'Unexpected error.'
}
const enc=encodeURIComponent
const live={
  health:()=>http.get('/health').then(r=>r.data),
  list:()=>http.get('/invoices').then(r=>{const a=Array.isArray(r.data)?r.data:r.data?.items;if(!Array.isArray(a))throw new Error('Malformed invoice list response.');return a.map(mapInvoice)}),
  get:id=>http.get(`/invoices/${enc(id)}`).then(r=>mapInvoice(r.data)),
  getFile:()=>null,
  upload:async(file,onProgress)=>{const fd=new FormData();fd.append('file',file)
    const response=await http.post('/invoices/upload',fd,{onUploadProgress:e=>e.total&&onProgress?.(Math.round(e.loaded*100/e.total))})
    const id=response.data?.invoice_id??response.data?.id
    if(id==null)throw new Error('Upload response did not include an invoice ID.')
    return http.get(`/invoices/${enc(id)}`).then(r=>mapInvoice(r.data))},
  save:(id,data)=>http.patch(`/invoices/${enc(id)}`,toInvoiceUpdate(data)).then(r=>mapInvoice(r.data)),
  setReview:(id,status)=>http.post(`/invoices/${enc(id)}/review`,{status}).then(r=>mapInvoice(r.data)),
  export:format=>http.get(`/invoices/export/${enc(format)}`,{responseType:'blob'}).then(r=>r.data),
}
export const invoiceApi=config.mode==='live'?live:mockApi
