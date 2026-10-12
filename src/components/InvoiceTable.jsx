import { Link } from 'react-router-dom'
import { ArrowDown, ArrowUp, ArrowUpDown, ArrowUpRight } from 'lucide-react'
import { StatusBadge } from './common'
import { money, fmtDate } from '../utils'
export default function InvoiceTable({rows,sort,onSort,compact=false}){
  const columns=compact?[
    ['invoiceNumber','Invoice'],['vendor','Vendor'],['reviewStatus','Review'],
  ]:[
    ['invoiceNumber','Invoice'],['vendor','Vendor'],['invoiceDate','Invoice date'],['totalAmount','Amount'],['processingStatus','Processing'],['reviewStatus','Review'],['updatedAt','Updated'],
  ]
  const header=(key,label)=><th key={key} aria-sort={sort?.key===key?(sort.dir>0?'ascending':'descending'):'none'}>{onSort?<button className="table-sort" onClick={()=>onSort(key)}>{label}{sort?.key===key?(sort.dir>0?<ArrowUp size={12}/>:<ArrowDown size={12}/>):<ArrowUpDown size={11} className="opacity-40"/>}</button>:label}</th>
  return <div className="table-wrap"><table className="invoice-table"><thead><tr>{columns.map(([key,label])=>header(key,label))}<th scope="col"><span className="sr-only">Open invoice</span></th></tr></thead>
  <tbody>{rows.map(invoice=><tr key={invoice.id}>
    <td className="table-primary"><span className="table-clip" title={invoice.invoiceNumber||`Invoice #${invoice.id}`}>{invoice.invoiceNumber||<span className="text-slate-400">Invoice #{invoice.id}</span>}</span>{!compact&&<small className="table-id">ID {invoice.id}</small>}</td>
    <td><span className="table-clip" title={invoice.vendor.name||'Vendor not identified'}>{invoice.vendor.name||<span className="text-slate-400">Vendor not identified</span>}</span></td>
    {!compact&&<><td>{fmtDate(invoice.invoiceDate)}</td><td className="table-primary">{money(invoice.totalAmount,invoice.currency)}</td><td><StatusBadge value={invoice.processingStatus}/></td></>}
    <td><StatusBadge kind="review" value={invoice.reviewStatus}/></td>
    {!compact&&<td>{fmtDate(invoice.updatedAt)}</td>}
    <td className="text-right"><Link className="table-link inline-flex items-center gap-1" aria-label={`Review invoice ${invoice.invoiceNumber||invoice.id}`} to={`/invoices/${invoice.id}/review`}>{compact?'Open':'Review'}<ArrowUpRight size={13}/></Link></td>
  </tr>)}</tbody></table></div>
}
