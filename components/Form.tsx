import { FormEvent, FormHTMLAttributes } from 'react'

/**
 * A progressively enhanced form. Allows the form to work without JS. If
 * JS is enabled will disable default behaviour and make a fetch request with
 * the form data as a JSON object.
 */
export function Form({
  method,
  action,
  children,
  onSubmit,
  isUpdatePending,
  setIsUpdatePending,
  onSuccess,
  onError,
  ...rest
}: FormHTMLAttributes<HTMLFormElement> & {
  isUpdatePending: boolean
  setIsUpdatePending: (isUpdatePending: boolean) => void
  onSuccess: (data: any) => void
  onError: (data: any) => void
}) {
  async function onSubmitInner(e: FormEvent<HTMLFormElement>) {
    // Block default form behaviour as we're going to do it in JS instead.
    e.preventDefault()

    setIsUpdatePending(true)

    // Read all data from the form and convert to a JS object.
    const form = e.currentTarget
    const data = new FormData(form)
    const formDataKeys = Array.from(data.keys())
    const body: Record<string, string> = {
      returnCreated: 'true',
    }
    for (const key of formDataKeys) {
      const val = data.get(key)
      if (typeof val === 'string') {
        body[key] = val
      }
    }

    // Make form request.
    const options = {
      method: form.method,
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(body),
    }
    const r = await fetch(form.action, options)

    if (r.ok) {
      const data = await r.json()
      onSuccess(data)
    } else {
      onError(data)
    }

    setIsUpdatePending(false)
  }

  return (
    <form method={method} action={action} onSubmit={onSubmitInner} {...rest}>
      {children}
    </form>
  )
}
