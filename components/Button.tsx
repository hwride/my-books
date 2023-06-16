import { clsx } from 'clsx'
import { ButtonHTMLAttributes } from 'react'
export function Button({
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        className,
        'rounded-full bg-black px-2 py-1 text-white disabled:opacity-50'
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
