'use client'

import React, { useState, useRef } from 'react'

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      if (validateFile(selectedFile)) {
        setFile(selectedFile)
        resetStatus()
      }
    }
    // Reset inputs so the same file selection triggers change again
    e.target.value = ''
  }

  const validateFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setStatus('error')
      setMessage('Solo se permiten archivos PDF o Imágenes (JPG, PNG, WEBP).')
      return false
    }
    // Optional: add size check (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setStatus('error')
      setMessage('El archivo excede el límite de 5MB.')
      return false
    }
    return true
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      if (validateFile(droppedFile)) {
        setFile(droppedFile)
        resetStatus()
      }
    }
  }

  const resetStatus = () => {
    setStatus('idle')
    setMessage('')
  }

  const uploadFile = async () => {
    if (!file) return

    setStatus('uploading')
    setMessage('Subiendo...')

    // Usar la URL directa expuesta al cliente
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://coy-personal-n8n.l2p5bx.easypanel.host/webhook/procesador-facturas';
    const apiKey = process.env.NEXT_PUBLIC_WEBHOOK_API_KEY || 'rJbYEKt4p4QU7O7EmfkrUvEU0bHjv54a';

    const formData = new FormData()
    formData.append('file', file)

    try {
      console.log('Iniciando subida directa a:', webhookUrl);

      const res = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'miapikey': apiKey,
          // 'Content-Type': 'multipart/form-data', // NO AGREGAR ESTO MANUALMENTE CON FETCH, el navegador lo hace solo con el boundary correcto
        }
      })

      // n8n a veces devuelve texto plano o JSON
      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Error en el webhook de n8n')
      }

      setStatus('success')
      setMessage('¡Factura enviada correctamente!')
      setFile(null)
    } catch (error: any) {
      console.error('Upload error:', error)
      setStatus('error')
      setMessage(`Error: ${error.message}. Verifica si n8n permite conexiones (CORS).`)
    }
  }

  return (
    <main className="container">
      <div className="card">
        <h1 className="title">Facturas AI</h1>
        <p className="subtitle">Sube tu factura (PDF o Imagen) para procesar</p>

        <div
          className={`upload-area ${isDragging ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,image/*"
            style={{ display: 'none' }}
          />

          <svg className="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>

          <p style={{ fontWeight: 500 }}>
            {isDragging ? 'Suelta el archivo aquí' : 'Haz clic o arrastra un archivo'}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#71717a' }}>Soporta PDF, JPG, PNG (Max 5MB)</p>
        </div>

        {file && (
          <div className="file-preview">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span style={{ fontSize: '0.875rem' }}>{file.name}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); resetStatus(); }}
              style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              aria-label="Remove file"
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <button
          className="btn"
          onClick={uploadFile}
          disabled={!file || status === 'uploading'}
          style={{ opacity: (!file || status === 'uploading') ? 0.7 : 1 }}
        >
          {status === 'uploading' ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Enviando...
            </>
          ) : 'Enviar Factura'}
        </button>

        {message && (
          <div className={`status ${status}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  )
}
