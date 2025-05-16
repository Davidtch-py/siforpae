"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { es } from 'date-fns/locale'

interface CalendarProps {
  value?: Date
  onChange: (date: Date) => void
  onClose: () => void
}

export function Calendar({ value, onChange, onClose }: CalendarProps) {
  return (
    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-[350px] w-full">
      <DayPicker
        mode="single"
        selected={value}
        onSelect={(date) => date && onChange(date)}
        locale={es}
        showOutsideDays={true}
        className="w-full"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4 w-full",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium text-black dark:text-white",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-black dark:text-white rounded-md w-9 font-normal text-[0.8rem] flex-1",
          row: "flex w-full mt-2",
          cell: "text-center text-sm relative p-0 flex-1",
          day: "h-9 w-9 p-0 font-normal text-black dark:text-white aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md mx-auto flex items-center justify-center",
          day_selected: "bg-[#3e6b47] dark:bg-[#4e8c57] text-white hover:bg-[#3e6b47] dark:hover:bg-[#4e8c57] hover:text-white focus:bg-[#3e6b47] dark:focus:bg-[#4e8c57] focus:text-white",
          day_today: "bg-gray-100 dark:bg-gray-700 text-black dark:text-white",
          day_outside: "text-gray-400 dark:text-gray-500 opacity-50",
          day_disabled: "text-gray-400 dark:text-gray-500 opacity-50",
          day_range_middle: "aria-selected:bg-gray-100 dark:aria-selected:bg-gray-800 aria-selected:text-black dark:aria-selected:text-white",
          day_hidden: "invisible",
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        }}
      />
    </div>
  )
} 