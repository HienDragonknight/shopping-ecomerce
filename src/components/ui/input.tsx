import * as React from "react"

import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#1A1A1A] ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#999] focus-visible:outline-none focus-visible:border-[#1A1A1A] focus-visible:ring-2 focus-visible:ring-[#1A1A1A]/30 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
