import * as React from "react"

interface TooltipProviderProps {
  children: React.ReactNode
}

export function TooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function TooltipTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function TooltipContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}