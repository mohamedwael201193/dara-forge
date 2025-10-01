import { cn } from "@/lib/utils"
import * as React from "react"

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

export function Select({ children, value: _value, onValueChange: _onValueChange }: SelectProps) {
  return (
    <div className="relative">
      {children}
    </div>
  )
}

export function SelectTrigger({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span>{placeholder}</span>
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md">
      {children}
    </div>
  )
}

export function SelectItem({ children, value: _value }: { children: React.ReactNode; value: string }) {
  return (
    <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
      {children}
    </div>
  )
}