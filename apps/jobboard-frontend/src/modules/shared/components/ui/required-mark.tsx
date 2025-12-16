import { cn } from "@shared/lib/utils"

type RequiredMarkProps = {
  className?: string
  srText?: string
}

function RequiredMark({ className, srText = "Required" }: RequiredMarkProps) {
  return (
    <span className={cn("inline-flex items-center leading-none", className)}>
      <sup
        className="relative top-[1px] text-destructive text-xs leading-none"
        aria-hidden="true"
      >
        *
      </sup>
      <span className="sr-only">{srText}</span>
    </span>
  )
}

export { RequiredMark }

