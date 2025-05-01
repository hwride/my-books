import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputFileProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (files?: FileList) => void
}

function InputFile({ className, onChange, ...props }: InputFileProps) {
  const ref = React.useRef<HTMLInputElement>(null)
  const [hasFile, setHasFile] = React.useState(false)

  const clearInput = () => {
    if (ref.current) {
      ref.current.value = ''
      setHasFile(false)
      onChange(undefined)
    }
  }

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (evt) => {
    setHasFile(
      Boolean(ref.current && ref.current.files && ref.current.files.length > 0)
    )
    if (onChange) onChange(ref.current?.files ?? undefined)
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        className={cn(
          'w-full cursor-pointer py-1 text-sm font-medium',
          'file:me-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-50 file:transition-colors file:hover:bg-slate-900/90 file:focus-visible:outline-none file:focus-visible:ring-1 file:focus-visible:ring-slate-400 file:dark:bg-slate-50 file:dark:text-slate-900 file:dark:hover:bg-slate-50/90 dark:focus-visible:ring-slate-800',
          className
        )}
        ref={ref}
        onChange={onFileChange}
        {...props}
      />
      {hasFile && (
        <button
          type="button"
          onClick={clearInput}
          disabled={!hasFile}
          className={cn(
            'rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600'
          )}
        >
          Clear
        </button>
      )}
    </div>
  )
}

InputFile.displayName = 'InputFile'

export { InputFile }
