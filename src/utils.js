import { config } from './config'
export const money=(v,cur='INR')=>v==null||v===''?'—':new Intl.NumberFormat('en-IN',{style:'currency',currency:cur||'INR'}).format(v)
export const fmtDate=d=>{if(!d)return '—';const x=new Date(d);return isNaN(x)?'Invalid date':x.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
// Backend may send 0-1 or 0-100; we only convert for display.
export const confPct=v=>v==null||isNaN(v)?null:Math.round((v<=1?v*100:v))
export const confLevel=p=>p==null?'na':p>=config.high?'high':p>=config.mid?'mid':'low'
const ALLOWED={pdf:['application/pdf'],png:['image/png'],jpg:['image/jpeg'],jpeg:['image/jpeg']}
export function validateFile(f){
  const ext=f.name.split('.').pop().toLowerCase()
  if(!ALLOWED[ext])return 'Unsupported file type. Use PDF, PNG, JPG or JPEG.'
  if(f.type&&!ALLOWED[ext].includes(f.type))return 'File content type does not match its extension.'
  if(f.size>config.maxMB*1024*1024)return `File is too large. Maximum size is ${config.maxMB} MB.`
  if(f.size===0)return 'File is empty.'
  return null
}
export const sizeStr=b=>b>1048576?(b/1048576).toFixed(2)+' MB':(b/1024).toFixed(1)+' KB'
export function download(name,text,type){const u=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)}
const esc=v=>{const s=v==null?'':String(v);return /[",\n\r]/.test(s)?`"${s.replace(/"/g,'""')}"`:s}
// CSV: ONE ROW PER LINE ITEM, invoice columns repeated (no line data is dropped).
export function toCsv(i){
  const h=['invoice_number','vendor','invoice_date','currency','subtotal','tax_amount','discount_amount','total_amount','review_status','line_description','quantity','unit_price','line_tax_amount','line_tax_rate','line_total']
  const rows=(i.lineItems.length?i.lineItems:[{}]).map(l=>[i.invoiceNumber,i.vendor.name,i.invoiceDate,i.currency,i.subtotal,i.taxAmount,i.discount,i.totalAmount,i.reviewStatus,l.description,l.quantity,l.unitPrice,l.taxAmount,l.taxRate,l.total])
  return '\uFEFF'+[h,...rows].map(r=>r.map(esc).join(',')).join('\r\n')
}
export const toJson=i=>JSON.stringify({invoiceNumber:i.invoiceNumber,vendor:i.vendor,customer:i.customer,invoiceDate:i.invoiceDate,dueDate:i.dueDate,currency:i.currency,subtotal:i.subtotal,taxAmount:i.taxAmount,discountAmount:i.discount,totalAmount:i.totalAmount,lineItems:i.lineItems,reviewStatus:i.reviewStatus,validationWarnings:i.validationWarnings},null,2)
