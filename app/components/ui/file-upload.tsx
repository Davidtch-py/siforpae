"use client"

import { Upload } from "lucide-react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"

export interface FileUploadProps {
  onFileSelect: (file: File) => Promise<void>
  maxSize?: number // en bytes, por defecto 10MB
  acceptedTypes?: string[] // e.g. ['image/jpeg', 'image/png', 'application/pdf']
  onError?: (error: string) => void
}

export function FileUpload({ 
  onFileSelect, 
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  onError
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelection = async (file: File) => {
    try {
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.')
      }
      if (!acceptedTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no permitido. Por favor, sube un archivo JPG, PNG o PDF.')
      }
      
      setIsUploading(true)
      await onFileSelect(file)
      setIsUploading(false)
    } catch (error) {
      setIsUploading(false)
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar el archivo'
      onError?.(errorMessage)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      handleFileSelection(acceptedFiles[0])
    }
  }, [maxSize, acceptedTypes, onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    },
    maxSize,
    multiple: false,
    disabled: isUploading
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed ${
        isDragActive ? 'border-[#3e6b47] dark:border-[#4e8c57]' : 'border-gray-300 dark:border-gray-700'
      } rounded-lg p-8 flex flex-col items-center justify-center mb-6 transition-colors duration-200 ${
        isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } hover:border-[#3e6b47] dark:hover:border-[#4e8c57]`}
    >
      <input {...getInputProps()} disabled={isUploading} />
      <Upload size={40} className={`${
        isDragActive ? 'text-[#3e6b47] dark:text-[#4e8c57]' : 'text-gray-400 dark:text-gray-500'
      } mb-4`} />
      <p className="text-center text-gray-600 dark:text-gray-400 mb-2 text-black dark:text-white">
        {isUploading ? 'Subiendo archivo...' : 
         isDragActive ? 'Suelta el archivo aquí' : 
         'Selecciona o arrastra el archivo deseado'}
      </p>
      <p className="text-center text-gray-400 dark:text-gray-500 text-sm mb-6 text-black dark:text-white">
        JPG, PNG o PDF, tamaño máximo 10MB
      </p>
      <button
        type="button"
        disabled={isUploading}
        className={`bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md uppercase transition-colors duration-200 ${
          isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#345a3c] dark:hover:bg-[#3e7a47]'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          if (isUploading) return

          const input = document.createElement('input')
          input.type = 'file'
          input.accept = acceptedTypes.join(',')
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
              handleFileSelection(file)
            }
          }
          input.click()
        }}
      >
        {isUploading ? 'Subiendo...' : 'Seleccionar archivo'}
      </button>
    </div>
  )
} 