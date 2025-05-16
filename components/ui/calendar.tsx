"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CalendarProps {
  value: Date | null
  onChange: (date: Date) => void
  onClose: () => void
}

export function Calendar({ value, onChange, onClose }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(value ? new Date(value) : new Date())

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onChange(selectedDate)
    onClose()
  }

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth())
    const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth())

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        value &&
        value.getDate() === day &&
        value.getMonth() === currentMonth.getMonth() &&
        value.getFullYear() === currentMonth.getFullYear()

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${
            isSelected ? "bg-[#3e6b47] text-white" : "hover:bg-[#e6e3d3]"
          }`}
        >
          {day}
        </button>,
      )
    }

    return days
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-md p-3 w-64">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="font-medium">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="h-8 w-8 flex items-center justify-center text-xs text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
    </div>
  )
}
