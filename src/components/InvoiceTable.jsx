import { Link } from 'react-router-dom'
import { StatusBadge } from './common'
import { money, fmtDate } from '../utils'
export default function InvoiceTable({rows,sort,onSort}){
  const th=(k,l)=><th className="text-left p-2 font-medium">{onSort?<button onClick={()=>onSort(k)} className="hover:underline">{l}{sort?.key===k?(sort.dir>0?' ▲':' ▼'):''}</button>:l}</th>
  return <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{th('invoiceNumber','Invoice #')}{th('vendor','Vendor')}{th('invoiceDate','Date')}{th('totalAmount','Total')}{th('processingStatus','Processing')}{th('reviewStatus','Review')}{th('updatedAt','Updated')}<th/></tr></thead>
  <tbody>{rows.map(i=><tr key={i.id} className="border-t"><td className="p-2">{i.invoiceNumber||'—'}</td><td className="p-2">{i.vendor.name||'—'}</td><td className="p-2">{fmtDate(i.invoiceDate)}</td><td className="p-2">{money(i.totalAmount,i.currency)}</td><td className="p-2"><StatusBadge value={i.processingStatus}/></td><td className="p-2"><StatusBadge kind="review" value={i.reviewStatus}/></td><td className="p-2">{fmtDate(i.updatedAt)}</td><td className="p-2"><Link className="text-indigo-600 hover:underline" to={`/invoices/${i.id}/review`}>Review</Link></td></tr>)}</tbody></table></div>
}
