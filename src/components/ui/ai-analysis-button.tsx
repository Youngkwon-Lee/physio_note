import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { BrainCircuit } from "lucide-react"

interface AIAnalysisButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
}

export function AIAnalysisButton({ className, isLoading, children, ...props }: AIAnalysisButtonProps) {
  return (
    <Button
      className={cn("gap-2", className)}
      disabled={isLoading}
      {...props}
    >
      <BrainCircuit className="h-4 w-4" />
      {isLoading ? "분석 중..." : children || "AI 분석 시작"}
    </Button>
  )
} 