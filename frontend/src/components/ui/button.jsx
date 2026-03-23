import * as React from "react"
import { cn } from "@/lib/utils"
export const Button = React.forwardRef(({ className, ...props }, ref) => (
  <button ref={ref} className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2", className)} {...props} />
))
Button.displayName = "Button"