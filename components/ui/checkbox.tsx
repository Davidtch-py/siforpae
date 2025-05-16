"use client"

import { Check } from "lucide-react"
import { useState } from "react"

interface CheckboxProps {
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
}

export function Checkbox({ checked = false, onChange, disabled = false }: CheckboxProps) {
  const [isChecked, setIsChecked] = useState(checked)

  const handleClick = () => {
    if (disabled) return

    const newValue = !isChecked
    setIsChecked(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <div
      className={`w-6 h-6 border border-gray-300 bg-white dark:bg-gray-800 cursor-pointer flex items-center justify-center ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={handleClick}
    >
      {isChecked && <Check size={16} className="text-[#3e6b47] dark:text-[#4e8c57]" />}
    </div>
  )
}
