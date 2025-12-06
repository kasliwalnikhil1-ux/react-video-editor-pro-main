'use client'

import { ToastProvider } from "../../contexts/toast-context"
import { Toaster } from "../ui/toaster"

export function ToastProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Toaster />
    </ToastProvider>
  )
}

