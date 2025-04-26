import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputFileProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputFile = React.forwardRef<HTMLInputElement, InputFileProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="file"
        className={cn(
          'px-1 py-1 text-sm font-medium',
          'file:rounded-md file:bg-slate-900 file:text-sm file:font-medium file:text-slate-50 file:transition-colors file:hover:bg-slate-900/90 file:focus-visible:outline-none file:focus-visible:ring-1 file:focus-visible:ring-slate-400 file:dark:bg-slate-50 file:dark:text-slate-900 file:dark:hover:bg-slate-50/90 dark:focus-visible:ring-slate-800',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
InputFile.displayName = 'InputFile'

export { InputFile }
