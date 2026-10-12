// Explicit mapping of backend responses -> frontend model. Update ONLY here when the contract changes.
// Processing status and review status are separate properties on purpose.
export const PROCESSING={uploaded:'Uploaded',processing:'Processing',completed:'Completed',failed:'Failed'}
export const REVIEW={pending:'Pending',needs_review:'Needs Review',reviewed:'Reviewed',rejected:'Rejected'}
const alias={queued:'uploaded',pending:'uploaded',running:'processing',done:'completed',success:'completed',error:'failed'}
export function mapInvoice(r){
  if(!r||typeof r!=='object'||!(r.id??r.invoice_id)) throw new Error('Malformed invoice response from server.')
  const g=(a,b)=>r[a]??r[b]??null
  const ps=String(g('processingStatus','processing_status')||'uploaded').toLowerCase()
  const rs=g('reviewStatus','review_status')
  const statusAlias={...alias,placeholder:'uploaded',processed:'completed'}
  const rawWarnings=g('validationWarnings','validation_warnings')||[]
  return {...r,id:String(r.id??r.invoice_id),invoiceNumber:g('invoiceNumber','invoice_number'),
    vendor:{name:r.vendor?.name??r.vendor_name??'',address:r.vendor?.address??'',taxId:r.vendor?.taxId??r.vendor?.tax_id??''},
    customer:{name:r.customer?.name??'',address:r.customer?.address??'',taxId:r.customer?.taxId??r.customer?.tax_id??''},
    invoiceDate:g('invoiceDate','invoice_date'),dueDate:g('dueDate','due_date'),currency:r.currency??null,
    paymentTerms:g('paymentTerms','payment_terms'),subtotal:r.subtotal??null,taxAmount:g('taxAmount','tax_amount'),
    discount:g('discount','discount_amount')??g('discountAmount','discount_amount'),totalAmount:g('totalAmount','total_amount'),
    lineItems:(r.lineItems||r.line_items||[]).map((l,i)=>({id:l.id||`line-${i}`,description:l.description??'',quantity:l.quantity??null,unitPrice:l.unitPrice??l.unit_price??null,taxAmount:l.taxAmount??l.tax_amount??null,taxRate:l.taxRate??l.tax_rate??null,total:l.total??l.totalAmount??l.total_amount??null})),
    processingStatus:PROCESSING[statusAlias[ps]||ps]?(statusAlias[ps]||ps):'uploaded',
    reviewStatus:REVIEW[rs]?rs:'pending',
    confidence:r.confidence&&typeof r.confidence==='object'?r.confidence:{},
    validationWarnings:rawWarnings.map(w=>typeof w==='string'?{message:w,severity:'warning'}:w),
    createdAt:g('createdAt','created_at'),updatedAt:g('updatedAt','updated_at'),originalFileUrl:g('originalFileUrl','original_file_url')}
}

export function toInvoiceUpdate(invoice){
  return {
    invoice_number:invoice.invoiceNumber,
    vendor_name:invoice.vendor?.name,
    invoice_date:invoice.invoiceDate,
    due_date:invoice.dueDate,
    currency:invoice.currency,
    subtotal:invoice.subtotal,
    tax_amount:invoice.taxAmount,
    discount_amount:invoice.discount??invoice.discountAmount,
    total_amount:invoice.totalAmount,
    line_items:(invoice.lineItems||[]).map(item=>({
      description:item.description,
      quantity:item.quantity,
      unit_price:item.unitPrice,
      tax_amount:item.taxAmount,
      total_amount:item.total,
    })),
  }
}
