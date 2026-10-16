
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  UploadCloud,
  FileText,
  FileCheck2,
  X,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  LoaderCircle,
} from 'lucide-react'
import { config } from '../config'
import { validateFile } from '../utils'
import { invoiceApi, errMsg } from '../services/invoiceApi'

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]

const ACCEPTED_EXTENSIONS = /\.(pdf|png|jpe?g|webp)$/i

export default function UploadPage() {
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // config.js uses maxMB, not maxUploadSize.
  const maxSize = (Number(config.maxMB) || 10) * 1024 * 1024

  const addFiles = (incomingFiles) => {
    setError('')
    setSuccess('')

    const selected = Array.from(incomingFiles || [])
    if (!selected.length) return

    const validFiles = []
    const errors = []

    for (const file of selected) {
      const validType =
        ACCEPTED_TYPES.includes(file.type) ||
        ACCEPTED_EXTENSIONS.test(file.name)

      if (!validType) {
        errors.push(
          `${file.name}: Unsupported file type. Choose PDF, PNG, JPG, or WEBP.`,
        )
        continue
      }

      if (file.size > maxSize) {
        errors.push(
          `${file.name}: File exceeds the ${Math.round(maxSize / (1024 * 1024))} MB upload limit.`,
        )
        continue
      }

      const validation = validateFile(file)

      if (validation !== true && validation != null) {
        const message =
          typeof validation === 'string'
            ? validation
            : validation?.message

        if (message) {
          errors.push(`${file.name}: ${message}`)
          continue
        }
      }

      validFiles.push(file)
    }

    setFiles((current) => {
      const combined = [...current]

      for (const file of validFiles) {
        const duplicate = combined.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified,
        )

        if (!duplicate) combined.push(file)
      }

      return combined
    })

    if (errors.length) {
      setError(errors.join(' '))
    }
  }

  const removeFile = (index) => {
    setFiles((current) => current.filter((_, i) => i !== index))
    setError('')
    setSuccess('')
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)

    if (!uploading) {
      addFiles(event.dataTransfer.files)
    }
  }

  const handleUpload = async () => {
    if (!files.length || uploading) return

    setUploading(true)
    setProgress(0)
    setError('')
    setSuccess('')

    let uploadedCount = 0

    try {
      for (const file of files) {
        await invoiceApi.upload(file, (fileProgress) => {
          const overallProgress =
            ((uploadedCount + fileProgress / 100) / files.length) * 100

          setProgress(Math.min(99, Math.round(overallProgress)))
        })

        uploadedCount += 1
        setProgress(Math.round((uploadedCount / files.length) * 100))
      }

      setSuccess(
        `${uploadedCount} ${uploadedCount === 1 ? 'invoice has' : 'invoices have'} been uploaded successfully.`,
      )

      setFiles([])

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      // Notify other parts of the app that invoice records may have changed.
      window.dispatchEvent(
        new CustomEvent('invoiceiq-invoices-updated'),
      )

      window.setTimeout(() => {
        navigate('/invoices')
      }, 1000)
    } catch (uploadError) {
      setError(
        typeof uploadError?.message === 'string' &&
          uploadError.message
          ? errMsg(uploadError)
          : 'Upload failed. Please check your connection and try again.',
      )
    } finally {
      setUploading(false)
    }
  }

  const clearFiles = () => {
    if (uploading) return

    setFiles([])
    setError('')
    setSuccess('')

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <main className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">DOCUMENT PROCESSING</p>
          <h1>Upload invoices</h1>
          <p className="page-description">
            Add invoice documents to your workspace for processing and review.
          </p>
        </div>

        <Link to="/invoices" className="button button-secondary">
          <ArrowLeft size={16} />
          View invoices
        </Link>
      </div>

      <div className="upload-layout">
        <section className="panel upload-panel">
          <div className="panel-header">
            <div>
              <h2>Add your documents</h2>
              <p className="muted-text">
                Select one or multiple invoice files.
              </p>
            </div>
          </div>

          <div
            className={`dropzone ${dragging ? 'dropzone-active' : ''}`}
            onDragOver={(event) => {
              event.preventDefault()
              if (!uploading) setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => {
              if (!uploading) fileInputRef.current?.click()
            }}
            onKeyDown={(event) => {
              if (
                !uploading &&
                (event.key === 'Enter' || event.key === ' ')
              ) {
                event.preventDefault()
                fileInputRef.current?.click()
              }
            }}
            role="button"
            tabIndex={uploading ? -1 : 0}
            aria-disabled={uploading}
            aria-label="Choose invoice files or drop them here"
          >
            <div className="dropzone-icon">
              <UploadCloud size={30} />
            </div>

            <h3>Drag and drop your files here</h3>
            <p>or click to browse your device</p>

            <span className="button button-secondary">
              Choose files
            </span>

            <p className="dropzone-hint">
              PDF, PNG, JPG, or WEBP · Up to{' '}
              {Math.round(maxSize / (1024 * 1024))} MB per file
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
              multiple
              hidden
              disabled={uploading}
              onChange={(event) => {
                addFiles(event.target.files)
                event.target.value = ''
              }}
            />
          </div>

          {error && (
            <div className="inline-alert upload-alert" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="inline-success" role="status">
              <CheckCircle2 size={18} />
              <span>{success}</span>
            </div>
          )}

          {files.length > 0 && (
            <div className="selected-files">
              <div className="selected-files-heading">
                <div>
                  <h3>Selected files</h3>
                  <p className="muted-text">
                    {files.length}{' '}
                    {files.length === 1 ? 'document' : 'documents'} ready
                  </p>
                </div>

                <button
                  type="button"
                  className="text-button"
                  onClick={clearFiles}
                  disabled={uploading}
                >
                  Clear all
                </button>
              </div>

              {files.map((file, index) => (
                <div
                  className="selected-file"
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                >
                  <div className="selected-file-icon">
                    <FileText size={20} />
                  </div>

                  <div className="selected-file-info">
                    <strong>{file.name}</strong>
                    <span>
                      {file.size < 1024 * 1024
                        ? `${Math.max(1, Math.round(file.size / 1024))} KB`
                        : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                    </span>
                  </div>

                  <CheckCircle2
                    size={18}
                    className="file-ready-icon"
                  />

                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X size={17} />
                  </button>
                </div>
              ))}

              {uploading && (
                <div className="upload-progress">
                  <div className="upload-progress-heading">
                    <span>Uploading files...</span>
                    <span>{progress}%</span>
                  </div>

                  <div
                    className="upload-progress-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                    aria-label="Upload progress"
                  >
                    <div
                      className="upload-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                className="button button-primary upload-submit"
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
              >
                {uploading ? (
                  <>
                    <LoaderCircle
                      size={17}
                      className="loading-icon"
                    />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadCloud size={17} />
                    Upload {files.length}{' '}
                    {files.length === 1 ? 'invoice' : 'invoices'}
                  </>
                )}
              </button>
            </div>
          )}
        </section>

        <aside className="upload-sidebar">
          <section className="panel upload-info-card">
            <div className="info-card-icon">
              <FileCheck2 size={21} />
            </div>

            <h3>What happens next?</h3>

            <div className="process-step">
              <span>1</span>
              <div>
                <strong>Upload</strong>
                <p>Add your invoice documents to the workflow.</p>
              </div>
            </div>

            <div className="process-step">
              <span>2</span>
              <div>
                <strong>Process</strong>
                <p>
                  Your configured invoice service handles the documents.
                </p>
              </div>
            </div>

            <div className="process-step">
              <span>3</span>
              <div>
                <strong>Review</strong>
                <p>
                  Open your invoice records and verify the extracted information.
                </p>
              </div>
            </div>
          </section>

          <section className="panel upload-security-card">
            <ShieldCheck size={21} />
            <div>
              <h3>Before you upload</h3>
              <p>
                Make sure you have permission to upload these documents.
                Only upload information needed for your workflow.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}
