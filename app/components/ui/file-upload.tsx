"use client"

import { Upload } from "lucide-react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"

export interface FileUploadProps {
  onFileSelect: (file: File) => void
  maxSize?: number // en bytes, por defecto 10MB
  acceptedTypes?: string[] // e.g. ['image/jpeg', 'image/png', 'application/pdf']
}

export function FileUpload({ 
  onFileSelect, 
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  acceptedTypes = ['image/jpeg', 'image/png', 'application/pdf'] 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      const file = acceptedFiles[0]
      if (file.size > maxSize) {
        alert('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.')
        return
      }
      if (!acceptedTypes.includes(file.type)) {
        alert('Tipo de archivo no permitido. Por favor, sube un archivo JPG, PNG o PDF.')
        return
      }
      onFileSelect(file)
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
    multiple: false
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed ${
        isDragActive ? 'border-[#3e6b47] dark:border-[#4e8c57]' : 'border-gray-300 dark:border-gray-700'
      } rounded-lg p-8 flex flex-col items-center justify-center mb-6 transition-colors duration-200 cursor-pointer
      hover:border-[#3e6b47] dark:hover:border-[#4e8c57]`}
    >
      <input {...getInputProps()} />
      <Upload size={40} className={`${
        isDragActive ? 'text-[#3e6b47] dark:text-[#4e8c57]' : 'text-gray-400 dark:text-gray-500'
      } mb-4`} />
      <p className="text-center text-gray-600 dark:text-gray-400 mb-2 text-black dark:text-white">
        {isDragActive ? 'Suelta el archivo aquí' : 'Selecciona o arrastra el archivo deseado'}
      </p>
      <p className="text-center text-gray-400 dark:text-gray-500 text-sm mb-6 text-black dark:text-white">
        JPG, PNG o PDF, tamaño máximo 10MB
      </p>
      <button
        type="button"
        className="bg-[#3e6b47] dark:bg-[#4e8c57] text-white px-6 py-2 rounded-md uppercase hover:bg-[#345a3c] dark:hover:bg-[#3e7a47] transition-colors duration-200"
        onClick={(e) => {
          e.stopPropagation()
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = acceptedTypes.join(',')
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
              if (file.size > maxSize) {
                alert('El archivo es demasiado grande. El tamaño máximo permitido es 10MB.')
                return
              }
              if (!acceptedTypes.includes(file.type)) {
                alert('Tipo de archivo no permitido. Por favor, sube un archivo JPG, PNG o PDF.')
                return
              }
              onFileSelect(file)
            }
          }
          input.click()
        }}
      >
        Seleccionar archivo
      </button>
    </div>
  )
} 