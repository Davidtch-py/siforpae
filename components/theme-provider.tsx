"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"
type FontSize = "normal" | "large" | "extra-large"

interface ThemeContextType {
  theme: Theme
  fontSize: FontSize
  setTheme: (theme: Theme) => void
  setFontSize: (size: FontSize) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light")
  const [fontSize, setFontSize] = useState<FontSize>("normal")

  useEffect(() => {
    // Check if theme and fontSize are stored in localStorage
    const storedTheme = localStorage.getItem("theme") as Theme | null
    const storedFontSize = localStorage.getItem("fontSize") as FontSize | null

    if (storedTheme) {
      setTheme(storedTheme)
    }

    if (storedFontSize) {
      setFontSize(storedFontSize)
    }
  }, [])

  useEffect(() => {
    // Update document class when theme changes
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }

    // Store theme in localStorage
    localStorage.setItem("theme", theme)
  }, [theme])

  useEffect(() => {
    // Update document class when font size changes
    const root = document.documentElement
    
    // Remove all font size classes first
    root.classList.remove("text-normal", "text-large", "text-extra-large")
    
    // Add the new font size class
    root.classList.add(`text-${fontSize}`)

    // Store font size in localStorage
    localStorage.setItem("fontSize", fontSize)

    // Log for debugging
    console.log("Font size changed to:", fontSize)
    console.log("Current classes:", root.classList.toString())
  }, [fontSize])

  const value = {
    theme,
    fontSize,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
    },
    setFontSize: (newSize: FontSize) => {
      setFontSize(newSize)
      console.log("Setting font size to:", newSize)
    },
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
