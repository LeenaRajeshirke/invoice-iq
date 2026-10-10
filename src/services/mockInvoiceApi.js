// In-memory DEMO service. Nothing is analysed by OCR/AI here. Data resets on page reload.
import { demoInvoices } from '../data/demo'
let db=structuredClone(demoInvoices)
const files=new Map()
const find=id=>{const i=db.find(x=>x.id===id);if(!i)throw new Error('Invoice not found.');return i}
export const mockApi={
  health:async()=>({ok:true,demo:true}),
  list:async()=>structuredClone(db),
  get:async id=>structuredClone(find(id)),
  getFile:id=>files.get(id)||null,
  upload:async file=>{const id='upload-'+Date.now();files.set(id,file)
    db.unshift({id,invoiceNumber:null,vendor:{name:'',address:'',taxId:''},customer:{name:'',address:'',taxId:''},invoiceDate:null,dueDate:null,currency:'INR',paymentTerms:null,subtotal:null,taxAmount:null,discount:null,totalAmount:null,lineItems:[],processingStatus:'uploaded',reviewStatus:'pending',confidence:{},validationWarnings:[{message:'Demo mode: this file was NOT analysed. Enter values manually or switch to live mode.',severity:'info'}],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),originalFileUrl:null})
    return structuredClone(db[0])},
  save:async(id,data)=>{const i=db.findIndex(x=>x.id===id);if(i<0)throw new Error('Invoice not found.');db[i]={...db[i],...data,updatedAt:new Date().toISOString()};return structuredClone(db[i])},
  setReview:async(id,s)=>{const i=find(id);i.reviewStatus=s;i.updatedAt=new Date().toISOString();return structuredClone(i)},
}
